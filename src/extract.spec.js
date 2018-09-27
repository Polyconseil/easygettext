const extract = require('./extract.js');
const constants = require('./constants.js');
const fixtures = require('./test-fixtures.js');

const {expect} = require('chai');


describe('Extractor object', () => {

  it('should output a correct POT file from the supplied HTML', () => {
    const extractor = new extract.Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML0_CTX0);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_0);
  });

  it('should output a correct POT file from multiple HTML fixtures', () => {
    const extractor = new extract.Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML0_CTX0);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML1_PLURAL0);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_1);
  });

  it('should output a correct POT file with multiple contexts', () => {
    const extractor = new extract.Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML0_CTX0);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML0_CTX1);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_CONTEXTS);
  });

  it('should output a correct POT file using keyword as tag', () => {
    const extractor = new extract.Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML4_TAG0);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML4_TAG1);
    extractor.parse(fixtures.FILENAME_2, fixtures.HTML4_TAG2);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_TAGS);
  });

  it('should only translate a html block once', () => {
    const extractor = new extract.Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML4_TAG3);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_MULTIPLE_TAGS);
  });

  it('should merge multiple references correctly and not duplicate', () => {
    const extractor = new extract.Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML0_CTX0);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML0_CTX0);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML0_CTX0);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_MULTIREF);
  });

  it('should merge multiple comments correctly and not duplicate', () => {
    const extractor = new extract.Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML2_COMMENT0);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML2_COMMENT1);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML2_COMMENT1);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_MULTICOMMENTS);
  });

  it('should fail when plurals dont match', () => {
    const extractor = new extract.Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML1_PLURAL0);
    expect(() => extractor.parse(fixtures.FILENAME_1, fixtures.HTML1_PLURAL1))
      .to.throw(Error, 'Incompatible plural definitions for I work: \'We work\' !== \'Us works\'');
  });

  it('should lexicographically sort the translations', () => {
    const extractor = new extract.Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML_SORTING);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_SORTED);
  });

  it('should output a correct POT file without unnecessary escaped quotes', () => {
    const extractor = new extract.Extractor();
    extractor.parse(fixtures.FILENAME_0, fixtures.HTML4_TAG4);
    extractor.parse(fixtures.FILENAME_1, fixtures.HTML4_TAG5);
    extractor.parse(fixtures.FILENAME_2, fixtures.HTML4_TAG6);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_QUOTES);
  });

  it('should output a correct POT file with singular strings ($gettext) extracted from javascript', () => {
    const extractor = new extract.Extractor();
    extractor.parseJavascript(fixtures.VUE_COMPONENT_FILENAME, fixtures.VUE_COMPONENT_EXPECTED_PROCESSED_SCRIPT_TAG);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_VUE_SCRIPT_GETTEXT);
  });

  it('should output a correct POT file with plural strings ($ngettext) extracted from javascript', () => {
    const extractor = new extract.Extractor();
    extractor.parseJavascript(fixtures.VUE_COMPONENT_FILENAME, fixtures.SCRIPT_USING_NGETTEXT);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_VUE_SCRIPT_NGETTEXT);
  });

  it('should output a correct POT file with contextualized strings ($pgettext) extracted from javascript', () => {
    const extractor = new extract.Extractor();
    extractor.parseJavascript(fixtures.VUE_COMPONENT_FILENAME, fixtures.SCRIPT_USING_PGETTEXT);
    expect(extractor.toString()).to.equal(fixtures.POT_OUTPUT_VUE_SCRIPT_PGETTEXT);
  });
});


describe('data preprocessor', () => {

  it('should preprocess data accordingly', () => {
    expect(extract.preprocessTemplate('<h1>hello</h1>')).to.equal('<h1>hello</h1>');
    expect(extract.preprocessTemplate('h1 hello', 'pug')).to.equal('<h1>hello</h1>');
  });

  it('should preprocess VueJS templates correctly', () => {
    expect(extract.preprocessTemplate('<template><h1>hello</h1></template>', 'vue')).to.equal('<h1>hello</h1>');
    expect(extract.preprocessTemplate("<template lang='jade'>h1 hello</template>", 'vue')).to.equal('<h1>hello</h1>');
  });

  it('should preprocess VueJS script tag correctly', () => {
    expect(
      extract.preprocessScriptTags(
        fixtures.VUE_COMPONENT_WITH_SCRIPT_TAG,
        'vue'
      )
    ).to.equal(
      fixtures.VUE_COMPONENT_EXPECTED_PROCESSED_SCRIPT_TAG
    );
  });

});


