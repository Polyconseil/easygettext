const Pofile = require('pofile');
const {
  MARKER_NO_CONTEXT,
  DEFAULT_VUE_GETTEXT_FUNCTIONS,
} = require('./constants.js');

function toString(withLineNumbers = false) {
  return (withLineNumbers && this.line)
    ? `${ this.file }:${ this.line }`
    : this.file;
}

function getGettextAttributes(token, expression) {
  const gettextSignature = DEFAULT_VUE_GETTEXT_FUNCTIONS[ token.value ];
  const gettextParameters = expression.arguments;

  return gettextSignature.map((gettextParameterName, parameterIndex) => {
    if (! gettextParameterName) {
      return [];
    }

    const map = [];

    map[ gettextParameterName ] = gettextParameters[ parameterIndex ].value;

    return map;
  });
}

function toPoItem(withLineNumbers = false) {
  let poItem = new Pofile.Item();

  poItem.msgid = this.msgid;
  poItem.msgid_plural = this.plural;
  poItem.references = [ this.reference.toString(withLineNumbers) ];
  poItem.msgstr = [];

  return poItem;
}

function getNodeTranslationInfoRepresentation(filename, token, expression) {
  return Object.assign(
    {},
    ...getGettextAttributes(token, expression),
    {
      reference: {
        file: filename,
        line: token.loc.start.line,
        toString,
      },
      context: MARKER_NO_CONTEXT,
      toPoItem,
    }
  );
}

module.exports = {
  getNodeTranslationInfoRepresentation,
};
