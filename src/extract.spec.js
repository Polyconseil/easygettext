// https://github.com/jspm/jspm-cli/issues/535
import 'core-js/shim';

import {Extractor} from './extract.js';
import * as constants from './constants.js';
import * as fixtures from './test-fixtures.js';


describe('Extractor object', () => {

  it('should output a correct POT file from the supplied HTML', () => {
    const extractor = new Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML0_CTX0);
    expect(extractor.toString()).toEqual(fixtures.POT_OUTPUT_0);
  });

  it('should output a correct POT file from multiple HTML fitures', () => {
    const extractor = new Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML0_CTX0);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML1_PLURAL0);
    expect(extractor.toString()).toEqual(fixtures.POT_OUTPUT_1);
  });

  it('should output a correct POT file with multiple contexts', () => {
    const extractor = new Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML0_CTX0);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML0_CTX1);
    expect(extractor.toString()).toEqual(fixtures.POT_OUTPUT_CONTEXTS);
  });

  it('should merge multiple references between themselves', () => {
    const extractor = new Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML0_CTX0);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML0_CTX0);
    expect(extractor.toString()).toEqual(fixtures.POT_OUTPUT_MULTIREF);
  });

  it('should merge multiple comments correctly', () => {
    const extractor = new Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML2_COMMENT0);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML2_COMMENT1);
    expect(extractor.toString()).toEqual(fixtures.POT_OUTPUT_MULTICOMMENTS);
  });

  it('should fail when plurals dont match', () => {
    const extractor = new Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML1_PLURAL0);
    expect(() => extractor.parse(fixtures.FILENAME_1, fixtures.HTML1_PLURAL1))
      .toThrow(new Error(`Incompatible plural definitions for I work: 'We work' !== 'Us works'`));
  });

});


describe('Raw translation data', () => {
  const extractor = new Extractor();

  it('should extract data and metadata correctly', () => {
    const data = extractor._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML0_CTX0);
    expect(data.length).toBe(1);
    expect(data[0].text).toEqual('Hello world');
    expect(data[0].reference.file).toEqual(fixtures.FILENAME_0);
    expect(data[0].reference.line).toEqual(1);
    expect(data[0].context).toEqual('For charlie');
    expect(data[0].comment).toBe(null);
    expect(data[0].plural).toBe(null);
  });

  it('should correctly render the reference', () => {
    const data = extractor._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML0_CTX0);
    expect(data[0].reference.toString(true)).toEqual('foo.htm: 1');
  });

  it('should extract multiple tokens correctly', () => {
    const data = extractor._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_LONG);
    expect(data.length).toBe(7);
    expect(data[1].context).toBe(constants.MARKER_NO_CONTEXT);
    expect(data[3].comment).toBe('foo is important');
    expect(data[6].reference.line).toBe(12);
  });
});
