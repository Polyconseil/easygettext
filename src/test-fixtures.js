exports.FILENAME_0             = 'foo.htm';
exports.FILENAME_1             = 'bar.htm';
exports.FILENAME_2             = 'baz.vue';
exports.VUE_COMPONENT_FILENAME = 'GreetingsComponent.vue';


exports.HTML0_CTX0 = `
<div><h4 translate="translate" translate-context="For charlie">Hello world</h4></div>`;
exports.HTML0_CTX1 = `
<div><h4 translate="translate" translate-context="For jacques">Hello world</h4></div>`;

exports.HTML1_PLURAL0 = '<h2 translate="" i18n-plural="We work">I work</h2>';
exports.HTML1_PLURAL1 = '<h2 translate="" translate-plural="Us works">I work</h2>';

exports.HTML2_COMMENT0 = '<h2 translate i18n-comment="My first comment">Hello</h2>';
exports.HTML2_COMMENT1 = '<h2 translate="" translate-comment="Another comment">Hello</h2>';

exports.HTML3_FILTER0 = '<h2 translate-comment="Fugazy">{{ "Hola, hombre" | translate }}</h2>';
exports.HTML3_FILTER1 = '<h2 tooltip="{{\'Hola, mujer\'|i18n}}">StufStuff</h2>';
exports.HTML3_FILTER2 = '<h2 tooltip="{{ a || \'Hola, hola\'|i18n }}">StufStuff</h2>';
exports.HTML3_FILTER3 = '<h2 attr="{{ &quot;So long, my dear&quot; |i18n }}">Martha</h2>';
exports.HTML3_FILTER4 = '<h2 attr="&quot;So long, my dear&quot; |i18n">Martha</h2>';
exports.HTML3_FILTER5 = '<h2 attr="{{ \'Guns\\\'n roses, my dear\' |i18n }}">Son</h2>';
exports.HTML3_FILTER6 = '<h2 attr="\'Guns\\\'n roses, my dear\' |i18n ">Daughter</h2>';
exports.HTML3_FILTER7 = '<h2 attr="::\'Guns\\\'n roses, my dear\' |i18n ">Wife</h2>';

exports.HTML_FILTER_SPLIT_STRING = `
<h2 ng-bind="::'Three' +' parts, '  +   'one whole.' |i18n ">Will be replaced</h2>
`;

exports.HTML_FILTER_ESCAPED_QUOTES = `
{{ 'Life\\'s a tough teacher.' |translate}} 
{{ "Life's a tough journey." |translate}}
{{ "Life\\'s a tough road." |translate}}
{{ "Life's a tough \\"boulevard\\"." |translate}}
{{ 'Life\\'s a tough \\'journey\\'.' |translate}}
`;

exports.HTML_VARIED_CHALLENGES = `
<div aria-label="Message Selected Users">
  <button type="button" 
          ng-class="{'active': vm.messageView === 'preview', disabled: !vm.useHtml}"
          ng-bind="vm.messageView !== 'preview' ? 'Preview' : 'Exit Preview' |translate"></button>
  <div>
    <button type="button" ng-bind="'Send Message' |translate" ></button>
    <button type="button" ng-bind="'Reset' |translate" ></button>
    <button type="button" ng-bind="'Cancel' |translate"></button>
  </div>
</div>
`;

exports.HTML_FILTER_SPLIT_MULTILINE_STRING_ATTR = `
<h2 ng-bind="::'Four' +
 ' parts, ' +
  'maybe, '
  + 'one whole.' |i18n ">Will be replaced</h2>
`;

exports.HTML_FILTER_SPLIT_MULTILINE_STRING_INTERPOLATED = `
<h2>{{::'Four' +
 ' parts, ' +
  'probably, '
  + 'one whole.' |i18n}}</h2>
`;


exports.HTML_COMPLEX_NESTING = `<div translate translate-comment="Outer comment …"
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

exports.HTML_LINEBREAK_FILTER = `
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

exports.HTML_TEXT_CHALLENGE = `
<p>{{ 'Thanks for joining ….  However, … does not start until'
  |translate }}
  <span>{{ vm.startDatetime |amCalendar}}</span>{{ ', but will open' |
  translate}}
  {{ vm.roll_call_duration_minutes }}
  {{ 'minutes before that.' |translate }}
</p>
`;

