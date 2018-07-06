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
  poItem.msgctxt = this.msgctxt;
  poItem.msgstr = [];

  return poItem;
}

function hasStringAContext(token) {
  return DEFAULT_VUE_GETTEXT_FUNCTIONS[ token.value ].includes('msgctxt');
}

function getGettextParameterIndex(token, targetParameter) {
  return DEFAULT_VUE_GETTEXT_FUNCTIONS[ token.value ].indexOf(targetParameter);
}

function getContext(token, gettextAttributes) {
  if (! hasStringAContext(token)) {
    return MARKER_NO_CONTEXT;
  }

  const { msgctxt } = gettextAttributes[
    getGettextParameterIndex(token, 'msgctxt')
  ];

  return msgctxt;
}

function getNodeTranslationInfoRepresentation(filename, token, expression) {
  const gettextAttributes = getGettextAttributes(token, expression);
  const context           = getContext(token, gettextAttributes);

  return Object.assign(
    {},
    ...gettextAttributes,
    {
      reference: {
        file: filename,
        line: token.loc.start.line,
        toString,
      },
      context,
      toPoItem,
    }
  );
}

module.exports = {
  getNodeTranslationInfoRepresentation,
};
