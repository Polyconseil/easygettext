export const FILENAME_0 = 'foo.htm';
export const FILENAME_1 = 'bar.htm';
export const FILENAME_2 = 'baz.vue';


export const HTML0_CTX0 =  `
<div><h4 translate="translate" translate-context="For charlie">Hello world</h4></div>`;
export const HTML0_CTX1 =  `
<div><h4 translate="translate" translate-context="For jacques">Hello world</h4></div>`;

export const HTML1_PLURAL0 =  '<h2 translate="" i18n-plural="We work">I work</h2>';
export const HTML1_PLURAL1 =  '<h2 translate="" translate-plural="Us works">I work</h2>';

export const HTML2_COMMENT0 =  '<h2 translate i18n-comment="My first comment">Hello</h2>';
export const HTML2_COMMENT1 =  '<h2 translate="" translate-comment="Another comment">Hello</h2>';

export const HTML3_FILTER0 =  '<h2 translate-comment="Fugazy">{{ "Hola, hombre" | translate }}</h2>';
export const HTML3_FILTER1 =  "<h2 tooltip=\"{{'Hola, mujer'|i18n}}\">StufStuff</h2>";
export const HTML3_FILTER2 =  "<h2 tooltip=\"{{ a || 'Hola, hola'|i18n }}\">StufStuff</h2>";
export const HTML3_FILTER3 =  "<h2 attr=\"{{ &quot;So long, my dear' |i18n }}\">Martha</h2>";
export const HTML3_FILTER4 =  "<h2 attr=\"&quot;So long, my dear' |i18n\">Martha</h2>";
export const HTML3_FILTER5 =  "<h2 attr=\"{{ 'Guns\'n roses, my dear' |i18n }}\">Martha</h2>";
export const HTML3_FILTER6 =  "<h2 attr=\"'Guns\'n roses, my dear' |i18n \">Martha</h2>";
export const HTML3_FILTER7 =  "<h2 attr=\"::'Guns\'n roses, my dear' |i18n \">Martha</h2>";

export const HTML_COMPLEX_NESTING = `<div translate translate-comment="Outer comment …"
     translate-context="Outer Context">
  <div translate translate-comment="Inner comment …"
       translate-context="Inner Context">
    Before {{:: 'I18n before' |translate }}
    <a href="#" aria-label="{{ 'Test link 1' |translate }}">
      {{ 'Link part 1' |translate }}
      {{:: 'Link part 2' |translate }}
      {{ 'Link part 3' |translate }}</a>
    Between {{:: 'I18n between' |translate }}
    <a href="#" aria-label="{{ 'Test link 2' |translate }}">
      {{ 'Reference part 1' |translate }}
      {{:: 'Reference part 2' |translate }}
      {{ 'Reference part 3' |translate }}</a>
    After {{:: 'I18n after' |translate }}
  </div>
</div>`;

export const HTML_LINEBREAK_FILTER = `
<div class="buttons">
<a href="#"
  ng-click="vm.doSomething()"
  class="button">{{ 'Multi-line 0' |translate }}</a>
  
<a href="#"
  ng-click="vm.doSomething()"
  class="button">{{ 
 'Multi-line 1' |translate }}</a>

<a href="#"
  ng-click="vm.doSomething()"
  class="button">{{ 'Multi-line 2'
 |translate }}</a>

<a href="#"
  ng-click="vm.doSomething()"
  class="button">{{'Multi-line 3' |
 translate }}</a>

<a href="#"
  ng-click="vm.doSomething()"
  class="button">{{ 'Multi-line 4' | translate 
}}</a>
`;

export const HTML_TEXT_FILTER = `
{{ 'Outside 0' |translate }}
<div class="buttons">
<a href="#">{{ 'Text 0' |translate }}</a>
{{ 'Between 0' |translate }}
<a href="#">{{ 'Text 3' |translate }}</a>
</div>
{{ 'Outside 1' |translate }}
`;

export const HTML_TEXT_MULTIPLE_FILTER = `
<a href="#">
{{ 'Text 0' |translate }} between
 {{ 'Text 1' |translate }} between again
 {{ 'Text 2' |translate }}
</a>
`;

export const HTML_NESTED_FILTER = `
  <li class="action thumbs-up"
      title="{{::'Like' |translate}}" alt="{{::'Gets extracted now' |translate}}">
      <span ng-bind="::vm.voteCount |translate" alt="{{:: 'Number of votes' |translate}}"></span>
      <span ng-bind-html="::'Votes <i class=\'fa fa-star\'></i>' |translate"></span>
  </li>
`;

export const HTML4_TAG0 =  '<translate>Duck</translate>';
export const HTML4_TAG1 =  '<i18n>Dice</i18n>';
export const HTML4_TAG2 =  '<get-text>Rabbit</get-text>';
export const HTML4_TAG3 =  '<i18n translate>overtranslate</i18n>';

export const HTML_LONG =  `
  <div class="col-xs-4">
  <h4 translate="translate" translate-context="Pour maman">Hello world</h4>
  <h2 translate="" i18n-plural='We work'>I work</h2>
  <tr>
    <th translate="translate">Net amount</th>
    <td class="text-right" translate i18n-comment='foo is important'>{{ ::foo }} deadwine</td>
  </tr>
    <th tronslate>This is not translated</th>
  <tr>
    <th translate>Paid amount</th>
    <h2 translate="" i18n-context='other context'>I work</h2>
    <td class="text-right" i18n>something {{ bar }} is here</td>
  </tr>
`;

