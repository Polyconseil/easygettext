#!/usr/bin/env node

/* eslint no-console:0 */

import fs from 'fs';
import jade from 'jade';
import minimist from 'minimist';

import * as constants from './constants.js';
import {Extractor} from './extract.js';

const PROGRAM_NAME = 'easygettext';
const ALLOWED_EXTENSIONS = ['html', 'htm', 'jade', 'pug', 'vue'];

// Process arguments
const argv = minimist(process.argv.slice(2));
const files = argv._.sort() || [];
const quietMode = argv.quiet || false;
const outputFile = argv.output || null;
// Allow to pass extra attributes, e.g. gettext-extract --attribute v-translate --attribute v-i18n
const extraAttribute = argv.attribute || false;

if (!quietMode && (!files || files.length === 0)) {
  console.log('Usage:\n\tgettext-extract [--attribute EXTRA-ATTRIBUTE] [--output OUTFILE] <FILES>');
  process.exit(1);
}

let attributes = constants.DEFAULT_ATTRIBUTES.slice()
if (extraAttribute) {
  if (typeof extraAttribute === 'string') {  // Only one extra attribute was passed.
    attributes.push(extraAttribute)
  } else {  // Multiple extra attributes were passed.
    attributes = attributes.concat(extraAttribute)
  }
}

// Extract strings
const extractor = new Extractor({
  lineNumbers: true,
  attributes: attributes
});

files.forEach(function(filename) {
  let file =  filename;
  const ext = file.split('.').pop();
  if (ALLOWED_EXTENSIONS.indexOf(ext) === -1) {
    console.log(`[${PROGRAM_NAME}] will not extract: '${filename}' (invalid extension)`);
    return;
  }
  console.log(`[${PROGRAM_NAME}] extracting: '${filename}`);
  try {
    let data = fs.readFileSync(file, {encoding: 'utf-8'}).toString();
    if (['jade', 'pug'].includes(ext)) {
      file = file.replace(/\.(jade|pug)$/, '.html');
      // Add empty require function to the context to avoid errors with webpack require inside jade
      data = jade.render(data, {pretty: true, require: function(){}});
    }
    extractor.parse(file, data);
  } catch (e) {
    console.error(`[${PROGRAM_NAME}] could not read: '${filename}`);
    console.trace(e);
    process.exit(1);
  }
});
if (outputFile) {
  fs.writeFile(outputFile, extractor.toString());
} else {
  console.log(extractor.toString());
}
