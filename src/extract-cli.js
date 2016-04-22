#!/usr/bin/env node

/* eslint no-console:0 */

import fs from 'fs';
import jade from 'jade';
import minimist from 'minimist';

import {Extractor} from './extract.js';

const PROGRAM_NAME = 'easygettext';
const ALLOWED_EXTENSIONS = ['html', 'htm', 'jade', 'pug'];

// Process arguments
const argv = minimist(process.argv.slice(2));
const files = argv._.sort();
const outputFile = argv.output || null;

if (!files || files.length === 0) {
  console.log('Usage:\n\tgettext-extract [--output OUTFILE] <FILES>');
  process.exit(1);
}


// Extract strings
const extractor = new Extractor({lineNumbers: true});
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
    if (ext === 'jade' || ext === 'pug') {
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
