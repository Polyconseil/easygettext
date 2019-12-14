const {Parser} = require('acorn');
const stage3 = require('acorn-stage3');
const babel = require('@babel/core');
const {getTextEntries} = require('./extract-utils.js');

const {DEFAULT_VUE_GETTEXT_FUNCTIONS} = require('./constants.js');

function extractConcatenatedStrings(value, allTokens, index) {
  const nextToken = allTokens[index + 1];

  if (nextToken.type.label === ')') {
    return value;
  }
  const nextValue = allTokens[index + 2].value;
  return value + extractConcatenatedStrings(nextValue, allTokens, index + 2);
}


function getGettextEntriesFromJavaScript(script, parser = 'auto') {
  const allTokens = [];

  switch (parser) {
  case 'acorn':
    const ACORN_OPTIONS = {
      ecmaVersion: 10,
      sourceType: 'module',
      locations: true,
      onToken: allTokens,
      plugins: {
        stage3: true,
      },
    };

    Parser.extend(stage3).parse(script, ACORN_OPTIONS);
    break;
  case 'babel':
    const babelResult = babel.parseSync(script, {
      sourceType: 'module',
      parserOpts: {
        tokens: true,
      },
    });
    allTokens.push(...babelResult.tokens);
    break;
  case 'auto':
  default:
    try {
      return getGettextEntriesFromJavaScript(script, 'acorn');
    } catch (e) {
      return getGettextEntriesFromJavaScript(script, 'babel');
    }
  }


  let extractedEntries = [];

  // parse all tokens
  for (let i = 0; i < allTokens.length; i = i + 1) {
    let token = allTokens[i];
    for (let gettextFunc in DEFAULT_VUE_GETTEXT_FUNCTIONS) {
      if (
        token.value === gettextFunc
        && token.type.label !== 'string' // disallows strings containing magic values: we identify FUNCTIONS
        && allTokens[i + 1].type.label === '('  // cheap check to see if it was actually a function call. It's this or a whole parsing of the location.
      ) {
        const args = DEFAULT_VUE_GETTEXT_FUNCTIONS[gettextFunc];
        const gettextData = args.reduce(function(obj, argName, argIndex) {
          // Gets the arguments to $gettext, $pgettext, etc. from the tokens.
          // In $pgettext('context string', msgid') :
          // $pgettext is at index i
          // ( is at index i+1
          // 'context string' is at index i+2
          // , is at index i+3
          // 'msgid' is at index i+4
          const currentTokenIndex = i + 2 * (argIndex + 1);
          const currentToken = allTokens[currentTokenIndex];
          if (currentToken.type.label === '`') {
            const nextToken = allTokens[currentTokenIndex + 1];
            const closingToken = allTokens[currentTokenIndex + 2];

            if (closingToken.type.label !== '`') {
              const line = currentToken.loc.start.line;
              throw new Error(`easygettext currently does not support translated template strings with variables! [line ${line}]`);
            }
            obj[argName] = nextToken.value.trim();
            return obj;
          }

          const nextToken = allTokens[i + 2 * (argIndex + 1) + 1];
          let valueToTranslate = currentToken.value;

          if (nextToken.value === '+') {
            valueToTranslate = extractConcatenatedStrings(valueToTranslate, allTokens, currentTokenIndex);
          }
          obj[argName] = valueToTranslate;
          return obj;
        }, {});

        // Fill objects that contain both the initial token context in the source, and the gettext data.
        extractedEntries.push({
          data: gettextData,
          token: token,
        });
      }
    }
  }

  return extractedEntries;
}

function extractStringsFromJavascript(filename, script, parser = 'auto') {
  return getTextEntries(filename, getGettextEntriesFromJavaScript(script, parser));
}

module.exports = {
  extractStringsFromJavascript,
};
