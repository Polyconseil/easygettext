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

      expect(extractedStrings.length).to.be.equal(2);

      const firstString = extractedStrings[0];
      const secondString = extractedStrings[1];

      expect(firstString.msgid).to.be.equal('Hello there!');
      expect(firstString.context).to.be.equal(MARKER_NO_CONTEXT);
      expect(firstString.reference.file).to.be.equal(filename);
      expect(firstString.reference.line).to.be.equal(10);

      expect(secondString.msgid).to.be.equal('Hello there!');
      expect(firstString.context).to.be.equal(MARKER_NO_CONTEXT);
      expect(secondString.reference.file).to.be.equal(filename);
      expect(secondString.reference.line).to.be.equal(13);
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
      expect(firstString.context).to.be.equal(MARKER_NO_CONTEXT);
      expect(firstString.reference.file).to.be.equal(filename);
      expect(firstString.reference.line).to.be.equal(6);
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
      expect(firstString.context).to.be.equal('menu');
      expect(firstString.reference.file).to.be.equal(filename);
      expect(firstString.reference.line).to.be.equal(6);

      expect(secondString.msgid).to.be.equal('Home');
      expect(secondString.context).to.be.equal('house');
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
  });
});
