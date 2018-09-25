const acorn = require('acorn-stage3');
const Pofile = require('pofile');

const {MARKER_NO_CONTEXT, DEFAULT_VUE_GETTEXT_FUNCTIONS} = require('./constants.js');

function lineNumToString(withLineNumbers = false) {
  return (withLineNumbers && this.line)
    ? `${ this.file }:${ this.line }`
    : this.file;
}

function toPoItem(withLineNumbers = false) {
  let poItem = new Pofile.Item();

  poItem.msgid = this.msgid;
  poItem.msgid_plural = this.plural;
  poItem.references = [ this.reference.toString(withLineNumbers) ];
  poItem.msgctxt = this.msgctxt === MARKER_NO_CONTEXT ? null : this.msgctxt;
  poItem.msgstr = [];

  return poItem;
}

function getGettextEntriesFromScript(script) {
  const allTokens = [];

  const ACORN_OPTIONS = {
    ecmaVersion: 10,
    sourceType: 'module',
    locations: true,
    onToken: allTokens,
    plugins: {
      stage3: true
    },
  };

  acorn.parse(script, ACORN_OPTIONS);

  let extractedEntries = [];

  for (let i = 0; i < allTokens.length; i = i + 1) {
    let token = allTokens[i];
    for (let gettextFunc in DEFAULT_VUE_GETTEXT_FUNCTIONS) {
      let args = DEFAULT_VUE_GETTEXT_FUNCTIONS[gettextFunc];
      if (
        token.value === gettextFunc
        && token.type.label !== 'string' // disallows strings containing magic values
        && allTokens[i + 1].type.label === '('  // cheap check to see if it was actually a function call. It's this or a whole parsing of the location.
      ) {
        const gettextData = args.reduce(function(obj, argName, argIndex) {
          // Gets the arguments to $gettext, $pgettext, etc. from the tokens.
          // In $pgettext('context string', msgid') :
          // $pgettext is at index i
          // ( is at index i+1
          // 'context string' is at index i+2
          // + is at index i+3
          // 'msgid' is at index i+4
          obj[argName] = allTokens[i + 2 * (argIndex + 1)].value;
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

function extractStringsFromJavascript(filename, script) {
  const gettextEntries =  getGettextEntriesFromScript(script);

  return gettextEntries.map((entry) => {
    return Object.assign(
      {},
      {
        reference: {
          file: filename,
          line: entry.token.loc.start.line,
          toString: lineNumToString,
        },
        msgctxt: MARKER_NO_CONTEXT,
        toPoItem,
      },
      entry.data
    );
  });
}

module.exports = {
  extractStringsFromJavascript,
};
