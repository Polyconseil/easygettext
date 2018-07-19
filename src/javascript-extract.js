const acorn = require('acorn');
const { DEFAULT_VUE_GETTEXT_FUNCTIONS } = require('./constants.js');
const nodeTranslationInfoFactory = require('./node-translation-representation-factory.js');

function isAVueGettextFunction(token) {
  return DEFAULT_VUE_GETTEXT_FUNCTIONS.hasOwnProperty(token.value);
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
  let expression = acorn.parseExpressionAt(script, token.start);
  const localizedStrings = [];

  if (expression.type == 'SequenceExpression') {
    expression = expression.expressions[0];
  }

  if (expression.type == 'CallExpression') {
    const nodeTranslation = nodeTranslationInfoFactory.getNodeTranslationInfoRepresentation(
      filename,
      token,
      expression
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
