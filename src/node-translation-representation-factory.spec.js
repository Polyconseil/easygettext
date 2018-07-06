const { expect } = require('chai');
const factory = require('./node-translation-representation-factory.js');

describe('Node translation representation factory', () => {
  describe('Generated objects representations', () => {
    const filename = 'Grievous.vue';

    let gettextExpression;
    let gettextToken;

    beforeEach(() => {
      gettextExpression = {
        arguments: [
          {
            value: 'General Kenobi!',
          },
        ],
      };

      gettextToken = {
        value: '$gettext',
        loc: {
          start: {
            line: 4,
          },
        },
      };
    });

    it('should correctly render the reference', () => {
      const node = factory.getNodeTranslationInfoRepresentation(filename, gettextToken, gettextExpression);

      expect(node.reference.toString(true)).to.be.equal('Grievous.vue:4');
    });

    it('Should correctly render $gettext node representation to a PoItem', () => {
      const node = factory.getNodeTranslationInfoRepresentation(filename, gettextToken, gettextExpression);

      const poItem = node.toPoItem(true);

      expect(poItem.msgid).to.be.equal('General Kenobi!');
      expect(poItem.references).to.have.members([ 'Grievous.vue:4' ]);
    });

    it('Should correctly render $ngettext node representation to a PoItem', () => {
      const ngettextExpression = {
        arguments: [
          { value: 'one droid' },
          { value: '%{ n } droids' },
          { value: null },
        ],
      };

      const ngettextToken = {
        value: '$ngettext',
        loc: {
          start: {
            line: 4,
          },
        },
      };

      const node = factory.getNodeTranslationInfoRepresentation(filename, ngettextToken, ngettextExpression);

      const poItem = node.toPoItem(true);

      expect(poItem.msgid).to.be.equal('one droid');
      expect(poItem.msgid_plural).to.be.equal('%{ n } droids');
      expect(poItem.references).to.have.members([ 'Grievous.vue:4' ]);
    });


    it('Should correctly render $pgettext node representation to a PoItem', () => {
      const ngettextExpression = {
        arguments: [
          { value: 'menu' },
          { value: 'Home' },
        ],
      };

      const ngettextToken = {
        value: '$pgettext',
        loc: {
          start: {
            line: 4,
          },
        },
      };

      const node = factory.getNodeTranslationInfoRepresentation(filename, ngettextToken, ngettextExpression);

      const poItem = node.toPoItem(true);

      expect(poItem.msgid).to.be.equal('Home');
      expect(poItem.msgctxt).to.be.equal('menu');
      expect(poItem.references).to.have.members([ 'Grievous.vue:4' ]);
    });
  });
});
