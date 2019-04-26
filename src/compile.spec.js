const compile = require('./compile.js');
const fixtures = require('./test-fixtures.js');

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
    expect(compile.sanitizePoData([normalItem])).toEqual({'Hello world': 'Bonjour Monde'});
    expect(compile.sanitizePoData([obsoleteItem])).toEqual({});
    expect(compile.sanitizePoData([fuzzyItem])).toEqual({});
    expect(compile.sanitizePoData([bogusItem])).toEqual({});
    expect(compile.sanitizePoData([normalItem, obsoleteItem, fuzzyItem, bogusItem]))
      .toEqual({'Hello world': 'Bonjour Monde'});
  });

  it('should keep context', () => {
    const normalItem = mockPoItem();
    const contextItem = mockPoItem({msgctxt: 'in Belize', msgstr: ['Hola Amigos']});
    expect(compile.sanitizePoData([normalItem, contextItem]))
      .toEqual({
        'Hello world': {
          '': 'Bonjour Monde',
          'in Belize': 'Hola Amigos',
        },
      });
  });
});

describe('po2json', () => {
  it('should correctly parse PO content', () => {
    expect(compile.po2json(fixtures.INPUT_PO)).toEqual(fixtures.OUTPUT_DICT);
  });
});
