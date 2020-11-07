const fixtures = require('./test-fixtures.js');
const jsExtractor = require('./javascript-extract.js');
const { MARKER_NO_CONTEXT } = require('./constants.js');


describe('Javascript extractor object', () => {
  describe('Extraction of localized strings', () => {
    it('should extract strings localized using $gettext from the script', () => {
      const filename = fixtures.VUE_COMPONENT_FILENAME;
      const extractedStrings = jsExtractor.extractStringsFromJavascript(
        filename,
        fixtures.VUE_COMPONENT_EXPECTED_PROCESSED_SCRIPT_TAG,
      );

      expect(extractedStrings.length).toBe(3);

      const firstString = extractedStrings[0];
      const secondString = extractedStrings[1];
      const thirdString = extractedStrings[2];

      expect(firstString.msgid).toBe('Hello there!');
      expect(firstString.msgctxt).toBe(MARKER_NO_CONTEXT);
      expect(firstString.reference.file).toBe(filename);
      expect(firstString.reference.line).toBe(5);

      expect(secondString.msgid).toBe('Hello there!');
      expect(secondString.msgctxt).toBe(MARKER_NO_CONTEXT);
      expect(secondString.reference.file).toBe(filename);
      expect(secondString.reference.line).toBe(8);

      expect(thirdString.msgid).toBe('General Kenobi! You are a bold one.');
      expect(thirdString.msgctxt).toBe(MARKER_NO_CONTEXT);
      expect(thirdString.reference.file).toBe(filename);
      expect(thirdString.reference.line).toBe(11);
    });

    it('should extract strings localized using $ngettext from the script', () => {
      const filename = '$ngettext.vue';
      const extractedStrings = jsExtractor.extractStringsFromJavascript(
        filename,
        fixtures.SCRIPT_USING_NGETTEXT,
      );

      expect(extractedStrings.length).toBe(1);

      const firstString = extractedStrings[0];

      expect(firstString.msgid).toBe('%{ n } foo');
      expect(firstString.msgctxt).toBe(MARKER_NO_CONTEXT);
      expect(firstString.reference.file).toBe(filename);
      expect(firstString.reference.line).toBe(6);
    });

    it('should allow gettext calls in array, object initializers', () => {
      const filename = fixtures.SCRIPT_GETTEXT_SEQUENCE_FILENAME;
      const extractedStrings = jsExtractor.extractStringsFromJavascript(
        filename,
        fixtures.SCRIPT_GETTEXT_SEQUENCE,
      );
      expect(extractedStrings.length).toBe(3);
      const firstString = extractedStrings[0];
      const secondString = extractedStrings[1];
      const thirdString = extractedStrings[2];
      expect(firstString.msgid).toBe('Hello there!');
      expect(firstString.reference.file).toBe(filename);
      expect(firstString.reference.line).toBe(7);
      expect(secondString.msgid).toBe('Hello there!');
      expect(secondString.reference.file).toBe(filename);
      expect(secondString.reference.line).toBe(7);
      expect(thirdString.msgid).toBe('Hello there!');
      expect(thirdString.reference.file).toBe(filename);
      expect(thirdString.reference.line).toBe(8);
    });

    it('should extract contextual strings localized using $pgettext from the script', () => {
      const filename = '$ngettext.vue';
      const extractedStrings = jsExtractor.extractStringsFromJavascript(
        filename,
        fixtures.SCRIPT_USING_PGETTEXT,
      );

      expect(extractedStrings.length).toBe(2);

      const firstString = extractedStrings[0];
      const secondString = extractedStrings[1];

      expect(firstString.msgid).toBe('Home');
      expect(firstString.msgctxt).toBe('menu');
      expect(firstString.reference.file).toBe(filename);
      expect(firstString.reference.line).toBe(6);

      expect(secondString.msgid).toBe('Home');
      expect(secondString.msgctxt).toBe('house');
      expect(secondString.reference.file).toBe(filename);
      expect(secondString.reference.line).toBe(9);
    });

    it('should not try to extract strings when the node is not a function', () => {
      const filename = 'traps.vue';
      const extractedStrings = jsExtractor.extractStringsFromJavascript(
        filename,
        fixtures.SCRIPT_CONTAINING_DECOYS,
      );

      expect(extractedStrings.length).toBe(1);
      expect(extractedStrings[0].msgid).toBe('Hello world from the $gettext function');
    });

    it('should not break parser when using ECMAScript Stage 3 features', () => {
      const filename = 'stage3.vue';
      const extractedStrings = jsExtractor.extractStringsFromJavascript(
        filename,
        fixtures.SCRIPT_WITH_ES_STAGE3_FEATURES,
        'acorn',
      );

      expect(extractedStrings.length).toBe(1);
      expect(extractedStrings[0].msgid).toBe('Hello world from the future');
    });

    it('should be able to parse correctly concatenated strings', () => {
      const filename = 'temp_literals.vue';
      const extractedStrings = jsExtractor.extractStringsFromJavascript(
        filename,
        fixtures.SCRIPT_WITH_STRING_CONCAT,
      );
      expect(extractedStrings.length).toBe(3);
      expect(extractedStrings[0].msgid).toBe('Hello there! I am a concatenated string,\n please translate me.');
    });

    it('should be able to parse correctly template strings without variables', () => {
      const filename = 'temp_literals.vue';
      const extractedStrings = jsExtractor.extractStringsFromJavascript(
        filename,
        fixtures.SCRIPT_WITH_TEMPLATE_LITERALS,
      );
      expect(extractedStrings.length).toBe(3);
      expect(extractedStrings[0].msgid).toBe(
        'Hello there!\n'
        + 'I am a multiline string,\n'
        + 'please translate me.');
    });

    it('should throw when trying to parse template strings with variables', () => {
      const filename = 'temp_literals.vue';
      expect(() => {
        jsExtractor.extractStringsFromJavascript(
          filename,
          fixtures.SCRIPT_WITH_TEMPLATE_LITERALS_WITH_VARIABLES,
          'acorn',
        );
      }).toThrow();
    });
  });

  describe('Multiple parser support', () => {
    it('should extract strings using the parser acorn', () => {
      const filename = fixtures.VUE_COMPONENT_FILENAME;
      const extractedStrings = jsExtractor.extractStringsFromJavascript(
        filename,
        fixtures.VUE_COMPONENT_EXPECTED_PROCESSED_SCRIPT_TAG,
        'acorn',
      );

      expect(extractedStrings.length).toBe(3);
      expect(extractedStrings[0].msgid).toBe('Hello there!');
    });

    it('should extract strings using the parser babel', () => {
      const filename = fixtures.VUE_COMPONENT_FILENAME;
      const extractedStrings = jsExtractor.extractStringsFromJavascript(
        filename,
        fixtures.VUE_COMPONENT_EXPECTED_PROCESSED_SCRIPT_TAG,
        'babel',
      );

      expect(extractedStrings.length).toBe(3);
      expect(extractedStrings[0].msgid).toBe('Hello there!');
    });

    it('should extract strings using the parser acorn as default parser if nothing specified', () => {
      const filename = fixtures.VUE_COMPONENT_FILENAME;
      const extractedStrings = jsExtractor.extractStringsFromJavascript(
        filename,
        fixtures.VUE_COMPONENT_EXPECTED_PROCESSED_SCRIPT_TAG,
      );

      expect(extractedStrings.length).toBe(3);
      expect(extractedStrings[0].msgid).toBe('Hello there!');
    });
  });
});
