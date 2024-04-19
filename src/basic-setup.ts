import {
    EditorState,
    EditorSelection,
    Compartment,
    SelectionRange,
    Facet,
    StateField,
    StateEffect,
    Transaction,
    Text,
    ChangeSet,
    combineConfig,
    Annotation,
} from "@codemirror/state"
import { julia as julia_andrey } from "@plutojl/lang-julia"
import {
    keymap,
    EditorView,
    highlightSpecialChars,
    drawSelection,
    highlightActiveLine,
    placeholder,
    Decoration,
    ViewUpdate,
    ViewPlugin,
    WidgetType,
    lineNumbers,
    rectangularSelection,
    tooltips,
    showTooltip,
    Tooltip,
    MatchDecorator,
} from "@codemirror/view"
import {
    defaultKeymap,
    indentMore,
    indentLess,
    moveLineUp,
    moveLineDown,
    historyKeymap,
    history,
} from "@codemirror/commands"
import {
    indentOnInput,
    indentUnit,
    syntaxTree,
    syntaxTreeAvailable,
    bracketMatching,
    foldGutter,
    foldKeymap,
    HighlightStyle,
    defaultHighlightStyle,
    syntaxHighlighting,
} from "@codemirror/language"
import { tags } from "@lezer/highlight"
import { closeBrackets, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete"
import * as autocomplete from "@codemirror/autocomplete"
import {
    highlightSelectionMatches,
    searchKeymap,
    selectNextOccurrence,
} from "@codemirror/search"
import { TreeCursor, NodeProp, parseMixed } from "@lezer/common"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { parseCode } from "@lezer/markdown"
import { html, htmlLanguage } from "@codemirror/lang-html"
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript"
import { css, cssLanguage } from "@codemirror/lang-css"
import { sql, PostgreSQL } from "@codemirror/lang-sql"
import { python, pythonLanguage } from "@codemirror/lang-python"
import { collab, receiveUpdates, sendableUpdates, getSyncedVersion, getClientID } from "@codemirror/collab"
import { linter, setDiagnostics, Diagnostic } from "@codemirror/lint"

export { css, cssLanguage }

export {
    Facet,
    StateField,
    StateEffect,
    Transaction,
    ChangeSet,
    indentUnit,
    EditorState,
    EditorSelection,
    Compartment,
    EditorView,
    SelectionRange,
    placeholder,
    julia_andrey,
    keymap,
    history,
    historyKeymap,
    defaultKeymap,
    indentMore,
    indentLess,
    moveLineUp,
    moveLineDown,
    tags,
    HighlightStyle,
    syntaxHighlighting,
    syntaxTree,
    syntaxTreeAvailable,
    autocomplete,
    lineNumbers,
    highlightSpecialChars,
    foldGutter,
    drawSelection,
    indentOnInput,
    defaultHighlightStyle,
    bracketMatching,
    closeBrackets,
    rectangularSelection,
    highlightSelectionMatches,
    closeBracketsKeymap,
    searchKeymap,
    selectNextOccurrence,
    foldKeymap,
    completionKeymap,
    Decoration,
    ViewUpdate,
    ViewPlugin,
    WidgetType,
    TreeCursor,
    Text,
    Annotation,
    combineConfig,
    NodeProp,
    Tooltip,
    tooltips,
    showTooltip,
    MatchDecorator,
    // Syntax Highlighting magic
    markdown,
    markdownLanguage,
    parseCode,
    parseMixed,
    html,
    htmlLanguage,
    javascript,
    javascriptLanguage,
    sql,
    PostgreSQL,
    python,
    pythonLanguage,
    // Collaboration
    collab,
    receiveUpdates,
    sendableUpdates,
    getSyncedVersion,
    getClientID,
    // Linter
    linter,
    setDiagnostics,
    Diagnostic,
}
