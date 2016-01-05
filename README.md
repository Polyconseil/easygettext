# easygettext

[![Build Status](https://travis-ci.org/Polyconseil/easygettext.svg?branch=master)](https://travis-ci.org/Polyconseil/easygettext)
[![codecov.io](https://codecov.io/github/Polyconseil/easygettext/coverage.svg?branch=master)](https://codecov.io/github/Polyconseil/easygettext?branch=master)

Simple gettext tokens extraction tools for HTML and Jade files. Also converts from PO to JSON.

### Motivation

[angular-gettext](https://angular-gettext.rocketeer.be/) is a very neat tool, that comes with Grunt tooling
to extract translation tokens from your Jade/HTML templates and JavaScript code.

Unfortunately, this has two drawbacks:

- It isn't a simple command-line interface, and forces the usage of Grunt;
- It is angular-specific.

This library comes up with two simple CLI tools to extract and compile your HTML tokens.

### Why this library?

Our frontend toolchain, [systematic](https://github.com/Polyconseil/systematic) doesn't rely on Grunt/Gulp/Broccoli/...
and uses a combination of simple Makefiles and CLI tools to do the job.

The toolchain being framework-agnostic, we don't want to depend on Angular to extract our HTML translation tokens.
On another note, we use the standard [xgettext](http://www.gnu.org/savannah-checkouts/gnu/gettext/manual/html_node/xgettext-Invocation.html)
tool to extract our JavaScript translation tokens.

Nevertheless, the way [angular-gettext] does it (with tokens, directly in HTML) is elegant, is used by many other
libraries and will also be the way to do it in Angular2.



### Usage & Examples

##### gettext-extract

Simply invoke the tool on the templates you want to extract a POT dictionary template from.
The optional '--ouput' argument enables you to directly output to a file.

```
gettext-extract --output dictionary.pot foo.html bar.jade
```

It recognizes the following token flavours (currently; feel free to extend it!)

```
<div translate>Hello World</div>
<div translate translate-context="According to...">Hello World</div>
<div translate translate-comment="My comment...">Hello World</div>
<div translate translate-plural="Hello worlds">Hello World</div>
<div placeholder="{{ 'Hello World' | translate }}"></div>
<div placeholder="{{ scopeVariable || ('Hello World' | translate) }}"></div>
```

You can combine any context, comment and plural together. Also, you can use 'i18n' instead
of 'translate' as master token.

##### gettext-compile

Outputs or writes to an output file, the sanitized JSON version of a PO file.

```
gettext-compile --output cn-translations.json cn.po
```

### Testing

Run the tests using [mocha](https://mochajs.org/):

```
npm test
```

We also have extensive coverage:

```
npm run cover
```

### Credits

Thanks a million to [@rubenv](https://github.com/rubenv) for the initial ideas and
implementations in angular-gettext-tools, which inspired me a lot.

Thanks to ES6 and Babel for being awesome.

### Licensing

MIT
