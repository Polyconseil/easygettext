# easygettext

[![Build Status](https://travis-ci.org/Polyconseil/easygettext.svg?branch=master)](https://travis-ci.org/Polyconseil/easygettext)
[![codecov.io](https://codecov.io/github/Polyconseil/easygettext/coverage.svg?branch=master)](https://codecov.io/github/Polyconseil/easygettext?branch=master)

Simple gettext tokens extraction tools for HTML and Pug files. Also converts from PO to JSON.

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

Also, by utilizing [acorn](https://github.com/ternjs/acorn), this tool will parse and compile typical JavaScript expressions used in translate-filter expressions.  For example, exposed to a (AngularJS-based) fragment like 
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

### Installation
You can install the [easygettext](https://www.npmjs.com/package/easygettext) package by running 
```bash
npm install --dev easygettext
```
or 
```bash
yarn add --save-dev easygettext
```


### Usage & Examples

##### gettext-extract

Simply invoke the tool on the templates you want to extract a POT dictionary template from.
The optional '--ouput' argument enables you to directly output to a file.

```
gettext-extract --output dictionary.pot foo.html bar.pug hello.vue
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

Also, it's able to parse Jade/Pug and Vue component files, even if those themselves contain Jade or Pug
templates.

You can combine any context, comment and plural together. Also, you can use 'i18n' instead
of 'translate' as master token.

You can also provide your own master tokens:

```bash
gettext-extract --attribute v-translate --output dictionary.pot foo.html bar.jade

gettext-extract --attribute v-translate --attribute v-i18n --output dictionary.pot foo.html bar.jade

gettext-extract --startDelimiter '[#' --endDelimiter '#]' --output dictionary.pot foo.html bar.jade
```

##### Extract from multiple files
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

##### Extract from <script> section in Vue.js components
You can also extract the strings marked as translatable inside the <script> section of Vue.js components:

```html
    <template>
        <h1>{{ greeting_message }}</h1>
        <p>{{ number_of_people_here }}</p>
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

> For the moment, only the the extraction of strings localized using the $gettext, $ngettext and $pgettext functions of [vue-gettext](https://github.com/Polyconseil/vue-gettext) is supported.

##### gettext-compile

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

Run the tests using [mocha](https://mochajs.org/):

```bash
npm test
```

We also have extensive coverage:

```bash
npm run cover
```

### Testing the CLI

Run:

```bash
npm run prepublish
```

Then run `extract-cli.js`:

```bash
./dist/extract-cli.js --attribute v-translate --attribute v-i18n ~/output.html
```

### Credits

Thanks a million to [@rubenv](https://github.com/rubenv) for the initial ideas and
implementations in angular-gettext-tools, which inspired me a lot.

Thanks to ES6 and Babel for being awesome.

### Licensing

MIT
