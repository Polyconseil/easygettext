#!/usr/bin/env node

/* eslint no-console:0 */

import fs from 'fs';
import jade from 'jade';
import minimist from 'minimist';

import {Extractor} from './extract.js';

// Process arguments
const argv = minimist(process.argv.slice(2));
const files = argv._.sort() || [];
const outputFile = argv.output || null;

if (!files || files.length === 0) {
  console.log('Usage:\n\tgettext-extract [--output OUTFILE] <FILES>');
  process.exit(1);
}


// Extract strings
const extractor = new Extractor({lineNumbers: true});
files.forEach(function(filename) {
  console.log('[gettext] extracting', filename);
  try {
    let file =  filename;
    let data = fs.readFileSync(file, {encoding: 'utf-8'}).toString();
    const ext = file.split('.').pop();
    if (ext === 'jade') {
      file = file.replace(/\.jade$/, '.html');
      data = jade.render(data, {pretty: true});
    }
    extractor.parse(file, data);
  } catch (e) {
    console.error('[gettext] could not read:', filename);
    console.trace(e);
    process.exit(1);
  }
});
if (outputFile) {
  fs.writeFile(outputFile, extractor.toString());
} else {
  console.log(extractor.toString());
}
