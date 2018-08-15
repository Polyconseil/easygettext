const { expect } = require('chai');

const fixtures = require('./test-fixtures.js');
const jsExtractor = require('./javascript-extract.js');
const { MARKER_NO_CONTEXT } = require('./constants.js');


describe('Javascript extractor object', () => {
  describe('Extraction of localized strings', () => {
    it('should extract strings localized using $gettext from the script', () => {
      const filename = fixtures.VUE_COMPONENT_FILENAME;
      const extractedStrings = jsExtractor.extractStringsFromJavascript(
        filename,
        fixtures.VUE_COMPONENT_EXPECTED_PROCESSED_SCRIPT_TAG
      );

      expect(extractedStrings.length).to.be.equal(3);

      const firstString = extractedStrings[0];
      const secondString = extractedStrings[1];
      const thirdString = extractedStrings[2];

      expect(firstString.msgid).to.be.equal('Hello there!');
      expect(firstString.msgctxt).to.be.equal(MARKER_NO_CONTEXT);
      expect(firstString.reference.file).to.be.equal(filename);
      expect(firstString.reference.line).to.be.equal(10);

      expect(secondString.msgid).to.be.equal('Hello there!');
      expect(secondString.msgctxt).to.be.equal(MARKER_NO_CONTEXT);
      expect(secondString.reference.file).to.be.equal(filename);
      expect(secondString.reference.line).to.be.equal(13);

      expect(thirdString.msgid).to.be.equal('General Kenobi! You are a bold one.');
      expect(thirdString.msgctxt).to.be.equal(MARKER_NO_CONTEXT);
      expect(thirdString.reference.file).to.be.equal(filename);
      expect(thirdString.reference.line).to.be.equal(16);
    });

    it('should extract strings localized using $ngettext from the script', () => {
      const filename = '$ngettext.vue';
      const extractedStrings = jsExtractor.extractStringsFromJavascript(
        filename,
        fixtures.SCRIPT_USING_NGETTEXT
      );

      expect(extractedStrings.length).to.be.equal(1);

      const firstString = extractedStrings[0];

      expect(firstString.msgid).to.be.equal('%{ n } foo');
      expect(firstString.msgctxt).to.be.equal(MARKER_NO_CONTEXT);
      expect(firstString.reference.file).to.be.equal(filename);
      expect(firstString.reference.line).to.be.equal(6);
    });

    it('should allow gettext calls in array, object initializers', () => {
      const filename = fixtures.SCRIPT_GETTEXT_SEQUENCE_FILENAME;
      const extractedStrings = jsExtractor.extractStringsFromJavascript(
        filename,
        fixtures.SCRIPT_GETTEXT_SEQUENCE
      );
      expect(extractedStrings.length).to.be.equal(3);
      const firstString = extractedStrings[0];
      const secondString = extractedStrings[1];
      const thirdString = extractedStrings[2];
      expect(firstString.msgid).to.be.equal('Hello there!');
      expect(firstString.reference.file).to.be.equal(filename);
      expect(firstString.reference.line).to.be.equal(7);
      expect(secondString.msgid).to.be.equal('Hello there!');
      expect(secondString.reference.file).to.be.equal(filename);
      expect(secondString.reference.line).to.be.equal(7);
      expect(thirdString.msgid).to.be.equal('Hello there!');
      expect(thirdString.reference.file).to.be.equal(filename);
      expect(thirdString.reference.line).to.be.equal(8);
    });

    it('should extract contextual strings localized using $pgettext from the script', () => {
      const filename = '$ngettext.vue';
      const extractedStrings = jsExtractor.extractStringsFromJavascript(
        filename,
        fixtures.SCRIPT_USING_PGETTEXT
      );

      expect(extractedStrings.length).to.be.equal(2);

      const firstString = extractedStrings[0];
      const secondString = extractedStrings[1];

      expect(firstString.msgid).to.be.equal('Home');
      expect(firstString.msgctxt).to.be.equal('menu');
      expect(firstString.reference.file).to.be.equal(filename);
      expect(firstString.reference.line).to.be.equal(6);

      expect(secondString.msgid).to.be.equal('Home');
      expect(secondString.msgctxt).to.be.equal('house');
      expect(secondString.reference.file).to.be.equal(filename);
      expect(secondString.reference.line).to.be.equal(9);
    });

    it('should not try to extract strings when the node is not a function', () => {
      const filename = 'traps.vue';
      const extractedStrings = jsExtractor.extractStringsFromJavascript(
        filename,
        fixtures.SCRIPT_CONTAINING_DECOYS
      );

      expect(extractedStrings.length).to.be.equal(1);
      expect(extractedStrings[0].msgid).to.be.equal('Hello world from the $gettext function');
    });

    it('should not break parser when using ECMAScript Stage 3 features', () => {
      const filename = 'stage3.vue';
      const extractedStrings = jsExtractor.extractStringsFromJavascript(
        filename,
        fixtures.SCRIPT_WITH_ES_STAGE3_FEATURES
      );

      expect(extractedStrings.length).to.be.equal(1);
      expect(extractedStrings[0].msgid).to.be.equal('Hello world from the future');
    });
  });
});
