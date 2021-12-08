import * as state from "@codemirror/state";
import * as view from "@codemirror/view";
import * as autocomplete from "@codemirror/autocomplete";
import * as highlight from "@codemirror/highlight";
import * as lezer_common from "@lezer/common";
import * as language from "@codemirror/language";
import * as commands from "@codemirror/commands";

import { StreamLanguage } from "@codemirror/stream-parser";
import { julia as julia_legacy } from "@codemirror/legacy-modes/mode/julia";
import { julia as julia_andrey } from "lang-julia";
import { lineNumbers } from "@codemirror/gutter";
import { historyKeymap, history } from "@codemirror/history";
import { rectangularSelection } from "@codemirror/rectangular-selection";
import { foldGutter, foldKeymap } from "@codemirror/fold";
import { bracketMatching } from "@codemirror/matchbrackets";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/closebrackets";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { commentKeymap } from "@codemirror/comment";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { html, htmlLanguage } from "@codemirror/lang-html";
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";
import { sql, PostgreSQL } from "@codemirror/lang-sql";
import { python, pythonLanguage } from "@codemirror/lang-python";

// autocomplete exports we used to export - TODO REMOVE
export let autocompletion = autocomplete.autocompletion;
export let completionKeymap = autocomplete.completionKeymap;

export {
  state,
  view,
  autocomplete,
  highlight,
  lezer_common,
  language,
  commands,
  julia_legacy,
  julia_andrey,
  history,
  historyKeymap,
  StreamLanguage,
  lineNumbers,
  foldGutter,
  bracketMatching,
  closeBrackets,
  rectangularSelection,
  highlightSelectionMatches,
  closeBracketsKeymap,
  searchKeymap,
  foldKeymap,
  commentKeymap,
  markdown,
  markdownLanguage,
  html,
  htmlLanguage,
  javascript,
  javascriptLanguage,
  sql,
  PostgreSQL,
  python,
  pythonLanguage,
};
