const acorn = require('acorn');
const constants = require('./constants.js');
const nodeTranslationInfoFactory = require('./node-translation-representation-factory.js');

function isAVueGettextFunction(token) {
  return constants.DEFAULT_VUE_GETTEXT_FUNCTIONS.includes(token.value);
}

function getGettextTokensFromScript(script) {
  const extractedTokens = [];

  const ACORN_OPTIONS = {
    ecmaVersion: 10,
    sourceType: 'module',
    locations: true,
    onToken: extractedTokens,
  };

  acorn.parse(script, ACORN_OPTIONS);

  return extractedTokens.filter(token => isAVueGettextFunction(token));
}

function getLocalizedStringsFromNode(filename, script, token) {
  const expression = acorn.parseExpressionAt(script, token.start);
  const localizedStrings = [];

  for (const argument of expression.arguments) {
    const nodeTranslation = nodeTranslationInfoFactory.getNodeTranslationInfoRepresentation(
      filename,
      argument.value,
      token.loc.start.line
    );

    localizedStrings.push(nodeTranslation);
  }

  return localizedStrings;
}

function extractStringsFromJavascript(filename, script) {
  const tokens =  getGettextTokensFromScript(script);
  const localizedStrings = [];

  for (const token of tokens) {
    localizedStrings.push(
      ...getLocalizedStringsFromNode(filename, script, token)
    );
  }

  return localizedStrings;
}

module.exports = {
  extractStringsFromJavascript,
};