exports.HTML_TEXT_FILTER = `
{{ 'Outside 0' |translate }}
<div class="buttons">
<a href="#">{{ 'Text 0' |translate }}</a>
{{ 'Between 0' |translate }}
<a href="#">{{ 'Text 3' |translate }}</a>
</div>
{{ 'Outside 1' |translate }}
`;

exports.HTML_TEXT_MULTIPLE_FILTER = `
<a href="#">
{{ 'Text 0' |translate }} between
 {{ 'Text 1' |translate }} between again
 {{ 'Text 2' |translate }}
</a>
`;

exports.HTML_TEXT_FILTER_COMMENT = `
<!doctype html>
<a href="#">
  <!-- First comment -->
  {{:: 'Text 1' |translate }} between again
  <!-- Second comment -->
</a>
`;

exports.HTML_NESTED_FILTER = `
  <li class="action thumbs-up"
      title="{{::'Like' |translate}}" alt="{{::'Gets extracted now' |translate}}">
      <span ng-bind="::vm.voteCount |translate" alt="{{:: 'Number of votes' |translate}}"></span>
      <span ng-bind-html="::'Votes <i class=\\'fa fa-star\\'></i>' |translate"></span>
  </li>
`;

exports.HTML_COMMENTED_NESTED_FILTER = `
<!--
${exports.HTML_NESTED_FILTER}
-->
`;

exports.HTML_COMMENTED_COMPLEX_NESTING = `
<!--
${exports.HTML_COMPLEX_NESTING}
-->
`;

exports.HTML4_TAG0 = '<translate>Duck</translate>';
exports.HTML4_TAG1 = '<i18n>Dice</i18n>';
exports.HTML4_TAG2 = '<get-text>Rabbit</get-text>';
exports.HTML4_TAG3 = '<i18n translate>overtranslate</i18n>';
exports.HTML4_TAG4 = '<i18n translate>Life\'s a tough "journey"</i18n>';
exports.HTML4_TAG5 = '<div attr="{{ \'Life\\\'s a tough teacher\' |translate}}"></div>';
exports.HTML4_TAG6 = `
<label class="btn btn-primary"
       ng-class="{'active': vm.respectUsersPreferences}">
  <input type="checkbox"
         ng-model="vm.respectUsersPreferences"
         autocomplete="off">{{'Respect Users\\' Preferences' | translate}}
</label>
`;

exports.HTML_LONG = `
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

exports.HTML_SORTING = `
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

exports.HTML_JS_EXPRESSION_COMPLEX_FILTERS = `
<span ng-bind="'Bed n\\'' + ' breakfast' |translate"></span>
<span ng-bind="true ? 'Always' : 'Never' |i18n "></span>
<span ng-bind="'This will ' + (true ? 'always' : 'never') + ' be true' |i18n "></span>
<span ng-bind="isNight ? 'Moon' + 'shine' : 'Day' + 'light' |translate"></span>
<--! AB, Ab, a -->
<span ng-bind="isATrue ? 'A' + (isBTrue ? 'B' : 'b') : 'a' |i18n "></span>
<--! CD, Cd, cE, ce -->
<span ng-bind="isC ? 'C' + (isD ? 'D' : 'd') : 'c' + (isE ? 'E' : 'e') |i18n "></span>
`;

exports.HTML_JS_EXPRESSION_WITH_NUMBER = `
{{ 'A' + 42 + '.' |translate }}
`;

exports.HTML_JS_EXPRESSION_SYNTAX_ERROR = `
{{ 'A' + b' |translate }}
`;

exports.HTML_INCOMPLETE_COMMENT = `
<!--ng-bind="'Cancel' |translate"></button>-->
`;

exports.HTML_DELIMITERS_INSIDE_FILTER_TEXT = `
<p ng-bind="'You received {{ vm.count}} coins!' |translate"></p>
`;

exports.VUE_COMPONENT_WITH_SCRIPT_TAG = `
    <template>
        <h1>{{ greeting_message }}</h1>
    </template>
    <script>
        export default {
            name: "greetings",
            computed: {
                greeting_message() {
                    return this.$gettext("Hello there!")
                },
                duplicated_greeting_message() {
                    return this.$gettext("Hello there!")
                },
                answer_message() {
                    return this.$gettext("General Kenobi! You are a bold one.")
                }
            },
            methods: {
                async getGreetingMessageAnswer() {
                    return await Promise.resolve('General Kenobi!');
                }
            }
        }
     </script>
`;

