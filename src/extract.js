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
  constructor(node, text, reference, attributes) {
    this.text = text;
    this.reference = reference;

    const el = node[0];
    /* NOTE: It might make sense to let _all_ TEXT child nodes inherit the
     * `context` and `comment` from the parent, not only single children.
     * However, the following conditions generate output equal to
     * `angular-gettext-tools`. */
    const doInheritContext
      = el.type === 'text' && el.prev === null && el.next === null;

    this.context = getExtraAttribute(doInheritContext
      ? node.parent() : node, attributes, constants.ATTRIBUTE_CONTEXT)
      || constants.MARKER_NO_CONTEXT;
    this.comment = getExtraAttribute(doInheritContext
      ? node.parent() : node, attributes, constants.ATTRIBUTE_COMMENT);
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
      startDelimiter: constants.DEFAULT_START_DELIMITER,
      endDelimiter: constants.DEFAULT_END_DELIMITER,
      attributes: constants.DEFAULT_ATTRIBUTES,
      filters: constants.DEFAULT_FILTERS,
      filterPrefix: constants.DEFAULT_FILTER_PREFIX,
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
    this.attrFilterRegexps = this.createRegexps('attr');
    this.textFilterRegexps = this.createRegexps('text');
  }

  createRegexps(type) {
    const startOrEndQuotes = `(?:\\&quot;|[\\'"])`;  // matches simple / double / HTML quotes
    const spacesOrPipeChar = `\\s*\\|\\s*`;        // matches the pipe string of the filter

    let startDelimiter = this.options.startDelimiter;
    let endDelimiter = this.options.endDelimiter;
    if (type === 'text') {
      if (startDelimiter === '') {
        startDelimiter = constants.DEFAULT_START_DELIMITER;
      }
      if (endDelimiter === '') {
        endDelimiter = constants.DEFAULT_END_DELIMITER;
      }
    }
    const start = startDelimiter.replace(ESCAPE_REGEX, '\\$&');
    const end = endDelimiter.replace(ESCAPE_REGEX, '\\$&');

    const prefix = this.options.filterPrefix === null ? '' : `\\s*(?:${this.options.filterPrefix})?\\s*`;
    const body = endDelimiter === '' ? '(.*)' : '(.*)(?!${end})';

    return this.options.filters.map((attribute) => {
      return new RegExp(`${start}${prefix}[^'"]*${startOrEndQuotes}${body}${startOrEndQuotes}${spacesOrPipeChar}${attribute}\\s*${end}`, 'g');
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

  getAttrsAndDatas(node) {
    if (node[0].type === 'text') {
      return [{text: node[0].data.trim(), type: 'text'}];
    }

    const data = node.data();
    const attr = node.attr();
    return [
      ...Object.keys(data).map(key => {
        return {text: data[key], type: 'data'};
      }),
      ...Object.keys(attr).map(key => {
        return {text: attr[key], type: 'attr'};
      }),
    ];
  }

  _parseElement($, el, filename, content) {
    const reference = new TranslationReference(filename, content, el.startIndex);
    const node = $(el);
    if (this._hasTranslationToken(node)) {
      const text = node.html().trim();
      if (text.length !== 0) {
        return [new NodeTranslationInfo(node, text, reference, this.options.attributes)];
      }
    }

    // In-depth search for filters
    return this.getAttrsAndDatas(node)
      .reduce((tokensFromFilters, item) => {
        function getAllMatches(matches, re) {
          while (true) {
            const match = re.exec(item.text);
            if (match) {
              matches.push(match);
            } else {
              break;
            }
          }
          return matches;
        }

        const regexps = item.type === 'html' ? this.textFilterRegexps : this.attrFilterRegexps;
        regexps
          .reduce(getAllMatches, [])
          .filter((match) => match.length)
          .map((match) => match[1].trim())
          .filter((text) => text.length !== 0)
          .forEach((text) => {
            tokensFromFilters.push(
              new NodeTranslationInfo(node, text, reference,
                this.options.attributes));
          });

        return tokensFromFilters;
      }, []);
  }

  _traverseTree(nodes, sequence) {
    nodes.forEach((el) => {
      sequence.push(el);
      if (typeof el.children !== 'undefined') {
        this._traverseTree(el.children, sequence);
      }
    });
    return sequence;
  }

  _extractTranslationData(filename, content) {
    const $ = cheerio.load(content, {
      decodeEntities: false,
      withStartIndices: true,
    });

    return this._traverseTree($.root()[0].children, [])
      .filter((el) => el.type === 'tag' || el.type === 'text')
      .map((el) => this._parseElement($, el, filename, content))
      .reduce((acc, cur) => acc.concat(cur), [])
      .filter((x) => x !== undefined);
  }

  _hasTranslationToken(node) {
    return this.options.attributes.some((keyword) => node.is(keyword) || node.attr(keyword) !== undefined);
  }
}
