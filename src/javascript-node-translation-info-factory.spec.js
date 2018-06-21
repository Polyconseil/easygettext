const { expect } = require('chai');
const factory    = require('./javascript-node-translation-info-factory');

describe('Node translation info factory', () => {
  describe('Generated objects', () => {
    const filename        = 'Grievous.vue';
    const localizedString = 'General Kenobi!';
    const lineNumber      = 4;

    let node;

    beforeEach(() => {
      node = factory.getNodeTranslationInfo(filename, localizedString, lineNumber);
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
