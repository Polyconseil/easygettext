const {walk} = require('estree-walker');
const {parseTSScript} = require('buntis');
const extractUtils = require('./extract-utils.js');

const {DEFAULT_VUE_GETTEXT_FUNCTIONS} = require('./constants.js');
const DEFAULT_VUE_GETTEXT_FUNCTIONS_KEYS = Object.keys(DEFAULT_VUE_GETTEXT_FUNCTIONS);


function getGettextFunctionName(obj) {
  if (obj.property && DEFAULT_VUE_GETTEXT_FUNCTIONS_KEYS.includes(obj.property.name)) {
    return obj.property.name;
  } else if (obj.object) {
    return getGettextFunctionName(obj.object);
  }
  return undefined;
}

function getTranslationString(obj, filename) {
  if (obj.type === 'Literal') {
    return obj.value;
  } else if (obj.type === 'TemplateLiteral') {
    if (obj.expressions && obj.expressions.length) {
      throw new Error(`easygettext currently does not support translated template strings with variables! [file ${filename}]`);
    }
    return obj.quasis.map(el => getTranslationString(el, filename)).join('');
  } else if (obj.type === 'TemplateElement') {
    return obj.value.cooked;
  } else if (obj.type === 'BinaryExpression' && obj.operator === '+') {
    return getTranslationString(obj.left, filename) + getTranslationString(obj.right, filename);
  }
  return '';
}

function getTranslationObject(node, gettextFunctionName, filename) {
  let gettextFunctionArgs = DEFAULT_VUE_GETTEXT_FUNCTIONS[gettextFunctionName];
  let translationEntry = {};
  for (let i = 0; i < gettextFunctionArgs.length; i += 1) {
    translationEntry[gettextFunctionArgs[i]] = getTranslationString(node.arguments[i], filename);
  }
  return {data: translationEntry, token: {loc: {start: {line: 0}}}};
}

function getGettextEntriesFromTypeScript(script, filename) {
  let translationEntries = [];
  walk(parseTSScript(script, {loc: true, next: true}), {
    enter: function(node) {
      if (node.type && node.type === 'CallExpression' && node.callee) {
        if (DEFAULT_VUE_GETTEXT_FUNCTIONS_KEYS.includes(node.callee.name)) {
          translationEntries.push(getTranslationObject(node, node.callee.name, filename));
        } else {
          let gettextFunctionName = getGettextFunctionName(node.callee);
          if (DEFAULT_VUE_GETTEXT_FUNCTIONS_KEYS.includes(gettextFunctionName)) {
            translationEntries.push(getTranslationObject(node, gettextFunctionName, filename));
          }
        }
      }
    },
  });
  return translationEntries;
}

function extractStringsFromTypeScript(filename, script) {
  return extractUtils.getTextEntries(filename, getGettextEntriesFromTypeScript(script, filename));
}

module.exports = {
  extractStringsFromTypeScript,
};