describe('Raw translation data', () => {
  const extractor = new extract.Extractor({
    filterPrefix: '::',
  });

  it('should extract data and metadata correctly', () => {
    const data = extractor._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML0_CTX0);
    expect(data.length).to.equal(1);
    expect(data[0].text).to.equal('Hello world');
    expect(data[0].reference.file).to.equal(fixtures.FILENAME_0);
    expect(data[0].reference.line).to.equal(2);
    expect(data[0].msgctxt).to.equal('For charlie');
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
    expect(data[1].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);
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

    const extractorWithParams = new extract.Extractor({
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

    const extractorWithBindOnce = new extract.Extractor({
      startDelimiter: '',
      endDelimiter: '',
      filterPrefix: '::',
    });
    const data7 = extractorWithBindOnce._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML3_FILTER7);
    expect(data7.length).to.equal(1);
    expect(data7[0].text).to.equal('Guns\'n roses, my dear');
  });

  it('should unescape quotes', () => {
    const data = new extract.Extractor({
      startDelimiter: '',
      endDelimiter: '',
    })._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_FILTER_ESCAPED_QUOTES);
    expect(data.length).to.equal(5);
    expect(data[0].text).to.equal('Life\'s a tough teacher.');
    expect(data[1].text).to.equal('Life\'s a tough journey.');
    expect(data[2].text).to.equal('Life\'s a tough road.');
    expect(data[3].text).to.equal('Life\'s a tough "boulevard".');
    expect(data[4].text).to.equal('Life\'s a tough \'journey\'.');
  });

  it('should concatenate numbers', () => {
    const data = new extract.Extractor({
      startDelimiter: '{{',
      endDelimiter: '}}',
    })._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_JS_EXPRESSION_WITH_NUMBER);
    expect(data.length).to.equal(1);
    expect(data[0].text).to.equal('A42.');
  });

  it('should report syntax errors', () => {
    const extractCall = () => {
      new extract.Extractor({
        startDelimiter: '{{',
        endDelimiter: '}}',
      })._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_JS_EXPRESSION_SYNTAX_ERROR);
    };
    expect(extractCall).to.throw('Unterminated string constant, when trying to parse `{{ \'A\' + b\' |translate }}` foo.htm:1');
  });

  it('should treat delimiters inside filter text as plain text', () => {
    const data = new extract.Extractor({
      startDelimiter: '',
      endDelimiter: '',
    })._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_DELIMITERS_INSIDE_FILTER_TEXT);
    expect(data.length).to.equal(1);
    expect(data[0].text).to.equal('You received {{ vm.count}} coins!');
  });

  it('should compile and extract translatable strings from JavaScript expressions in filters', () => {
    const data = new extract.Extractor({
      startDelimiter: '',
      endDelimiter: '',
    })._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_VARIED_CHALLENGES);
    expect(data.length).to.equal(5);
    expect(data[0].text).to.equal('Preview');
    expect(data[1].text).to.equal('Exit Preview');
    expect(data[2].text).to.equal('Send Message');
    expect(data[3].text).to.equal('Reset');
    expect(data[4].text).to.equal('Cancel');
  });

  it('should handle complex nesting constructs with multiple interpolated filters', () => {
    const extractorWithBindOnce = new extract.Extractor({
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
    expect(data[0].msgctxt).to.equal('Outer Context');

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
    expect(data[1].msgctxt).to.equal('Inner Context');

    expect(data[2].text).to.equal('I18n before');
    expect(data[2].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[3].text).to.equal('Test link 1');
    expect(data[3].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[4].text).to.equal('Link part 1');
    expect(data[4].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[5].text).to.equal('Link part 2');
    expect(data[5].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[6].text).to.equal('Link part 3');
    expect(data[6].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[7].text).to.equal('I18n between');
    expect(data[7].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[8].text).to.equal('Test link 2');
    expect(data[8].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[9].text).to.equal('Reference part 1');
    expect(data[9].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[10].text).to.equal('Reference part 2');
    expect(data[10].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[11].text).to.equal('Reference part 3');
    expect(data[11].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[12].text).to.equal('I18n after');
    expect(data[12].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);
  });

  it('should extract filters from nested constructs', () => {
    const extractorWithBindOnce = new extract.Extractor({
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
    const extractorInterpolate = new extract.Extractor({
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
    const extractorInterpolate = new extract.Extractor({
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
    const extractorInterpolate = new extract.Extractor({
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
    const extractorInstance = new extract.Extractor({
      startDelimiter: '',
      endDelimiter: '',
    });
    const data = extractorInstance._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_TEXT_CHALLENGE);
    expect(data.length).to.equal(3);
    expect(data[0].text).to.equal('Thanks for joining ….  However, … does not start until');
    expect(data[1].text).to.equal(', but will open');
    expect(data[2].text).to.equal('minutes before that.');
  });

  it('should extract filters from text blocks with nonempty delimiters', () => {
    const data = new extract.Extractor({
      startDelimiter: '{{',
      endDelimiter: '}}',
    })._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_TEXT_CHALLENGE);
    expect(data.length).to.equal(3);
    expect(data[0].text).to.equal('Thanks for joining ….  However, … does not start until');
    expect(data[1].text).to.equal(', but will open');
    expect(data[2].text).to.equal('minutes before that.');
  });

  it('should ignore comments and directives when extracting filters', () => {
    const extractorInterpolate = new extract.Extractor({
      startDelimiter: '',
      endDelimiter: '',
      filterPrefix: '::',
    });
    const data = extractorInterpolate._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_TEXT_FILTER_COMMENT);
    expect(data.length).to.equal(1);
    expect(data[0].text).to.equal('Text 1');
  });

  it('should join split strings', () => {
    const extractorInterpolate = new extract.Extractor({
      startDelimiter: '',
      endDelimiter: '',
      filterPrefix: '::',
    });
    const data = extractorInterpolate._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_FILTER_SPLIT_STRING);
    expect(data.length).to.equal(1);
    expect(data[0].text).to.equal('Three parts, one whole.');
  });

  it('should join strings split over multiple lines', () => {
    const extractorInterpolate = new extract.Extractor({
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

  it('should extract translatable strings from commented nested filters', () => {
    const data = new extract.Extractor({
      startDelimiter: '',
      endDelimiter: '',
      filterPrefix: '::',
    })._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_COMMENTED_NESTED_FILTER);
    expect(data.length).to.equal(4);
    expect(data[0].text).to.equal('Like');
    expect(data[1].text).to.equal('Gets extracted now');
    expect(data[2].text).to.equal('Number of votes');
    expect(data[3].text).to.equal('Votes <i class=\'fa fa-star\'></i>');
  });

  it('should extract strings from commented', () => {
    const data = new extract.Extractor({
      filterPrefix: '::',
    })._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_COMMENTED_COMPLEX_NESTING);
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
    expect(data[0].msgctxt).to.equal('Outer Context');

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
    expect(data[1].msgctxt).to.equal('Inner Context');

    expect(data[2].text).to.equal('I18n before');
    expect(data[2].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[3].text).to.equal('Test link 1');
    expect(data[3].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[4].text).to.equal('Link part 1');
    expect(data[4].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[5].text).to.equal('Link part 2');
    expect(data[5].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[6].text).to.equal('Link part 3');
    expect(data[6].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[7].text).to.equal('I18n between');
    expect(data[7].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[8].text).to.equal('Test link 2');
    expect(data[8].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[9].text).to.equal('Reference part 1');
    expect(data[9].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[10].text).to.equal('Reference part 2');
    expect(data[10].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[11].text).to.equal('Reference part 3');
    expect(data[11].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);

    expect(data[12].text).to.equal('I18n after');
    expect(data[12].msgctxt).to.equal(constants.MARKER_NO_CONTEXT);
  });

  it('should compile complex inline JavaScript filter expressions', () => {
    const data = new extract.Extractor({
      startDelimiter: '',
      endDelimiter: '',
      filterPrefix: '::',
    })._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_JS_EXPRESSION_COMPLEX_FILTERS);
    expect(data.length).to.equal(14);
    expect(data[0].text).to.equal('Bed n\' breakfast');
    expect(data[1].text).to.equal('Always');
    expect(data[2].text).to.equal('Never');
    expect(data[3].text).to.equal('This will always be true');
    expect(data[4].text).to.equal('This will never be true');
    expect(data[5].text).to.equal('Moonshine');
    expect(data[6].text).to.equal('Daylight');
    expect(data[7].text).to.equal('AB');
    expect(data[8].text).to.equal('Ab');
    expect(data[9].text).to.equal('a');
    expect(data[10].text).to.equal('CD');
    expect(data[11].text).to.equal('Cd');
    expect(data[12].text).to.equal('cE');
    expect(data[13].text).to.equal('ce');
  });

  it('cannot handle incomplete commented filters', () => {
    const extractCall = () => {
      new extract.Extractor({
        startDelimiter: '',
        endDelimiter: '',
      })._extractTranslationData(fixtures.FILENAME_0, fixtures.HTML_INCOMPLETE_COMMENT);
    };
    expect(extractCall).to.throw('Assigning to rvalue, when trying to parse `ng-bind="\'Cancel\' |translate">` foo.htm:1');
  });
});