exports.VUE_COMPONENT_EXPECTED_PROCESSED_SCRIPT_TAG = `//
//
//
//

export default {
    name: "greetings",
    computed: {
        greeting_message() {
            return this.$gettext("Hello there!")
        },
        duplicated_greeting_message() {
            return this.$gettext("Hello there!")
        },
        answer_message() {
            return this.$gettext("General Kenobi! You are a bold one.")
        }
    },
    methods: {
        async getGreetingMessageAnswer() {
            return await Promise.resolve('General Kenobi!');
        }
    }
}`;

exports.SCRIPT_USING_NGETTEXT = `
    export default {
        name: "greetings",
        methods: {
            alertPlural (n) {
              let translated = this.$ngettext('%{ n } foo', '%{ n } foos', n)
              let interpolated = this.$gettextInterpolate(translated, {n: n})
              return window.alert(interpolated)
            },
        }
    }
`;

exports.SCRIPT_USING_PGETTEXT = `
    export default {
        name: "menuEntry",
        computed: {
            getEntryLabel() {
                return this.$pgettext("menu", "Home")
            },
            getEntryLabel() {
                return this.$pgettext("house", "Home")
            },
        }
    }
`;

exports.SCRIPT_CONTAINING_DECOYS = `
import $gettext from '@helper/gettext';

export default {
  name: "$gettext", // because some people are actually weird
  computed: {
    message() {
      return this.$gettext('Hello world from the $gettext function');
    }
  }
}`;

exports.SCRIPT_WITH_ES_STAGE3_FEATURES = `
const asyncModule = () => import('module');
const message = this.$gettext('Hello world from the future');
`;

exports.POT_OUTPUT_0 = `msgid ""
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

exports.POT_OUTPUT_1 = `msgid ""
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

exports.POT_OUTPUT_CONTEXTS = `msgid ""
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

exports.POT_OUTPUT_TAGS = `msgid ""
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

exports.POT_OUTPUT_QUOTES = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Generated-By: easygettext\\n"
"Project-Id-Version: \\n"

#: foo.htm
msgid "Life's a tough \\"journey\\""
msgstr ""

#: bar.htm
msgid "Life's a tough teacher"
msgstr ""

#: baz.vue
msgid "Respect Users' Preferences"
msgstr ""
`;

exports.POT_OUTPUT_MULTIPLE_TAGS = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Generated-By: easygettext\\n"
"Project-Id-Version: \\n"

#: foo.htm
msgid "overtranslate"
msgstr ""
`;


exports.POT_OUTPUT_MULTIREF = `msgid ""
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

exports.POT_OUTPUT_MULTICOMMENTS = `msgid ""
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

exports.POT_OUTPUT_SORTED = `msgid ""
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

exports.INPUT_PO = `msgid ""
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

exports.OUTPUT_DICT = {
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

exports.POT_OUTPUT_VUE_SCRIPT_GETTEXT = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Generated-By: easygettext\\n"
"Project-Id-Version: \\n"

#: GreetingsComponent.vue
msgid "General Kenobi! You are a bold one."
msgstr ""

#: GreetingsComponent.vue
msgid "Hello there!"
msgstr ""
`;

exports.POT_OUTPUT_VUE_SCRIPT_NGETTEXT = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Generated-By: easygettext\\n"
"Project-Id-Version: \\n"

#: GreetingsComponent.vue
msgid "%{ n } foo"
msgid_plural "%{ n } foos"
msgstr[0] ""
msgstr[1] ""
`;

exports.POT_OUTPUT_VUE_SCRIPT_PGETTEXT = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Generated-By: easygettext\\n"
"Project-Id-Version: \\n"

#: GreetingsComponent.vue
msgctxt "house"
msgid "Home"
msgstr ""

#: GreetingsComponent.vue
msgctxt "menu"
msgid "Home"
msgstr ""
`;

exports.SCRIPT_GETTEXT_SEQUENCE_FILENAME = 'gettext_sequence.vue';
exports.SCRIPT_GETTEXT_SEQUENCE = `
export default {
  name: 'greetings-sequence',
  computed: {
    messages_object() {
      return {
        an_array: [this.$gettext('Hello there!'), this.$gettext('Hello there!')],
        a_string: this.$gettext('Hello there!'),
      }
    }
  }
}`;
