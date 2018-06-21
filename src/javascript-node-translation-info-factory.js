const Pofile                = require('pofile');
const { MARKER_NO_CONTEXT } = require('./constants.js');

function toString(withLineNumbers = false) {
  return (withLineNumbers && this.line)
    ? `${ this.file }:${ this.line }`
    : this.file;
}

function toPoItem(withLineNumbers = false) {
  let poItem = new Pofile.Item();

  poItem.msgid      = this.text;
  poItem.references = [ this.reference.toString(withLineNumbers) ];
  poItem.msgstr     = [];

  return poItem;
}

function getNodeTranslationInfo(filename, localizedString, lineNumber) {
  return {
    text: localizedString,
    reference: {
      file: filename,
      line: lineNumber,
      toString,
    },
    context: MARKER_NO_CONTEXT,
    toPoItem,
  };
}

module.exports = {
  getNodeTranslationInfo,
};
