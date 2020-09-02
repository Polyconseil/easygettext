# easygettext

[![Build Status](https://travis-ci.org/Polyconseil/easygettext.svg?branch=master)](https://travis-ci.org/Polyconseil/easygettext)
[![codecov.io](https://codecov.io/github/Polyconseil/easygettext/coverage.svg?branch=master)](https://codecov.io/github/Polyconseil/easygettext?branch=master)

Radically simple gettext tokens extraction tool for:

- HTML
- Jade/Pug
- Javascript/ES7+
- Vue
- TypeScript (see [Known Issues](#known-issues))
- Nativescript Vue with [native and web shared code](https://www.nativescript.org/vue)

files.

Also ships with a PO-to-JSON converter.

### Installation
You can install the [easygettext](https://www.npmjs.com/package/easygettext) package by running 
```bash
npm install --save-dev easygettext
```
or 
```bash
yarn add --dev easygettext
```


### Usage & Examples

#### HTML token extraction

Simply invoke the tool on the templates you want to extract a POT dictionary template from.
The optional '--output' argument enables you to directly output to a file.

```
gettext-extract --output dictionary.pot foo.html bar.pug component.vue sourcefile.js
```

**CLI usage:**
```
gettext-extract [--attribute EXTRA-ATTRIBUTE] [--filterPrefix FILTER-PREFIX] [--output OUTFILE] [--parser auto|acorn|babel] <FILES>
```

It recognizes the following token flavours (currently; feel free to extend it!)

```html
<div translate>Hello World</div>

<div translate translate-context="According to...">Hello World</div>

<div translate translate-comment="My comment...">Hello World</div>

<div translate translate-plural="Hello worlds">Hello World</div>

<div placeholder="{{ 'Hello World' | translate }}"></div>

<div placeholder="{{ scopeVariable || ('Hello World' | translate) }}"></div>

<get-text>Hello World</get-text>

<i18n>Hello World</i18n>

<translate>Hello World</translate>

<!--  The following becomes 'Broken strings are joined'  --> 
<span ng-bind="{{ 'Broken '
 + 'strings ' +
 'are ' + 
 'joined' |translate}}"></span>

 <span ng-bind="'Bed n\'' + ' breakfast' |translate"></span>

 <!-- JavaScript expressions are parsed and compiled -->
<span ng-bind="true ? 'Always' : 'Never' |i18n "></span>

<!--  By supplying the  --filterPrefix '::' parameter  -->  
<span>{{:: 'Something …' |translate}}</span>

<!--  The default delimiters '{{' and '}}' must be changed to empty strings to handle these examples  -->
<span ng-bind=":: 'Something …' |translate"></span>

<div placeholder="'Hello World' | translate"></div>
```

You can combine any context, comment and plural together. Also, you can use 'i18n' instead
of 'translate' as master token.

You can also provide your own master tokens:

```bash
gettext-extract --attribute v-translate --output dictionary.pot foo.html bar.jade

gettext-extract --attribute v-translate --attribute v-i18n --output dictionary.pot foo.html bar.jade

gettext-extract --startDelimiter '[#' --endDelimiter '#]' --output dictionary.pot foo.html bar.jade
```

`gettext-extract` can also remove optional HTML whitespaces inside tags to translate (see [PR 68](https://github.com/Polyconseil/easygettext/pull/68) for more information):

```
gettext-extract --removeHTMLWhitespaces --output dictionary.pot foo.html
```

#### Supports parsing with acorn and babel

If you want to use optional-chaining, nullish-coalesce or any babel plugin, you might want to set the parameter `--parser babel`.

```
gettext-extract --parser babel --output dictionary.pot foo.html
```

It can be set to:
`--parser` `auto|acorn|babel`

More info at [PR 72](https://github.com/Polyconseil/easygettext/pull/72)


#### Javascript/ES7 token extraction

The usage stays the same but with a Javascript file !

```bash
gettext-extract somefile.js
```

```javascript

const myVar = $gettext("My fantastic msgid")

const myConcatVar = $gettext(
  "My"
  + "fantastic"
  + "msgid"
)

const myTempVar = $gettext(
  `My
  fantastic
  msgid`
)

const myContextualizedVar = $pgettext("some context", "Some other string")

const myPluralVar = $ngettext(...)
```

We recognize the ``$gettext``, ``$pgettext`` and ``$ngettext`` tokens as the ones from which we can extract text from.

Those tokens are frozen for now, but feel free to make a pull request and add support for variable ones :)

We currently can't extract **template strings with variables** though.


#### Extract from Vue components

You can also extract the strings marked as translatable inside the ``<script>`` and ``<template>`` sections of Vue.js components:

```bash
gettext-extract MyComponent.vue
```

With a component that looks like this:

```html
    <template>
        <h1>{{ greeting_message }}</h1>
        <p>{{ number_of_people_here }}</p>

        <h2 v-translate> Some text to be translated
    </template>

    <script>
        export default {
            name: "greetings",
            computed: {
                greeting_message() {
                    return this.$gettext("Hello there!")
                },
                number_of_people_here(nb_folks) {
                    return this.$ngettext("There is ${ n } person here.", "There are ${ n } persons here.", nb_folks)
                }
            }
        }
    </script>
```

The Javascript & HTML (or Pug) extraction within a Vue component works with the same rules as stated upper in this document.


#### Extracting from multiple files
`gettext-extract` needs the exact file paths to work. If you want to extract gettext from all files in a folder, you can use the UNIX find command. Here is an example as a npm script:

```jsonc
{
  //...
  "scripts": {
    // This is for VueJS files, please adapt for HTML or Jade/Pug templates
    "extract-gettext-cli": "gettext-extract --attribute v-translate --output dictionary.pot $(find scripts/src/components -type f -name '*.vue')"
  }
}
```


#### gettext-compile

Outputs or writes to an output file, the sanitized JSON version of a PO file.

```bash
gettext-compile --output translations.json fr.po en.po de.po
```

### AngularJS
If you use `easygettext` to extract files from an AngularJS code base, you might find the following tips helpful.

To cover the cases (1)
```html
<input placeholder="{{:: 'Insert name …' |translate }}">
<input placeholder="{{ 'Insert name …' |translate }}">
```

and (2)
```html
<a href="#" ng-bind=":: 'Link text' |translate"></a>
<a href="#" ng-bind="'Link text' |translate"></a>
<a href="#">{{::'Link text' |translate}}</a>
<a href="#">{{'Link text' |translate}}</a>
``` 
you should run the extraction tool twice.  Once with the command-line arguments
```bash
--startDelimiter '{{' --endDelimiter '}}' --filterPrefix '::'
```
and once with the command-line arguments

```bash
--output ${html_b} --startDelimiter '' --endDelimiter '' --filterPrefix '::'
```

The following Bash script shows how `msgcat` might help
```bash
#!/usr/bin/env bash

input_files="$(find ./src/ -iname \*\.html)"
workdir=$(mktemp -d "${TMPDIR:-/tmp/}$(basename $0).XXXXXXXXXXXX") || exit 1

html_a=${workdir}/messages-html-interpolate.pot
html_b=${workdir}/messages-html.pot

./dist/extract-cli.js --output ${html_a} --startDelimiter '{{' --endDelimiter '}}' --filterPrefix '::' ${input_files}
./dist/extract-cli.js --output ${html_b} --startDelimiter '' --endDelimiter '' --filterPrefix '::' ${input_files}

# Extract gettext “messages” from JavaScript files here, into ${es_a} …
es_a=${workdir}/ecmascript.pot
# [...] > ${es_a}

# Merge the different catalog templates with `msgcat`:  
merged_pot=${workdir}/merged.pot
msgcat ${html_a} ${html_b} ${es_a} > ${merged_pot}

# Cleanup, in case `msgcat` gave merge-conflicts in catalog header.
header=${workdir}/header.pot
sed -e '/^$/q' < ${html_a} > ${header}

body=${workdir}/body.pot
sed '1,/^$/d' < ${merged_pot} > ${body}

cat ${header} ${body} > ${output_file}

# Remove temporary directory with working files.
rm -r ${workdir}
``` 
Please note that the script needs to be modified to match your needs and environment.

### Testing

Run the tests using [jest](https://jestjs.io/):

```bash
npm test
```

### Testing the CLI

Run:

```bash
./src/extract-cli.js --attribute v-translate --attribute v-i18n ~/output.html
```


### Motivation

[angular-gettext](https://angular-gettext.rocketeer.be/) is a very neat tool, that comes with Grunt tooling
to extract translation tokens from your Pug/Jade/HTML templates and JavaScript code.

Unfortunately, this has two drawbacks:

- It isn't a simple command-line interface, and forces the usage of Grunt;
- It is angular-specific.

This library comes up with two simple CLI tools to extract and compile your HTML tokens.

### Why This Library?

Our frontend toolchain, [systematic](https://github.com/Polyconseil/systematic) doesn't rely on Grunt/Gulp/Broccoli/...
and uses a combination of simple Makefiles and CLI tools to do the job.

The toolchain being framework-agnostic, we don't want to depend on Angular to extract our HTML translation tokens.
On another note, we use the standard [xgettext](http://www.gnu.org/savannah-checkouts/gnu/gettext/manual/html_node/xgettext-Invocation.html)
tool to extract our JavaScript translation tokens.

Nevertheless, the way [angular-gettext](https://angular-gettext.rocketeer.be/) does it (with tokens, directly in HTML) is elegant, is used by many other
libraries and will also be the way to do it in Angular2.

Also, by utilizing either [acorn](https://github.com/ternjs/acorn) or [babel](https://github.com/babel/babel), this tool will parse and compile typical JavaScript expressions used in translate-filter expressions. For example, exposed to a (AngularJS-based) fragment like
```html
<span ng-bind="isNight ? 'Moon' + 'shine' : 'Day' + 'light' |translate"></span>
<span ng-bind="isC ? 'C' + (isD ? 'D' : 'd') : 'c' + (isE ? 'E' : 'e') |i18n "></span>
``` 
will produce the following strings
```text
Moonshine
Daylight
CD
Cd
cE
ce
``` 
Which will be correctly looked up and translated during runtime, at least by [angular-gettext](https://angular-gettext.rocketeer.be/). 

### Known Issues

TypeScript support is currently limited in that line numbers are not tracked and won't show in generated .po files. This can lead to issues with more complex translations and should be kept in mind.

### Credits

Thanks a million to [@rubenv](https://github.com/rubenv) for the initial ideas and
implementations in angular-gettext-tools, which inspired me a lot.

Thanks to ES6 and Babel for being awesome.

### Licensing

MIT
