const { expect } = require('chai');
const factory = require('./node-translation-representation-factory.js');

describe('Node translation representation factory', () => {
  describe('Generated objects representations', () => {
    const filename = 'Grievous.vue';
    const localizedString = 'General Kenobi!';
    const lineNumber = 4;

    let node;

    beforeEach(() => {
      node = factory.getNodeTranslationInfoRepresentation(filename, localizedString, lineNumber);
    });

    it('should correctly render the reference', () => {
      expect(node.reference.toString(true)).to.be.equal('Grievous.vue:4');
    });

    it('Should correctly render to a PoItem', () => {
      const poItem = node.toPoItem(true);

      expect(poItem.msgid).to.be.equal(localizedString);
      expect(poItem.references).to.have.members([ 'Grievous.vue:4' ]);
    });
  });
});
