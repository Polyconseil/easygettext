const { expect }  = require('chai');

const fixtures    = require('./test-fixtures.js');
const jsExtractor = require('./javascript-extract.js');


describe('Javascript extractor object', () => {
  describe('Extraction of localized strings', () => {
    it('should extract strings from the script', () => {
      const filename         = fixtures.VUE_COMPONENT_FILENAME;
      const extractedStrings = jsExtractor.extractStringsFromJavascript(
        filename,
        fixtures.VUE_COMPONENT_EXPECTED_PROCESSED_SCRIPT_TAG
      );

      expect(extractedStrings.length).to.be.equal(2);

      const firstString  = extractedStrings[0];
      const secondString = extractedStrings[1];

      expect(firstString.text).to.be.equal('Hello there!');
      expect(firstString.reference.file).to.be.equal(filename);
      expect(firstString.reference.line).to.be.equal(10);

      expect(secondString.text).to.be.equal('Hello there!');
      expect(secondString.reference.file).to.be.equal(filename);
      expect(secondString.reference.line).to.be.equal(13);
    });
  });
});
