#!/usr/bin/env node

/* eslint no-console:0 */

const fs = require('fs');
const compile = require('./compile.js');
const minimist = require('minimist');


// Process arguments
const argv = minimist(process.argv.slice(2));
const files = argv._.sort() || [];
const outputFile = argv.output || null;

if (!files) {
  console.log('Usage:\n\tcompile [--output OUTFILE] <FILES>');
  process.exit(1);
}

// Compile strings
const translationData = {};

for (let file of files) {
  console.log('[gettext] processing PO file:', file);
  try {
    const poContents = fs.readFileSync(file, {encoding: 'utf-8'}).toString();
    const data = compile.po2json(poContents);
    const lang = data.headers.Language;
    if (!translationData[lang]) {
      translationData[lang] = data.messages;
    } else {
      Object.assign(translationData[data.headers.Language], data.messages);
    }
  } catch (e) {
    console.error('[gettext] could not read:', file);
    console.trace(e);
    process.exit(1);
  }
}

// Output results
const translationString = JSON.stringify(translationData);
if (outputFile) {
  fs.writeFileSync(outputFile, translationString);
} else {
  console.log(translationString);
}
