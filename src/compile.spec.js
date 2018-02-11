const compile = require('./compile.js');
const fixtures = require('./test-fixtures.js');

const {expect} = require('chai');

function mockPoItem(overrides = {}) {
  return Object.assign({
    msgid: 'Hello world',
    msgctxt: null,
    msgstr: ['Bonjour Monde'],
    flags: {},
    obsolete: false,
  }, overrides);
}

describe('sanitizePoData', () => {

  it('should sanitize input PO item', () => {
    const normalItem = mockPoItem();
    const obsoleteItem = mockPoItem({msgid: 'bar', obsolete: true});
    const fuzzyItem = mockPoItem({msgid: 'foo', flags: {fuzzy: true}});
    const bogusItem = mockPoItem({msgid: 'baz', msgstr: []});
    expect(compile.sanitizePoData([normalItem])).to.deep.equal({'Hello world': 'Bonjour Monde'});
    expect(compile.sanitizePoData([obsoleteItem])).to.deep.equal({});
    expect(compile.sanitizePoData([fuzzyItem])).to.deep.equal({});
    expect(compile.sanitizePoData([bogusItem])).to.deep.equal({});
    expect(compile.sanitizePoData([normalItem, obsoleteItem, fuzzyItem, bogusItem]))
      .to.deep.equal({'Hello world': 'Bonjour Monde'});
  });

  it('should keep context', () => {
    const normalItem = mockPoItem();
    const contextItem = mockPoItem({msgctxt: 'in Belize', msgstr: ['Hola Amigos']});
    expect(compile.sanitizePoData([normalItem, contextItem]))
      .to.deep.equal({
        'Hello world': {
          '': 'Bonjour Monde',
          'in Belize': 'Hola Amigos',
        },
      });
  });
});

describe('po2json', () => {
  it('should correctly parse PO content', () => {
    expect(compile.po2json(fixtures.INPUT_PO)).to.deep.equal(fixtures.OUTPUT_DICT);
  });
});
