import cheerio from 'cheerio';
import Pofile from 'pofile';

import * as constants from './constants.js';


function lineCount(text, charPosition = -1) {
  let data = text;
  if (charPosition !== -1) {
    data = text.substr(0, charPosition);
  }
  return data.split(/\r\n|\r|\n/).length;
}


function getAttr(node, attrName) {
  return node.attr(attrName) || node.data(attrName);
}


function getExtraAttribute(node, attrs, attrType) {
  const candidates = attrs.map((attrTag) => {
    const attrName = `${attrTag}-${attrType}`;
    return getAttr(node, attrName);
  }).filter((x) => x && x.length !== 0);
  return candidates.length !== 0 ? candidates[0] : null;
}


export class TranslationReference {
  constructor(filename, content, charPosition) {
    this.file = filename;
    this.line = lineCount(content, charPosition) - 1;
  }

  toString(withLineNumbers = false) {
    let ref = this.file;
    if (withLineNumbers && this.line) {
      ref = `${ref}: ${this.line}`;
    }
    return ref;
  }
}


export class NodeTranslationInfo {
  constructor(node, text, reference, attributes = constants.DEFAULT_ATTRIBUTES)  {
    this.text = text;
    this.reference = reference;
    this.context = getExtraAttribute(node, attributes, constants.ATTRIBUTE_CONTEXT) || constants.MARKER_NO_CONTEXT;
    this.comment = getExtraAttribute(node, attributes, constants.ATTRIBUTE_COMMENT);
    this.plural = getExtraAttribute(node, attributes, constants.ATTRIBUTE_PLURAL);
  }

  toPoItem() {
    let poItem = new Pofile.Item();
    poItem.msgid = this.text;
    poItem.msgctxt = this.context === constants.MARKER_NO_CONTEXT ? null : this.context;
    poItem.references = [this.reference];
    poItem.msgid_plural = this.plural;
    poItem.extractedComments = this.comment ? [this.comment] : [];
    return poItem;
  }
}


export class Extractor {

  constructor(options) {
    this.options = Object.assign({
      startDelim: '{{',
      endDelim: '}}',
      attributes: constants.DEFAULT_ATTRIBUTES,
      lineNumbers: true,
    }, options);

    /* Translation items, indexed as:
     * {
     *   "msgid1": {
     *     NOCONTEXT: item,
     *     "ctx1": item2,
     *   },
     *   ...
     * }
     */
    this.items = {};
  }

  parse(filename, content) {
    const extractedData = this._extractTranslationData(filename, content);

    for (const d of extractedData) {
      if (!this.items[d.text]) {
        this.items[d.text] = {};
      }
      if (!this.items[d.text][d.context]) {
        this.items[d.text][d.context] = d.toPoItem();
      } else {
        let item = this.items[d.text][d.context];
        if (item.msgid_plural && d.plural && item.msgid_plural !== d.plural) {
          throw new Error(
            `Incompatible plural definitions for ${d.text}: '${item.msgid_plural}' !== '${d.plural}'`);
        }
        if (d.plural && !item.msgid_plural) {
          item.msgid_plural = d.plural;
        }
        if (d.reference && item.references.indexOf(d.reference) === -1) {
          item.references.push(d.reference);
        }
        if (d.comment && item.extractedComments.indexOf(d.comment) === -1) {
          item.extractedComments.push(d.comment);
        }
      }
    }
  }

  toString() {
    const catalog = new Pofile();
    catalog.headers = {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Transfer-Encoding': '8bit',
      'Generated-By': 'easygettext',
      'Project-Id-Version': '',
    };

    for (let msgid in this.items) {
      if (this.items.hasOwnProperty(msgid)) {
        const contexts = Object.keys(this.items[msgid]).sort();
        for (const ctx of contexts) {
          catalog.items.push(this.items[msgid][ctx]);
        }
      }
    }

    catalog.items.sort((a, b) => a.msgid.localeCompare(b.msgid));
    return catalog.toString();
  }

  _extractTranslationData(filename, content) {
    const $ = cheerio.load(content, {
      decodeEntities: false,
      withStartIndices: true,
    });

    return $('*').map(function(_i, el) {
      const node = $(el);
      const reference = new TranslationReference(filename, content, el.startIndex);
      if (this._hasTranslateAttribute(node)) {
        const text = node.html().trim();
        if (text.length !== 0) {
          return new NodeTranslationInfo(node, text, reference, this.options.attributes);
        }
      }
      if (this._hasTranslationFilter(node)) {
        // TODO(vperron): Unimplemented
        return undefined;
      }
    }.bind(this)).get().filter((x) => x !== undefined);
  }

  _hasTranslateAttribute(node) {
    return this.options.attributes.some((attrName) => node.attr(attrName) !== undefined);
  }

  _hasTranslationFilter(node) { // eslint-disable-line no-unused-vars
    // TODO(vperron): unimplemented
    return false;
  }
}
