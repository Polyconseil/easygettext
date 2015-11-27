import {sanitizePoData, po2json} from './compile.js';
import {INPUT_PO, OUTPUT_DICT} from './test-fixtures.js';

import {expect} from 'chai';

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
    expect(sanitizePoData([normalItem])).to.deep.equal({'Hello world': 'Bonjour Monde'});
    expect(sanitizePoData([obsoleteItem])).to.deep.equal({});
    expect(sanitizePoData([fuzzyItem])).to.deep.equal({});
    expect(sanitizePoData([bogusItem])).to.deep.equal({});
    expect(sanitizePoData([normalItem, obsoleteItem, fuzzyItem, bogusItem]))
      .to.deep.equal({'Hello world': 'Bonjour Monde'});
  });

  it('should keep context', () => {
    const normalItem = mockPoItem();
    const contextItem = mockPoItem({msgctxt: 'in Belize', msgstr: ['Hola Amigos']});
    expect(sanitizePoData([normalItem, contextItem]))
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
    expect(po2json(INPUT_PO)).to.deep.equal(OUTPUT_DICT);
  });
});
