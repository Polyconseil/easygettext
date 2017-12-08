import cheerio from 'cheerio';
import Pofile from 'pofile';

import * as constants from './constants.js';

// Internal regylar expression used to escape special characters
const ESCAPE_REGEX = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;


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
    this.line = lineCount(content, charPosition);
  }

  toString(withLineNumbers = false) {
    let ref = this.file;
    if (withLineNumbers && this.line) {
      ref = `${ref}:${this.line}`;
    }
    return ref;
  }
}


export class NodeTranslationInfo {
  constructor(node, text, reference, attributes)  {
    this.text = text;
    this.reference = reference;
    this.context = getExtraAttribute(node, attributes, constants.ATTRIBUTE_CONTEXT) || constants.MARKER_NO_CONTEXT;
    this.comment = getExtraAttribute(node, attributes, constants.ATTRIBUTE_COMMENT);
    this.plural = getExtraAttribute(node, attributes, constants.ATTRIBUTE_PLURAL);
  }

  toPoItem(withLineNumbers = false) {
    let poItem = new Pofile.Item();
    poItem.msgid = this.text;
    poItem.msgctxt = this.context === constants.MARKER_NO_CONTEXT ? null : this.context;
    poItem.references = [this.reference.toString(withLineNumbers)];
    poItem.msgid_plural = this.plural;
    poItem.msgstr = this.plural ? ['', ''] : [];
    poItem.extractedComments = this.comment ? [this.comment] : [];
    return poItem;
  }
}


export class Extractor {

  constructor(options) {
    this.options = Object.assign({
      startDelimiter: '{{',
      endDelimiter: '}}',
      attributes: constants.DEFAULT_ATTRIBUTES,
      lineNumbers: false,
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
    this.filterRegexps = this.options.attributes.map((attribute) => {
      const startOrEndQuotes = `(?:\\&quot;|[\\'"])`;  // matches simple / double / HTML quotes
      const spacesOrPipeChar = `\\s*\\|\\s*`;        // matches the pipe string of the filter
      const start = this.options.startDelimiter.replace(ESCAPE_REGEX, '\\$&');
      const end = this.options.endDelimiter.replace(ESCAPE_REGEX, '\\$&');
      return new RegExp(`^${start}[^'"]*${startOrEndQuotes}(.*)${startOrEndQuotes}${spacesOrPipeChar}${attribute}\\s*${end}$`);
    });
  }

  parse(filename, content) {
    const extractedData = this._extractTranslationData(filename, content);

    for (const d of extractedData) {
      if (!this.items[d.text]) {
        this.items[d.text] = {};
      }
      if (!this.items[d.text][d.context]) {
        this.items[d.text][d.context] = d.toPoItem(this.options.lineNumbers);
      } else {
        let item = this.items[d.text][d.context];
        if (item.msgid_plural && d.plural && item.msgid_plural !== d.plural) {
          throw new Error(
            `Incompatible plural definitions for ${d.text}: '${item.msgid_plural}' !== '${d.plural}'`);
        }
        if (d.plural && !item.msgid_plural) {
          item.msgid_plural = d.plural;
        }
        const refString = d.reference.toString(this.options.lineNumbers);
        if (d.reference && item.references.indexOf(refString) === -1) {
          item.references.push(refString);
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
      if (this._hasTranslationToken(node)) {
        const text = node.html().trim();
        if (text.length !== 0) {
          return [new NodeTranslationInfo(node, text, reference, this.options.attributes)];
        }
      }

      // In-depth search for filters
      const attrs = Object.keys(node.attr()).map(key => node.attr()[key]);
      const datas = Object.keys(node.data()).map(key => node.data()[key]);
      let tokensFromFilters = [];
      [node.html(), ...attrs, ...datas].forEach((item) => {
        const matches = this.filterRegexps.map((re) => re.exec(item)).filter((x) => x !== null);
        if (matches.length !== 0) {
          const text = matches[0][1].trim();
          if (text.length !== 0) {
            tokensFromFilters.push(new NodeTranslationInfo(node, text, reference, this.options.attributes));
          }
        }
      });
      if (tokensFromFilters.length > 0) {
        return tokensFromFilters;
      }
    }.bind(this)).get()
      .reduce((acc, cur) => acc.concat(cur), [])
      .filter((x) => x !== undefined);
  }

  _hasTranslationToken(node) {
    return this.options.attributes.some((keyword) => node.is(keyword) || node.attr(keyword) !== undefined);
  }
}
