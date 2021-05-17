'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var view = require('@codemirror/view');
var state = require('@codemirror/state');
var history = require('@codemirror/history');
var fold = require('@codemirror/fold');
var language = require('@codemirror/language');
var gutter = require('@codemirror/gutter');
var commands = require('@codemirror/commands');
var matchbrackets = require('@codemirror/matchbrackets');
var closebrackets = require('@codemirror/closebrackets');
var search = require('@codemirror/search');
var autocomplete = require('@codemirror/autocomplete');
var comment = require('@codemirror/comment');
var rectangularSelection = require('@codemirror/rectangular-selection');
var highlight = require('@codemirror/highlight');
var lint = require('@codemirror/lint');

/**
This is an extension value that just pulls together a whole lot of
extensions that you might want in a basic editor. It is meant as a
convenient helper to quickly set up CodeMirror without installing
and importing a lot of packages.

Specifically, it includes...

 - [the default command bindings](https://codemirror.net/6/docs/ref/#commands.defaultKeymap)
 - [line numbers](https://codemirror.net/6/docs/ref/#gutter.lineNumbers)
 - [special character highlighting](https://codemirror.net/6/docs/ref/#view.highlightSpecialChars)
 - [the undo history](https://codemirror.net/6/docs/ref/#history.history)
 - [a fold gutter](https://codemirror.net/6/docs/ref/#fold.foldGutter)
 - [custom selection drawing](https://codemirror.net/6/docs/ref/#view.drawSelection)
 - [multiple selections](https://codemirror.net/6/docs/ref/#state.EditorState^allowMultipleSelections)
 - [reindentation on input](https://codemirror.net/6/docs/ref/#language.indentOnInput)
 - [the default highlight style](https://codemirror.net/6/docs/ref/#highlight.defaultHighlightStyle) (as fallback)
 - [bracket matching](https://codemirror.net/6/docs/ref/#matchbrackets.bracketMatching)
 - [bracket closing](https://codemirror.net/6/docs/ref/#closebrackets.closeBrackets)
 - [autocompletion](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion)
 - [rectangular selection](https://codemirror.net/6/docs/ref/#rectangular-selection.rectangularSelection)
 - [active line highlighting](https://codemirror.net/6/docs/ref/#view.highlightActiveLine)
 - [active line gutter highlighting](https://codemirror.net/6/docs/ref/#gutter.highlightActiveLineGutter)
 - [selection match highlighting](https://codemirror.net/6/docs/ref/#search.highlightSelectionMatches)
 - [search](https://codemirror.net/6/docs/ref/#search.searchKeymap)
 - [commenting](https://codemirror.net/6/docs/ref/#comment.commentKeymap)
 - [linting](https://codemirror.net/6/docs/ref/#lint.lintKeymap)

(You'll probably want to add some language package to your setup
too.)

This package does not allow customization. The idea is that, once
you decide you want to configure your editor more precisely, you
take this package's source (which is just a bunch of imports and
an array literal), copy it into your own code, and adjust it as
desired.
*/
const basicSetup = [
    gutter.lineNumbers(),
    gutter.highlightActiveLineGutter(),
    view.highlightSpecialChars(),
    history.history(),
    fold.foldGutter(),
    view.drawSelection(),
    state.EditorState.allowMultipleSelections.of(true),
    language.indentOnInput(),
    highlight.defaultHighlightStyle.fallback,
    matchbrackets.bracketMatching(),
    closebrackets.closeBrackets(),
    autocomplete.autocompletion(),
    rectangularSelection.rectangularSelection(),
    view.highlightActiveLine(),
    search.highlightSelectionMatches(),
    view.keymap.of([
        ...closebrackets.closeBracketsKeymap,
        ...commands.defaultKeymap,
        ...search.searchKeymap,
        ...history.historyKeymap,
        ...fold.foldKeymap,
        ...comment.commentKeymap,
        ...autocomplete.completionKeymap,
        ...lint.lintKeymap
    ])
];

Object.defineProperty(exports, 'EditorView', {
    enumerable: true,
    get: function () {
        return view.EditorView;
    }
});
Object.defineProperty(exports, 'EditorState', {
    enumerable: true,
    get: function () {
        return state.EditorState;
    }
});
exports.basicSetup = basicSetup;
