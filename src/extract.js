import cheerio from 'cheerio';
import {isHtml} from 'cheerio/lib/utils';
import Pofile from 'pofile';
import * as acorn from 'acorn';
import * as walk from 'acorn/dist/walk';
import * as constants from './constants.js';

// Internal regular expression used to escape special characters
const ESCAPE_REGEX = /[\-\[\]\/{}()*+?.\\^$|]/g;


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


function isNumber(value) {
  return typeof value === 'number';
}


function isString(value) {
  return typeof value === 'string';
}


function _popN(stack, count) {
  return stack.splice(-count, count)
}


const _cartesian = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
const cartesian = (a, b, ...c) => (b ? cartesian(_cartesian(a, b), ...c) : a);


// Functions helpful during development:
// function _dump(value) {
//   return JSON.stringify(value, null, 2);
// }
// function _log() {
//   console.log(...arguments);
// }
// function _log() {}
//
// function _logMapper(text) {
//   _log(`Found "${_dump(text)}"`);
//   return text;
// }


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
    this.tokens = this._getTokens();
    this.filterRegexp = this.createExtractRegexps(this.tokens);
    this.unwrapRegexps = Extractor.createUnwrapRegexps(this.tokens);
  }

  _getTokens() {
    const startDelimiter = this.options.startDelimiter === ''
      ? constants.DEFAULT_START_DELIMITER : this.options.startDelimiter;
    const endDelimiter = this.options.endDelimiter === ''
      ? constants.DEFAULT_END_DELIMITER : this.options.endDelimiter;
    const end = endDelimiter.replace(ESCAPE_REGEX, '\\$&');
    const bodyCore = `(.|\\n)*`;
    return {
      startDelimiter,
      endDelimiter,
      bodyCore,
      end,
      startOrEndQuotes: `(\\&quot;|[\\'"])`,  // matches simple / double / HTML quotes
      spacesOrPipeChar: `\\s*\\|\\s*`,        // matches the pipe string of the filter
      start: startDelimiter.replace(ESCAPE_REGEX, '\\$&'),
      prefix: this.options.filterPrefix === null ?
        '\\s*' : `\\s*(?:${this.options.filterPrefix})?\\s*`,

      body: endDelimiter === '' ? `(${bodyCore})` : `(${bodyCore}?(?!${end}))`,
      filters: this.options.attributes.join('|'),
    };
  }

  createExtractRegexps(tokens) {
    const start = this.options.startDelimiter === '' ? '' : tokens.start;
    const end = this.options.endDelimiter === '' ? '' : tokens.end;

    return new RegExp(`${start}${tokens.prefix}[^'"]*${tokens.startOrEndQuotes}?${tokens.body}\\1${tokens.spacesOrPipeChar}(${tokens.filters})\\s*${end}`, 'g');
  }

  static createUnwrapRegexps(tokens) {
    const coreExpression = `${tokens.prefix}(${tokens.bodyCore})(?:${tokens.spacesOrPipeChar}(?:${tokens.filters}))\\s*`;

    return [
      new RegExp(`^(?:\\s|\\n)*(?:${tokens.start})${coreExpression}(?:${tokens.end})?`),
      new RegExp(`${coreExpression}`)
    ];
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
    if (node[0].type === 'text' || node[0].type === 'comment') {
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

  _compileExpressions(ast) {
    const _state = {
      stack: [],
      output: [],
    };

    walk.full(ast, (node, state) => {
      switch (node.type) {
        case 'Identifier':
          state.stack.push([]);
          break;
        case 'Literal':
          const items = isString(node.value) || isNumber(node.value) ? [node.value] : [];
          state.stack.push(items);
          break;
        case 'MemberExpression':
          _popN(state.stack, 1);
          state.stack.push([]);
          break;
        case 'ConditionalExpression':
          let [test_, consequent, alternate] = _popN(state.stack, node.alternate ? 3 : 2);
          state.stack.push([...consequent, ...alternate]);
          break;
        case 'BinaryExpression':
          const [left, right] = _popN(state.stack, node.left ? 2 : 1);
          if (node.operator === '+') {
            let variants = cartesian((left ? left : state.stack.pop()), right)
              .map((variant) => variant.join(''))
              .reduce((acc, cur) => acc.concat(cur), []);
            state.stack.push(variants);
          } else {
            state.stack.push([]);
          }
          break;
        case 'ExpressionStatement':
          if (state.stack.length) {
            state.stack.pop().forEach((item) => {
              state.output.push(Array.isArray(item) ?
                item.reduce((acc, cur) => acc.concat(cur), []) : item);
            });
          }
          break;
      }
    }, null, _state);

    return _state.output;
  }

  _extractStringsFromMatch(contexts) {
    // Try to parse from wide to narrow contexts.  First successful parse wins.
    for (let i = 0; i < contexts.length; i++) {
      const context = contexts[i];
      let expr = context;

      for (let re of this.unwrapRegexps) {
        const match = re.exec(context);
        if (match !== null) {
          expr = match[1];
          break;
        }
      }

      if (expr.startsWith('&quot;')) {
        return [/^&quot;(.*)&quot;/.exec(expr)[1]];
      }

      if (!expr.match(/['"]/)) {
        continue;
      }
      try {
        return this._compileExpressions(acorn.parse(expr));
      }
      catch (exception) {
        if (i === (contexts.length - 1)) {
          throw exception;
        }
      }
    }
    return [];
  }

  _prepareContexts(match) {
    // Return different contexts around the match, ordered from wide to narrow.
    const context = match[0];
    const contexts = [context];

    const matchIndex = context.lastIndexOf(match[2]);
    const lastStartIndex = context.lastIndexOf(this.tokens.startDelimiter, matchIndex);
    const lastEndIndex = context.lastIndexOf(this.tokens.endDelimiter, matchIndex);

    // Strip greedy matched delimiter scopes; for example: `}}…{{ [match]` --> `{{ [match]`
    if ((lastEndIndex !== -1) &&
      (lastStartIndex > lastEndIndex) &&
      (lastEndIndex < matchIndex)) {
      contexts.push(context.slice(lastEndIndex + this.tokens.endDelimiter.length));
    }

    // Set context to match + surrounding quotes: `[match]` --> `'[match]'`
    if (matchIndex > 1
      && context[matchIndex - 1].match(/(['"])/)
      && context[matchIndex + match[2].length].match(/(['"])/)) {
      contexts.push(context.slice(matchIndex - 1, matchIndex + match[2].length + 1));
    }
    return contexts;
  }

  _getAllMatches(text, matches, re) {
    while (true) {
      const match = re.exec(text);
      if (match === null) {
        break;
      }
      matches.splice(matches.length, 0,
        ...this._extractStringsFromMatch(this._prepareContexts(match)));
    }
    return matches;
  };

  _parseElement($, el, filename, content) {
    if (el.type === 'comment' && isHtml(el.data)) {
      // Recursive parse call if el.data is recognized as HTML.
      return this._extractTranslationDataFromNodes(Array.from($(el.data)), $, filename, content);
    }

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
        try {
          this._getAllMatches(item.text, [], this.filterRegexp)// .map(_logMapper)
            .filter((text) => text.length !== 0)
            .forEach((text) => {
              tokensFromFilters.push(
                new NodeTranslationInfo(node, text, reference,
                  this.options.attributes));
            });

          return tokensFromFilters;
        } catch (exception) {
          throw new SyntaxError(
            `${exception.message.split(/ \(.*\)/)} when trying to parse \`${item.text}\` ${reference.toString(true)}`)
        }
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

  _extractTranslationDataFromNodes(rootChildren, $, filename, content) {
    return this._traverseTree(rootChildren, [])
      .filter((el) => el.type === 'tag' || el.type === 'text' || el.type === 'comment')
      .map((el) => this._parseElement($, el, filename, content))
      .reduce((acc, cur) => acc.concat(cur), [])
      .filter((x) => x !== undefined);
  }

  _extractTranslationData(filename, content) {
    const $ = cheerio.load(content, {
      decodeEntities: false,
      withStartIndices: true,
    });

    return this._extractTranslationDataFromNodes($.root()[0].children, $, filename, content);
  }

  _hasTranslationToken(node) {
    return this.options.attributes.some((keyword) => node.is(keyword) || node.attr(keyword) !== undefined);
  }
}
