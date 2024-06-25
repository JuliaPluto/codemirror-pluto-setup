export {
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
export {
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
export {
    defaultKeymap,
    indentMore,
    indentLess,
    moveLineUp,
    moveLineDown,
    historyKeymap,
    history,
} from "@codemirror/commands"
export {
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
export { closeBrackets, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete"
export * as autocomplete from "@codemirror/autocomplete"
export {
    highlightSelectionMatches,
    searchKeymap,
    selectNextOccurrence,
} from "@codemirror/search"
export { collab, receiveUpdates, sendableUpdates, getSyncedVersion, getClientID } from "@codemirror/collab"
export { linter, setDiagnostics, Diagnostic } from "@codemirror/lint"
export { TreeCursor, NodeProp, parseMixed } from "@lezer/common"
export { tags } from "@lezer/highlight"

// Language support
export { julia as julia_andrey } from "@plutojl/lang-julia"
export { markdown, markdownLanguage } from "@codemirror/lang-markdown"
export { parseCode } from "@lezer/markdown"
export { html, htmlLanguage } from "@codemirror/lang-html"
export { css, cssLanguage } from "@codemirror/lang-css"
export { javascript, javascriptLanguage } from "@codemirror/lang-javascript"
export { sql, PostgreSQL } from "@codemirror/lang-sql"
export { python, pythonLanguage } from "@codemirror/lang-python"