export const HTML_SORTING =  `
  <i18n>f</i18n>
  <i18n>0</i18n>
  <i18n>c</i18n>
  <i18n>abu</i18n>
  <i18n>2 mississipi</i18n>
  <i18n>b</i18n>
  <i18n>a</i18n>
  <i18n>1 mississippi</i18n>
  <i18n>e</i18n>
  <i18n>12 mississipi</i18n>
  <i18n>g</i18n>
  <i18n>3</i18n>
  <i18n>aba</i18n>
  <i18n>2</i18n>
  <i18n>d</i18n>
`;

export const POT_OUTPUT_0 = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Generated-By: easygettext\\n"
"Project-Id-Version: \\n"

#: foo.htm
msgctxt "For charlie"
msgid "Hello world"
msgstr ""
`;

export const POT_OUTPUT_1 = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Generated-By: easygettext\\n"
"Project-Id-Version: \\n"

#: foo.htm
msgctxt "For charlie"
msgid "Hello world"
msgstr ""

#: bar.htm
msgid "I work"
msgid_plural "We work"
msgstr[0] ""
msgstr[1] ""
`;

export const POT_OUTPUT_CONTEXTS = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Generated-By: easygettext\\n"
"Project-Id-Version: \\n"

#: foo.htm
msgctxt "For charlie"
msgid "Hello world"
msgstr ""

#: bar.htm
msgctxt "For jacques"
msgid "Hello world"
msgstr ""
`;

export const POT_OUTPUT_TAGS = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Generated-By: easygettext\\n"
"Project-Id-Version: \\n"

#: bar.htm
msgid "Dice"
msgstr ""

#: foo.htm
msgid "Duck"
msgstr ""

#: baz.vue
msgid "Rabbit"
msgstr ""
`;

export const POT_OUTPUT_MULTIPLE_TAGS = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Generated-By: easygettext\\n"
"Project-Id-Version: \\n"

#: foo.htm
msgid "overtranslate"
msgstr ""
`;


export const POT_OUTPUT_MULTIREF = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Generated-By: easygettext\\n"
"Project-Id-Version: \\n"

#: foo.htm
#: bar.htm
msgctxt "For charlie"
msgid "Hello world"
msgstr ""
`;

export const POT_OUTPUT_MULTICOMMENTS = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Generated-By: easygettext\\n"
"Project-Id-Version: \\n"

#. My first comment
#. Another comment
#: foo.htm
#: bar.htm
msgid "Hello"
msgstr ""
`;

export const POT_OUTPUT_SORTED= `msgid ""
msgstr ""
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Generated-By: easygettext\\n"
"Project-Id-Version: \\n"

#: foo.htm
msgid "0"
msgstr ""

#: foo.htm
msgid "1 mississippi"
msgstr ""

#: foo.htm
msgid "12 mississipi"
msgstr ""

#: foo.htm
msgid "2"
msgstr ""

#: foo.htm
msgid "2 mississipi"
msgstr ""

#: foo.htm
msgid "3"
msgstr ""

#: foo.htm
msgid "a"
msgstr ""

#: foo.htm
msgid "aba"
msgstr ""

#: foo.htm
msgid "abu"
msgstr ""

#: foo.htm
msgid "b"
msgstr ""

#: foo.htm
msgid "c"
msgstr ""

#: foo.htm
msgid "d"
msgstr ""

#: foo.htm
msgid "e"
msgstr ""

#: foo.htm
msgid "f"
msgstr ""

#: foo.htm
msgid "g"
msgstr ""
`;

export const INPUT_PO = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\n"
"Content-Transfer-Encoding: 8bit\n"
"Project-Id-Version: \n"
"Last-Translator: Automatically generated\n"
"Language-Team: none\n"
"Language: fr\n"
"MIME-Version: 1.0\n"
"Plural-Forms: nplurals=2; plural=(n > 1);\n"

msgid "Hello, you !"
msgstr "Salut, toi !"

msgctxt "In spanish"
msgid "Hello, you !"
msgstr "Hola ustedes !"

msgid "(1 attempt)"
msgid_plural "({{ remaining }} attempts)"
msgstr[0] "(1 tentative)"
msgstr[1] "({{ remaining }} tentatives)"

#, fuzzy
msgid "Action"
msgstr "Something"

msgid "Action failure"
msgstr ""`;

export const OUTPUT_DICT = {
  headers: {
    '': '',
    'Content-Transfer-Encoding': '8bit',
    'Content-Type': 'text/plain; charset=UTF-8',
    'Language': 'fr',
    'Language-Team': 'none',
    'Last-Translator': 'Automatically generated',
    'MIME-Version': '1.0',
    'PO-Revision-Date': '',
    'POT-Creation-Date': '',
    'Plural-Forms': 'nplurals=2; plural=(n > 1);',
    'Project-Id-Version': '',
    'Report-Msgid-Bugs-To': '',
  }, messages: {
    '(1 attempt)': [
      '(1 tentative)',
      '({{ remaining }} tentatives)',
    ],
    'Hello, you !': {
      '': 'Salut, toi !',
      'In spanish': 'Hola ustedes !',
    },
  },
};

