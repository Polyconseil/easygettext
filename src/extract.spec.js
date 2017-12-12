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
  const extractor = new Extractor({
    filterPrefix: '::'
  });

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

    const data5 = extractor._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML3_FILTER5);
    expect(data5.length).to.equal(1);
    expect(data5[0].text).to.equal('Guns\'n roses, my dear');

    const data6 = extractorWithParams._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML3_FILTER6);
    expect(data6.length).to.equal(1);
    expect(data6[0].text).to.equal('Guns\'n roses, my dear');

    const extractorWithBindOnce = new Extractor({
      startDelimiter: '',
      endDelimiter: '',
      filterPrefix: '::',
    });
    const data7 = extractorWithBindOnce._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML3_FILTER7);
    expect(data7.length).to.equal(1);
    expect(data7[0].text).to.equal('Guns\'n roses, my dear');
  });

  it('should handle complex nesting constructs with multiple interpolated filters', () => {
    const extractorWithBindOnce = new Extractor({
      filterPrefix: '::',
    });

    const data = extractorWithBindOnce._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_COMPLEX_NESTING);
    expect(data.length).to.equal(13);

    expect(data[0].text).to.equal(
      `<div translate="" translate-comment="Inner comment …" translate-context="Inner Context">
    Before {{:: 'I18n before' |translate }}
    <a href="#" aria-label="{{ 'Test link 1' |translate }}">
      {{ 'Link part 1' |translate }}
      {{:: 'Link part 2' |translate }}
      {{ 'Link part 3' |translate }}</a>
    Between {{:: 'I18n between' |translate }}
    <a href="#" aria-label="{{ 'Test link 2' |translate }}">
      {{ 'Reference part 1' |translate }}
      {{:: 'Reference part 2' |translate }}
      {{ 'Reference part 3' |translate }}</a>
    After {{:: 'I18n after' |translate }}
  </div>`);
    expect(data[0].comment).to.equal('Outer comment …');
    expect(data[0].context).to.equal('Outer Context');

    expect(data[1].text).to.equal(
      `Before {{:: 'I18n before' |translate }}
    <a href="#" aria-label="{{ 'Test link 1' |translate }}">
      {{ 'Link part 1' |translate }}
      {{:: 'Link part 2' |translate }}
      {{ 'Link part 3' |translate }}</a>
    Between {{:: 'I18n between' |translate }}
    <a href="#" aria-label="{{ 'Test link 2' |translate }}">
      {{ 'Reference part 1' |translate }}
      {{:: 'Reference part 2' |translate }}
      {{ 'Reference part 3' |translate }}</a>
    After {{:: 'I18n after' |translate }}`);
    expect(data[1].comment).to.equal('Inner comment …');
    expect(data[1].context).to.equal('Inner Context');

    expect(data[2].text).to.equal(`I18n before`);
    expect(data[2].context).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[3].text).to.equal(`Test link 1`);
    expect(data[3].context).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[4].text).to.equal(`Link part 1`);
    expect(data[4].context).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[5].text).to.equal(`Link part 2`);
    expect(data[5].context).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[6].text).to.equal(`Link part 3`);
    expect(data[6].context).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[7].text).to.equal(`I18n between`);
    expect(data[7].context).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[8].text).to.equal(`Test link 2`);
    expect(data[8].context).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[9].text).to.equal(`Reference part 1`);
    expect(data[9].context).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[10].text).to.equal(`Reference part 2`);
    expect(data[10].context).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[11].text).to.equal(`Reference part 3`);
    expect(data[11].context).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[12].text).to.equal(`I18n after`);
    expect(data[12].context).to.equal(constants.MARKER_NO_CONTEXT);
  });

  it('should extract filters from nested constructs', () => {
    const extractorWithBindOnce = new Extractor({
      startDelimiter: '',
      endDelimiter: '',
      filterPrefix: '::',
    });

    const data = extractorWithBindOnce._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_NESTED_FILTER);
    expect(data.length).to.equal(4);
    expect(data[0].text).to.equal('Like');
    expect(data[1].text).to.equal('Gets extracted now');
    expect(data[2].text).to.equal('Number of votes');
    expect(data[3].text).to.equal('Votes <i class=\'fa fa-star\'></i>');
  });

  it('should extract filters that are broken across multiple lines', () => {
    const extractorInterpolate = new Extractor({
      startDelimiter: '{{',
      endDelimiter: '}}',
    });
    const data = extractorInterpolate._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_LINEBREAK_FILTER);
    expect(data.length).to.equal(5);
    expect(data[0].text).to.equal('Multi-line 0');
    expect(data[1].text).to.equal('Multi-line 1');
    expect(data[2].text).to.equal('Multi-line 2');
    expect(data[3].text).to.equal('Multi-line 3');
    expect(data[4].text).to.equal('Multi-line 4');
  });

  it('should extract filters from text before and after elements', () => {
    const extractorInterpolate = new Extractor({
      startDelimiter: '{{',
      endDelimiter: '}}',
    });
    const data = extractorInterpolate._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_TEXT_FILTER);
    expect(data.length).to.equal(5);
    expect(data[0].text).to.equal('Outside 0');
    expect(data[1].text).to.equal('Text 0');
    expect(data[2].text).to.equal('Between 0');
    expect(data[3].text).to.equal('Text 3');
    expect(data[4].text).to.equal('Outside 1');
  });

  it('should extract multiple filters from text blocks', () => {
    const extractorInterpolate = new Extractor({
      startDelimiter: '{{',
      endDelimiter: '}}',
    });
    const data = extractorInterpolate._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_TEXT_MULTIPLE_FILTER);
    expect(data.length).to.equal(3);
    expect(data[0].text).to.equal('Text 0');
    expect(data[1].text).to.equal('Text 1');
    expect(data[2].text).to.equal('Text 2');
  });

  it('should extract filters from text blocks with empty delimiters', () => {
    const extractor = new Extractor({
      startDelimiter: '',
      endDelimiter: '',
    });
    const data = extractor._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_TEXT_CHALLENGE);
    expect(data.length).to.equal(3);
    expect(data[0].text).to.equal('Thanks for joining ….  However, … does not start until');
    expect(data[1].text).to.equal(', but will open');
    expect(data[2].text).to.equal('minutes before that.');
  });

  it('should ignore comments and directives when extracting filters', () => {
    const extractorInterpolate = new Extractor({
      startDelimiter: '',
      endDelimiter: '',
      filterPrefix: '::',
    });
    const data = extractorInterpolate._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_TEXT_FILTER_COMMENT);
    expect(data.length).to.equal(1);
    expect(data[0].text).to.equal('Text 1');
  });

  it('should join split strings', () => {
    const extractorInterpolate = new Extractor({
      startDelimiter: '',
      endDelimiter: '',
      filterPrefix: '::',
    });
    const data = extractorInterpolate._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_FILTER_SPLIT_STRING);
    expect(data.length).to.equal(1);
    expect(data[0].text).to.equal('Three parts, one whole.');
  });

  it('should join strings split over multiple lines', () => {
    const extractorInterpolate = new Extractor({
      startDelimiter: '',
      endDelimiter: '',
      filterPrefix: '::',
    });
    const data0 = extractorInterpolate._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_FILTER_SPLIT_MULTILINE_STRING_ATTR);
    expect(data0.length).to.equal(1);
    expect(data0[0].text).to.equal('Four parts, maybe, one whole.');

    const data1 = extractorInterpolate._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_FILTER_SPLIT_MULTILINE_STRING_INTERPOLATED);
    expect(data1.length).to.equal(1);
    expect(data1[0].text).to.equal('Four parts, probably, one whole.');
  });
});
