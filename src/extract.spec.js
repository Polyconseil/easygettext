import {Extractor} from './extract.js';
import * as constants from './constants.js';
import * as fixtures from './test-fixtures.js';

import {expect} from 'chai';


describe('Extractor object', () => {

  it('should output a correct POT file from the supplied HTML', () => {
    const extractor = new Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML0_CTX0);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_0);
  });

  it('should output a correct POT file from multiple HTML fixtures', () => {
    const extractor = new Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML0_CTX0);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML1_PLURAL0);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_1);
  });

  it('should output a correct POT file with multiple contexts', () => {
    const extractor = new Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML0_CTX0);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML0_CTX1);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_CONTEXTS);
  });

  it('should output a correct POT file using keyword as tag', () => {
    const extractor = new Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML4_TAG0);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML4_TAG1);
    extractor.parse(fixtures.FILENAME_2, fixtures.HTML4_TAG2);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_TAGS);
  });

  it('should only translate a html block once', () => {
    const extractor = new Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML4_TAG3);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_MULTIPLE_TAGS);
  });

  it('should merge multiple references correctly and not duplicate', () => {
    const extractor = new Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML0_CTX0);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML0_CTX0);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML0_CTX0);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_MULTIREF);
  });

  it('should merge multiple comments correctly and not duplicate', () => {
    const extractor = new Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML2_COMMENT0);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML2_COMMENT1);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML2_COMMENT1);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_MULTICOMMENTS);
  });

  it('should fail when plurals dont match', () => {
    const extractor = new Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML1_PLURAL0);
    expect(() => extractor.parse(fixtures.FILENAME_1, fixtures.HTML1_PLURAL1))
      .to.throw(Error, `Incompatible plural definitions for I work: 'We work' !== 'Us works'`);
  });

  it('should lexicographically sort the translations', () => {
    const extractor = new Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML_SORTING);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_SORTED);
  });

});


describe('Raw translation data', () => {
  const extractor = new Extractor();

  it('should extract data and metadata correctly', () => {
    const data = extractor._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML0_CTX0);
    expect(data.length).to.equal(1);
    expect(data[0].text).to.equal('Hello world');
    expect(data[0].reference.file).to.equal(fixtures.FILENAME_0);
    expect(data[0].reference.line).to.equal(2);
    expect(data[0].context).to.equal('For charlie');
    expect(data[0].comment).to.be.a('null');
    expect(data[0].plural).to.be.a('null');
  });

  it('should correctly render the reference', () => {
    const data = extractor._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML0_CTX0);
    expect(data[0].reference.toString(true)).to.equal('foo.htm:2');
  });

  it('should extract multiple tokens correctly', () => {
    const data = extractor._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_LONG);
    expect(data.length).to.equal(7);
    expect(data[1].context).to.equal(constants.MARKER_NO_CONTEXT);
    expect(data[3].comment).to.equal('foo is important');
    expect(data[6].reference.line).to.equal(13);
  });

  it('should extract filters with various patterns', () => {
    const data0 = extractor._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML3_FILTER0);
    expect(data0.length).to.equal(1);
    expect(data0[0].text).to.equal('Hola, hombre');
    expect(data0[0].comment).to.equal('Fugazy');

    const data1 = extractor._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML3_FILTER1);
    expect(data1.length).to.equal(1);
    expect(data1[0].text).to.equal('Hola, mujer');

    const data2 = extractor._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML3_FILTER2);
    expect(data2.length).to.equal(1);
    expect(data2[0].text).to.equal('Hola, hola');

    const data3 = extractor._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML3_FILTER3);
    expect(data3.length).to.equal(1);
    expect(data3[0].text).to.equal('So long, my dear');

    const extractorWithParams = new Extractor({
      startDelimiter: '',
      endDelimiter: '',
    });
    const data4 = extractorWithParams._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML3_FILTER4);
    expect(data4.length).to.equal(1);
    expect(data4[0].text).to.equal('So long, my dear');
  });
});
