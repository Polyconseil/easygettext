#!/usr/bin/env node

/* eslint no-console:0 */

const fs = require('fs');
const minimist = require('minimist');

const constants = require('./constants.js');
const extract = require('./extract.js');

const PROGRAM_NAME = 'easygettext';
const ALLOWED_EXTENSIONS = ['html', 'htm', 'jade', 'js', 'pug', 'vue'];

// Process arguments
const argv = minimist(process.argv.slice(2));
const files = argv._.sort() || [];
const quietMode = argv.quiet || false;
const outputFile = argv.output || null;
const startDelimiter = argv.startDelimiter === undefined ? constants.DEFAULT_DELIMITERS.start : argv.startDelimiter;
const endDelimiter = argv.endDelimiter === undefined ? constants.DEFAULT_DELIMITERS.end : argv.endDelimiter;
// Allow to pass extra attributes, e.g. gettext-extract --attribute v-translate --attribute v-i18n
const extraAttribute = argv.attribute || false;
const extraFilter = argv.filter || false;
const filterPrefix = argv.filterPrefix || constants.DEFAULT_FILTER_PREFIX;

if (!quietMode && (!files || files.length === 0)) {
  console.log('Usage:\n\tgettext-extract [--attribute EXTRA-ATTRIBUTE] [--filterPrefix FILTER-PREFIX] [--output OUTFILE] <FILES>');
  process.exit(1);
}

function _getExtraNames(extraEntities, defaultEntities) {
  let attributes = defaultEntities.slice();
  if (extraEntities) {
    if (typeof extraEntities === 'string') {  // Only one extra attribute was passed.
      attributes.push(extraEntities);
    } else {  // Multiple extra attributes were passed.
      attributes = attributes.concat(extraEntities);
    }
  }
  return attributes;
}

const attributes = _getExtraNames(extraAttribute, constants.DEFAULT_ATTRIBUTES);
const filters = _getExtraNames(extraFilter, constants.DEFAULT_FILTERS);

// Extract strings
const extractor = new extract.Extractor({
  lineNumbers: true,
  attributes,
  filters,
  filterPrefix,
  startDelimiter,
  endDelimiter,
});


files.forEach(function(filename) {
  let file = filename;
  const ext = file.split('.').pop();
  if (ALLOWED_EXTENSIONS.indexOf(ext) === -1) {
    console.log(`[${PROGRAM_NAME}] will not extract: '${filename}' (invalid extension)`);
    return;
  }
  console.log(`[${PROGRAM_NAME}] extracting: '${filename}`);
  try {
    let data = fs.readFileSync(file, {encoding: 'utf-8'}).toString();
    extractor.parse(file, extract.preprocessTemplate(data, ext));

    if (ext !== 'js') {
      data = extract.preprocessScriptTags(data, ext);
    }

    extractor.parseJavascript(file, data);
  } catch (e) {
    console.error(`[${PROGRAM_NAME}] could not read: '${filename}`);
    console.trace(e);
    process.exit(1);
  }
});
if (outputFile) {
  fs.writeFileSync(outputFile, extractor.toString());
} else {
  console.log(extractor.toString());
}
