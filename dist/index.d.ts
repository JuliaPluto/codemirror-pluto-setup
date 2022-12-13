/**
A text iterator iterates over a sequence of strings. When
iterating over a [`Text`](https://codemirror.net/6/docs/ref/#state.Text) document, result values will
either be lines or line breaks.
*/
interface TextIterator$5 extends Iterator<string>, Iterable<string> {
    /**
    Retrieve the next string. Optionally skip a given number of
    positions after the current position. Always returns the object
    itself.
    */
    next(skip?: number): this;
    /**
    The current string. Will be the empty string when the cursor is
    at its end or `next` hasn't been called on it yet.
    */
    value: string;
    /**
    Whether the end of the iteration has been reached. You should
    probably check this right after calling `next`.
    */
    done: boolean;
    /**
    Whether the current string represents a line break.
    */
    lineBreak: boolean;
}
/**
The data structure for documents. @nonabstract
*/
declare abstract class Text$5 implements Iterable<string> {
    /**
    The length of the string.
    */
    abstract readonly length: number;
    /**
    The number of lines in the string (always >= 1).
    */
    abstract readonly lines: number;
    /**
    Get the line description around the given position.
    */
    lineAt(pos: number): Line$6;
    /**
    Get the description for the given (1-based) line number.
    */
    line(n: number): Line$6;
    /**
    Replace a range of the text with the given content.
    */
    replace(from: number, to: number, text: Text$5): Text$5;
    /**
    Append another document to this one.
    */
    append(other: Text$5): Text$5;
    /**
    Retrieve the text between the given points.
    */
    slice(from: number, to?: number): Text$5;
    /**
    Retrieve a part of the document as a string
    */
    abstract sliceString(from: number, to?: number, lineSep?: string): string;
    /**
    Test whether this text is equal to another instance.
    */
    eq(other: Text$5): boolean;
    /**
    Iterate over the text. When `dir` is `-1`, iteration happens
    from end to start. This will return lines and the breaks between
    them as separate strings.
    */
    iter(dir?: 1 | -1): TextIterator$5;
    /**
    Iterate over a range of the text. When `from` > `to`, the
    iterator will run in reverse.
    */
    iterRange(from: number, to?: number): TextIterator$5;
    /**
    Return a cursor that iterates over the given range of lines,
    _without_ returning the line breaks between, and yielding empty
    strings for empty lines.
    
    When `from` and `to` are given, they should be 1-based line numbers.
    */
    iterLines(from?: number, to?: number): TextIterator$5;
    /**
    Convert the document to an array of lines (which can be
    deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#state.Text^of)).
    */
    toJSON(): string[];
    /**
    If this is a branch node, `children` will hold the `Text`
    objects that it is made up of. For leaf nodes, this holds null.
    */
    abstract readonly children: readonly Text$5[] | null;
    [Symbol.iterator]: () => Iterator<string>;
    /**
    Create a `Text` instance for the given array of lines.
    */
    static of(text: readonly string[]): Text$5;
    /**
    The empty document.
    */
    static empty: Text$5;
}
/**
This type describes a line in the document. It is created
on-demand when lines are [queried](https://codemirror.net/6/docs/ref/#state.Text.lineAt).
*/
declare class Line$6 {
    /**
    The position of the start of the line.
    */
    readonly from: number;
    /**
    The position at the end of the line (_before_ the line break,
    or at the end of document for the last line).
    */
    readonly to: number;
    /**
    This line's line number (1-based).
    */
    readonly number: number;
    /**
    The line's content.
    */
    readonly text: string;
    /**
    The length of the line (not including any line break after it).
    */
    get length(): number;
}

/**
Distinguishes different ways in which positions can be mapped.
*/
declare enum MapMode$5 {
    /**
    Map a position to a valid new position, even when its context
    was deleted.
    */
    Simple = 0,
    /**
    Return null if deletion happens across the position.
    */
    TrackDel = 1,
    /**
    Return null if the character _before_ the position is deleted.
    */
    TrackBefore = 2,
    /**
    Return null if the character _after_ the position is deleted.
    */
    TrackAfter = 3
}
/**
A change description is a variant of [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet)
that doesn't store the inserted text. As such, it can't be
applied, but is cheaper to store and manipulate.
*/
declare class ChangeDesc$5 {
    /**
    The length of the document before the change.
    */
    get length(): number;
    /**
    The length of the document after the change.
    */
    get newLength(): number;
    /**
    False when there are actual changes in this set.
    */
    get empty(): boolean;
    /**
    Iterate over the unchanged parts left by these changes. `posA`
    provides the position of the range in the old document, `posB`
    the new position in the changed document.
    */
    iterGaps(f: (posA: number, posB: number, length: number) => void): void;
    /**
    Iterate over the ranges changed by these changes. (See
    [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
    variant that also provides you with the inserted text.)
    `fromA`/`toA` provides the extent of the change in the starting
    document, `fromB`/`toB` the extent of the replacement in the
    changed document.
    
    When `individual` is true, adjacent changes (which are kept
    separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
    reported separately.
    */
    iterChangedRanges(f: (fromA: number, toA: number, fromB: number, toB: number) => void, individual?: boolean): void;
    /**
    Get a description of the inverted form of these changes.
    */
    get invertedDesc(): ChangeDesc$5;
    /**
    Compute the combined effect of applying another set of changes
    after this one. The length of the document after this set should
    match the length before `other`.
    */
    composeDesc(other: ChangeDesc$5): ChangeDesc$5;
    /**
    Map this description, which should start with the same document
    as `other`, over another set of changes, so that it can be
    applied after it. When `before` is true, map as if the changes
    in `other` happened before the ones in `this`.
    */
    mapDesc(other: ChangeDesc$5, before?: boolean): ChangeDesc$5;
    /**
    Map a given position through these changes, to produce a
    position pointing into the new document.
    
    `assoc` indicates which side the position should be associated
    with. When it is negative or zero, the mapping will try to keep
    the position close to the character before it (if any), and will
    move it before insertions at that point or replacements across
    that point. When it is positive, the position is associated with
    the character after it, and will be moved forward for insertions
    at or replacements across the position. Defaults to -1.
    
    `mode` determines whether deletions should be
    [reported](https://codemirror.net/6/docs/ref/#state.MapMode). It defaults to
    [`MapMode.Simple`](https://codemirror.net/6/docs/ref/#state.MapMode.Simple) (don't report
    deletions).
    */
    mapPos(pos: number, assoc?: number): number;
    mapPos(pos: number, assoc: number, mode: MapMode$5): number | null;
    /**
    Check whether these changes touch a given range. When one of the
    changes entirely covers the range, the string `"cover"` is
    returned.
    */
    touchesRange(from: number, to?: number): boolean | "cover";
    /**
    Serialize this change desc to a JSON-representable value.
    */
    toJSON(): readonly number[];
    /**
    Create a change desc from its JSON representation (as produced
    by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
    */
    static fromJSON(json: any): ChangeDesc$5;
}
/**
This type is used as argument to
[`EditorState.changes`](https://codemirror.net/6/docs/ref/#state.EditorState.changes) and in the
[`changes` field](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) of transaction
specs to succinctly describe document changes. It may either be a
plain object describing a change (a deletion, insertion, or
replacement, depending on which fields are present), a [change
set](https://codemirror.net/6/docs/ref/#state.ChangeSet), or an array of change specs.
*/
declare type ChangeSpec$5 = {
    from: number;
    to?: number;
    insert?: string | Text$5;
} | ChangeSet$5 | readonly ChangeSpec$5[];
/**
A change set represents a group of modifications to a document. It
stores the document length, and can only be applied to documents
with exactly that length.
*/
declare class ChangeSet$5 extends ChangeDesc$5 {
    private constructor();
    /**
    Apply the changes to a document, returning the modified
    document.
    */
    apply(doc: Text$5): Text$5;
    mapDesc(other: ChangeDesc$5, before?: boolean): ChangeDesc$5;
    /**
    Given the document as it existed _before_ the changes, return a
    change set that represents the inverse of this set, which could
    be used to go from the document created by the changes back to
    the document as it existed before the changes.
    */
    invert(doc: Text$5): ChangeSet$5;
    /**
    Combine two subsequent change sets into a single set. `other`
    must start in the document produced by `this`. If `this` goes
    `docA` → `docB` and `other` represents `docB` → `docC`, the
    returned value will represent the change `docA` → `docC`.
    */
    compose(other: ChangeSet$5): ChangeSet$5;
    /**
    Given another change set starting in the same document, maps this
    change set over the other, producing a new change set that can be
    applied to the document produced by applying `other`. When
    `before` is `true`, order changes as if `this` comes before
    `other`, otherwise (the default) treat `other` as coming first.
    
    Given two changes `A` and `B`, `A.compose(B.map(A))` and
    `B.compose(A.map(B, true))` will produce the same document. This
    provides a basic form of [operational
    transformation](https://en.wikipedia.org/wiki/Operational_transformation),
    and can be used for collaborative editing.
    */
    map(other: ChangeDesc$5, before?: boolean): ChangeSet$5;
    /**
    Iterate over the changed ranges in the document, calling `f` for
    each, with the range in the original document (`fromA`-`toA`)
    and the range that replaces it in the new document
    (`fromB`-`toB`).
    
    When `individual` is true, adjacent changes are reported
    separately.
    */
    iterChanges(f: (fromA: number, toA: number, fromB: number, toB: number, inserted: Text$5) => void, individual?: boolean): void;
    /**
    Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
    set.
    */
    get desc(): ChangeDesc$5;
    /**
    Serialize this change set to a JSON-representable value.
    */
    toJSON(): any;
    /**
    Create a change set for the given changes, for a document of the
    given length, using `lineSep` as line separator.
    */
    static of(changes: ChangeSpec$5, length: number, lineSep?: string): ChangeSet$5;
    /**
    Create an empty changeset of the given length.
    */
    static empty(length: number): ChangeSet$5;
    /**
    Create a changeset from its JSON representation (as produced by
    [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
    */
    static fromJSON(json: any): ChangeSet$5;
}

/**
A single selection range. When
[`allowMultipleSelections`](https://codemirror.net/6/docs/ref/#state.EditorState^allowMultipleSelections)
is enabled, a [selection](https://codemirror.net/6/docs/ref/#state.EditorSelection) may hold
multiple ranges. By default, selections hold exactly one range.
*/
declare class SelectionRange$5 {
    /**
    The lower boundary of the range.
    */
    readonly from: number;
    /**
    The upper boundary of the range.
    */
    readonly to: number;
    private flags;
    private constructor();
    /**
    The anchor of the range—the side that doesn't move when you
    extend it.
    */
    get anchor(): number;
    /**
    The head of the range, which is moved when the range is
    [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
    */
    get head(): number;
    /**
    True when `anchor` and `head` are at the same position.
    */
    get empty(): boolean;
    /**
    If this is a cursor that is explicitly associated with the
    character on one of its sides, this returns the side. -1 means
    the character before its position, 1 the character after, and 0
    means no association.
    */
    get assoc(): -1 | 0 | 1;
    /**
    The bidirectional text level associated with this cursor, if
    any.
    */
    get bidiLevel(): number | null;
    /**
    The goal column (stored vertical offset) associated with a
    cursor. This is used to preserve the vertical position when
    [moving](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) across
    lines of different length.
    */
    get goalColumn(): number | undefined;
    /**
    Map this range through a change, producing a valid range in the
    updated document.
    */
    map(change: ChangeDesc$5, assoc?: number): SelectionRange$5;
    /**
    Extend this range to cover at least `from` to `to`.
    */
    extend(from: number, to?: number): SelectionRange$5;
    /**
    Compare this range to another range.
    */
    eq(other: SelectionRange$5): boolean;
    /**
    Return a JSON-serializable object representing the range.
    */
    toJSON(): any;
    /**
    Convert a JSON representation of a range to a `SelectionRange`
    instance.
    */
    static fromJSON(json: any): SelectionRange$5;
}
/**
An editor selection holds one or more selection ranges.
*/
declare class EditorSelection$5 {
    /**
    The ranges in the selection, sorted by position. Ranges cannot
    overlap (but they may touch, if they aren't empty).
    */
    readonly ranges: readonly SelectionRange$5[];
    /**
    The index of the _main_ range in the selection (which is
    usually the range that was added last).
    */
    readonly mainIndex: number;
    private constructor();
    /**
    Map a selection through a change. Used to adjust the selection
    position for changes.
    */
    map(change: ChangeDesc$5, assoc?: number): EditorSelection$5;
    /**
    Compare this selection to another selection.
    */
    eq(other: EditorSelection$5): boolean;
    /**
    Get the primary selection range. Usually, you should make sure
    your code applies to _all_ ranges, by using methods like
    [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
    */
    get main(): SelectionRange$5;
    /**
    Make sure the selection only has one range. Returns a selection
    holding only the main range from this selection.
    */
    asSingle(): EditorSelection$5;
    /**
    Extend this selection with an extra range.
    */
    addRange(range: SelectionRange$5, main?: boolean): EditorSelection$5;
    /**
    Replace a given range with another range, and then normalize the
    selection to merge and sort ranges if necessary.
    */
    replaceRange(range: SelectionRange$5, which?: number): EditorSelection$5;
    /**
    Convert this selection to an object that can be serialized to
    JSON.
    */
    toJSON(): any;
    /**
    Create a selection from a JSON representation.
    */
    static fromJSON(json: any): EditorSelection$5;
    /**
    Create a selection holding a single range.
    */
    static single(anchor: number, head?: number): EditorSelection$5;
    /**
    Sort and merge the given set of ranges, creating a valid
    selection.
    */
    static create(ranges: readonly SelectionRange$5[], mainIndex?: number): EditorSelection$5;
    /**
    Create a cursor selection range at the given position. You can
    safely ignore the optional arguments in most situations.
    */
    static cursor(pos: number, assoc?: number, bidiLevel?: number, goalColumn?: number): SelectionRange$5;
    /**
    Create a selection range.
    */
    static range(anchor: number, head: number, goalColumn?: number): SelectionRange$5;
}

declare type FacetConfig$5<Input, Output> = {
    /**
    How to combine the input values into a single output value. When
    not given, the array of input values becomes the output. This
    function will immediately be called on creating the facet, with
    an empty array, to compute the facet's default value when no
    inputs are present.
    */
    combine?: (value: readonly Input[]) => Output;
    /**
    How to compare output values to determine whether the value of
    the facet changed. Defaults to comparing by `===` or, if no
    `combine` function was given, comparing each element of the
    array with `===`.
    */
    compare?: (a: Output, b: Output) => boolean;
    /**
    How to compare input values to avoid recomputing the output
    value when no inputs changed. Defaults to comparing with `===`.
    */
    compareInput?: (a: Input, b: Input) => boolean;
    /**
    Forbids dynamic inputs to this facet.
    */
    static?: boolean;
    /**
    If given, these extension(s) (or the result of calling the given
    function with the facet) will be added to any state where this
    facet is provided. (Note that, while a facet's default value can
    be read from a state even if the facet wasn't present in the
    state at all, these extensions won't be added in that
    situation.)
    */
    enables?: Extension$5 | ((self: Facet$5<Input, Output>) => Extension$5);
};
/**
A facet is a labeled value that is associated with an editor
state. It takes inputs from any number of extensions, and combines
those into a single output value.

Examples of uses of facets are the [tab
size](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize), [editor
attributes](https://codemirror.net/6/docs/ref/#view.EditorView^editorAttributes), and [update
listeners](https://codemirror.net/6/docs/ref/#view.EditorView^updateListener).
*/
declare class Facet$5<Input, Output = readonly Input[]> {
    private isStatic;
    private constructor();
    /**
    Define a new facet.
    */
    static define<Input, Output = readonly Input[]>(config?: FacetConfig$5<Input, Output>): Facet$5<Input, Output>;
    /**
    Returns an extension that adds the given value to this facet.
    */
    of(value: Input): Extension$5;
    /**
    Create an extension that computes a value for the facet from a
    state. You must take care to declare the parts of the state that
    this value depends on, since your function is only called again
    for a new state when one of those parts changed.
    
    In cases where your value depends only on a single field, you'll
    want to use the [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method instead.
    */
    compute(deps: readonly Slot$5<any>[], get: (state: EditorState$5) => Input): Extension$5;
    /**
    Create an extension that computes zero or more values for this
    facet from a state.
    */
    computeN(deps: readonly Slot$5<any>[], get: (state: EditorState$5) => readonly Input[]): Extension$5;
    /**
    Shorthand method for registering a facet source with a state
    field as input. If the field's type corresponds to this facet's
    input type, the getter function can be omitted. If given, it
    will be used to retrieve the input from the field value.
    */
    from<T extends Input>(field: StateField$5<T>): Extension$5;
    from<T>(field: StateField$5<T>, get: (value: T) => Input): Extension$5;
}
declare type Slot$5<T> = Facet$5<any, T> | StateField$5<T> | "doc" | "selection";
declare type StateFieldSpec$5<Value> = {
    /**
    Creates the initial value for the field when a state is created.
    */
    create: (state: EditorState$5) => Value;
    /**
    Compute a new value from the field's previous value and a
    [transaction](https://codemirror.net/6/docs/ref/#state.Transaction).
    */
    update: (value: Value, transaction: Transaction$5) => Value;
    /**
    Compare two values of the field, returning `true` when they are
    the same. This is used to avoid recomputing facets that depend
    on the field when its value did not change. Defaults to using
    `===`.
    */
    compare?: (a: Value, b: Value) => boolean;
    /**
    Provide extensions based on this field. The given function will
    be called once with the initialized field. It will usually want
    to call some facet's [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method to
    create facet inputs from this field, but can also return other
    extensions that should be enabled when the field is present in a
    configuration.
    */
    provide?: (field: StateField$5<Value>) => Extension$5;
    /**
    A function used to serialize this field's content to JSON. Only
    necessary when this field is included in the argument to
    [`EditorState.toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON).
    */
    toJSON?: (value: Value, state: EditorState$5) => any;
    /**
    A function that deserializes the JSON representation of this
    field's content.
    */
    fromJSON?: (json: any, state: EditorState$5) => Value;
};
/**
Fields can store additional information in an editor state, and
keep it in sync with the rest of the state.
*/
declare class StateField$5<Value> {
    private createF;
    private updateF;
    private compareF;
    private constructor();
    /**
    Define a state field.
    */
    static define<Value>(config: StateFieldSpec$5<Value>): StateField$5<Value>;
    private create;
    /**
    Returns an extension that enables this field and overrides the
    way it is initialized. Can be useful when you need to provide a
    non-default starting value for the field.
    */
    init(create: (state: EditorState$5) => Value): Extension$5;
    /**
    State field instances can be used as
    [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
    given state.
    */
    get extension(): Extension$5;
}
/**
Extension values can be
[provided](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions) when creating a
state to attach various kinds of configuration and behavior
information. They can either be built-in extension-providing
objects, such as [state fields](https://codemirror.net/6/docs/ref/#state.StateField) or [facet
providers](https://codemirror.net/6/docs/ref/#state.Facet.of), or objects with an extension in its
`extension` property. Extensions can be nested in arrays
arbitrarily deep—they will be flattened when processed.
*/
declare type Extension$5 = {
    extension: Extension$5;
} | readonly Extension$5[];
/**
Extension compartments can be used to make a configuration
dynamic. By [wrapping](https://codemirror.net/6/docs/ref/#state.Compartment.of) part of your
configuration in a compartment, you can later
[replace](https://codemirror.net/6/docs/ref/#state.Compartment.reconfigure) that part through a
transaction.
*/
declare class Compartment {
    /**
    Create an instance of this compartment to add to your [state
    configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
    */
    of(ext: Extension$5): Extension$5;
    /**
    Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
    reconfigures this compartment.
    */
    reconfigure(content: Extension$5): StateEffect$5<unknown>;
    /**
    Get the current content of the compartment in the state, or
    `undefined` if it isn't present.
    */
    get(state: EditorState$5): Extension$5 | undefined;
}

/**
Annotations are tagged values that are used to add metadata to
transactions in an extensible way. They should be used to model
things that effect the entire transaction (such as its [time
stamp](https://codemirror.net/6/docs/ref/#state.Transaction^time) or information about its
[origin](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent)). For effects that happen
_alongside_ the other changes made by the transaction, [state
effects](https://codemirror.net/6/docs/ref/#state.StateEffect) are more appropriate.
*/
declare class Annotation$5<T> {
    /**
    The annotation type.
    */
    readonly type: AnnotationType$5<T>;
    /**
    The value of this annotation.
    */
    readonly value: T;
    /**
    Define a new type of annotation.
    */
    static define<T>(): AnnotationType$5<T>;
    private _isAnnotation;
}
/**
Marker that identifies a type of [annotation](https://codemirror.net/6/docs/ref/#state.Annotation).
*/
declare class AnnotationType$5<T> {
    /**
    Create an instance of this annotation.
    */
    of(value: T): Annotation$5<T>;
}
interface StateEffectSpec$5<Value> {
    /**
    Provides a way to map an effect like this through a position
    mapping. When not given, the effects will simply not be mapped.
    When the function returns `undefined`, that means the mapping
    deletes the effect.
    */
    map?: (value: Value, mapping: ChangeDesc$5) => Value | undefined;
}
/**
Representation of a type of state effect. Defined with
[`StateEffect.define`](https://codemirror.net/6/docs/ref/#state.StateEffect^define).
*/
declare class StateEffectType$5<Value> {
    /**
    @internal
    */
    readonly map: (value: any, mapping: ChangeDesc$5) => any | undefined;
    /**
    Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
    type.
    */
    of(value: Value): StateEffect$5<Value>;
}
/**
State effects can be used to represent additional effects
associated with a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction.effects). They
are often useful to model changes to custom [state
fields](https://codemirror.net/6/docs/ref/#state.StateField), when those changes aren't implicit in
document or selection changes.
*/
declare class StateEffect$5<Value> {
    /**
    The value of this effect.
    */
    readonly value: Value;
    /**
    Map this effect through a position mapping. Will return
    `undefined` when that ends up deleting the effect.
    */
    map(mapping: ChangeDesc$5): StateEffect$5<Value> | undefined;
    /**
    Tells you whether this effect object is of a given
    [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
    */
    is<T>(type: StateEffectType$5<T>): this is StateEffect$5<T>;
    /**
    Define a new effect type. The type parameter indicates the type
    of values that his effect holds.
    */
    static define<Value = null>(spec?: StateEffectSpec$5<Value>): StateEffectType$5<Value>;
    /**
    Map an array of effects through a change set.
    */
    static mapEffects(effects: readonly StateEffect$5<any>[], mapping: ChangeDesc$5): readonly StateEffect$5<any>[];
    /**
    This effect can be used to reconfigure the root extensions of
    the editor. Doing this will discard any extensions
    [appended](https://codemirror.net/6/docs/ref/#state.StateEffect^appendConfig), but does not reset
    the content of [reconfigured](https://codemirror.net/6/docs/ref/#state.Compartment.reconfigure)
    compartments.
    */
    static reconfigure: StateEffectType$5<Extension$5>;
    /**
    Append extensions to the top-level configuration of the editor.
    */
    static appendConfig: StateEffectType$5<Extension$5>;
}
/**
Describes a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) when calling the
[`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update) method.
*/
interface TransactionSpec$5 {
    /**
    The changes to the document made by this transaction.
    */
    changes?: ChangeSpec$5;
    /**
    When set, this transaction explicitly updates the selection.
    Offsets in this selection should refer to the document as it is
    _after_ the transaction.
    */
    selection?: EditorSelection$5 | {
        anchor: number;
        head?: number;
    };
    /**
    Attach [state effects](https://codemirror.net/6/docs/ref/#state.StateEffect) to this transaction.
    Again, when they contain positions and this same spec makes
    changes, those positions should refer to positions in the
    updated document.
    */
    effects?: StateEffect$5<any> | readonly StateEffect$5<any>[];
    /**
    Set [annotations](https://codemirror.net/6/docs/ref/#state.Annotation) for this transaction.
    */
    annotations?: Annotation$5<any> | readonly Annotation$5<any>[];
    /**
    Shorthand for `annotations:` [`Transaction.userEvent`](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent)`.of(...)`.
    */
    userEvent?: string;
    /**
    When set to `true`, the transaction is marked as needing to
    scroll the current selection into view.
    */
    scrollIntoView?: boolean;
    /**
    By default, transactions can be modified by [change
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^changeFilter) and [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter). You can set this
    to `false` to disable that. This can be necessary for
    transactions that, for example, include annotations that must be
    kept consistent with their changes.
    */
    filter?: boolean;
    /**
    Normally, when multiple specs are combined (for example by
    [`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update)), the
    positions in `changes` are taken to refer to the document
    positions in the initial document. When a spec has `sequental`
    set to true, its positions will be taken to refer to the
    document created by the specs before it instead.
    */
    sequential?: boolean;
}
/**
Changes to the editor state are grouped into transactions.
Typically, a user action creates a single transaction, which may
contain any number of document changes, may change the selection,
or have other effects. Create a transaction by calling
[`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update), or immediately
dispatch one by calling
[`EditorView.dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch).
*/
declare class Transaction$5 {
    /**
    The state from which the transaction starts.
    */
    readonly startState: EditorState$5;
    /**
    The document changes made by this transaction.
    */
    readonly changes: ChangeSet$5;
    /**
    The selection set by this transaction, or undefined if it
    doesn't explicitly set a selection.
    */
    readonly selection: EditorSelection$5 | undefined;
    /**
    The effects added to the transaction.
    */
    readonly effects: readonly StateEffect$5<any>[];
    /**
    Whether the selection should be scrolled into view after this
    transaction is dispatched.
    */
    readonly scrollIntoView: boolean;
    private constructor();
    /**
    The new document produced by the transaction. Contrary to
    [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
    force the entire new state to be computed right away, so it is
    recommended that [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
    when they need to look at the new document.
    */
    get newDoc(): Text$5;
    /**
    The new selection produced by the transaction. If
    [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
    this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
    current selection through the changes made by the transaction.
    */
    get newSelection(): EditorSelection$5;
    /**
    The new state created by the transaction. Computed on demand
    (but retained for subsequent access), so it is recommended not to
    access it in [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
    */
    get state(): EditorState$5;
    /**
    Get the value of the given annotation type, if any.
    */
    annotation<T>(type: AnnotationType$5<T>): T | undefined;
    /**
    Indicates whether the transaction changed the document.
    */
    get docChanged(): boolean;
    /**
    Indicates whether this transaction reconfigures the state
    (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
    with a top-level configuration
    [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
    */
    get reconfigured(): boolean;
    /**
    Returns true if the transaction has a [user
    event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
    or more specific than `event`. For example, if the transaction
    has `"select.pointer"` as user event, `"select"` and
    `"select.pointer"` will match it.
    */
    isUserEvent(event: string): boolean;
    /**
    Annotation used to store transaction timestamps. Automatically
    added to every transaction, holding `Date.now()`.
    */
    static time: AnnotationType$5<number>;
    /**
    Annotation used to associate a transaction with a user interface
    event. Holds a string identifying the event, using a
    dot-separated format to support attaching more specific
    information. The events used by the core libraries are:
    
     - `"input"` when content is entered
       - `"input.type"` for typed input
         - `"input.type.compose"` for composition
       - `"input.paste"` for pasted input
       - `"input.drop"` when adding content with drag-and-drop
       - `"input.complete"` when autocompleting
     - `"delete"` when the user deletes content
       - `"delete.selection"` when deleting the selection
       - `"delete.forward"` when deleting forward from the selection
       - `"delete.backward"` when deleting backward from the selection
       - `"delete.cut"` when cutting to the clipboard
     - `"move"` when content is moved
       - `"move.drop"` when content is moved within the editor through drag-and-drop
     - `"select"` when explicitly changing the selection
       - `"select.pointer"` when selecting with a mouse or other pointing device
     - `"undo"` and `"redo"` for history actions
    
    Use [`isUserEvent`](https://codemirror.net/6/docs/ref/#state.Transaction.isUserEvent) to check
    whether the annotation matches a given event.
    */
    static userEvent: AnnotationType$5<string>;
    /**
    Annotation indicating whether a transaction should be added to
    the undo history or not.
    */
    static addToHistory: AnnotationType$5<boolean>;
    /**
    Annotation indicating (when present and true) that a transaction
    represents a change made by some other actor, not the user. This
    is used, for example, to tag other people's changes in
    collaborative editing.
    */
    static remote: AnnotationType$5<boolean>;
}

/**
The categories produced by a [character
categorizer](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer). These are used
do things like selecting by word.
*/
declare enum CharCategory$5 {
    /**
    Word characters.
    */
    Word = 0,
    /**
    Whitespace.
    */
    Space = 1,
    /**
    Anything else.
    */
    Other = 2
}

/**
Options passed when [creating](https://codemirror.net/6/docs/ref/#state.EditorState^create) an
editor state.
*/
interface EditorStateConfig$5 {
    /**
    The initial document. Defaults to an empty document. Can be
    provided either as a plain string (which will be split into
    lines according to the value of the [`lineSeparator`
    facet](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)), or an instance of
    the [`Text`](https://codemirror.net/6/docs/ref/#state.Text) class (which is what the state will use
    to represent the document).
    */
    doc?: string | Text$5;
    /**
    The starting selection. Defaults to a cursor at the very start
    of the document.
    */
    selection?: EditorSelection$5 | {
        anchor: number;
        head?: number;
    };
    /**
    [Extension(s)](https://codemirror.net/6/docs/ref/#state.Extension) to associate with this state.
    */
    extensions?: Extension$5;
}
/**
The editor state class is a persistent (immutable) data structure.
To update a state, you [create](https://codemirror.net/6/docs/ref/#state.EditorState.update) a
[transaction](https://codemirror.net/6/docs/ref/#state.Transaction), which produces a _new_ state
instance, without modifying the original object.

As such, _never_ mutate properties of a state directly. That'll
just break things.
*/
declare class EditorState$5 {
    /**
    The current document.
    */
    readonly doc: Text$5;
    /**
    The current selection.
    */
    readonly selection: EditorSelection$5;
    private constructor();
    /**
    Retrieve the value of a [state field](https://codemirror.net/6/docs/ref/#state.StateField). Throws
    an error when the state doesn't have that field, unless you pass
    `false` as second parameter.
    */
    field<T>(field: StateField$5<T>): T;
    field<T>(field: StateField$5<T>, require: false): T | undefined;
    /**
    Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
    state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
    can be passed. Unless
    [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
    [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
    are assumed to start in the _current_ document (not the document
    produced by previous specs), and its
    [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
    [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
    to the document created by its _own_ changes. The resulting
    transaction contains the combined effect of all the different
    specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
    specs take precedence over earlier ones.
    */
    update(...specs: readonly TransactionSpec$5[]): Transaction$5;
    /**
    Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
    replaces every selection range with the given content.
    */
    replaceSelection(text: string | Text$5): TransactionSpec$5;
    /**
    Create a set of changes and a new selection by running the given
    function for each range in the active selection. The function
    can return an optional set of changes (in the coordinate space
    of the start document), plus an updated range (in the coordinate
    space of the document produced by the call's own changes). This
    method will merge all the changes and ranges into a single
    changeset and selection, and return it as a [transaction
    spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
    [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
    */
    changeByRange(f: (range: SelectionRange$5) => {
        range: SelectionRange$5;
        changes?: ChangeSpec$5;
        effects?: StateEffect$5<any> | readonly StateEffect$5<any>[];
    }): {
        changes: ChangeSet$5;
        selection: EditorSelection$5;
        effects: readonly StateEffect$5<any>[];
    };
    /**
    Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
    description, taking the state's document length and line
    separator into account.
    */
    changes(spec?: ChangeSpec$5): ChangeSet$5;
    /**
    Using the state's [line
    separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
    [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
    */
    toText(string: string): Text$5;
    /**
    Return the given range of the document as a string.
    */
    sliceDoc(from?: number, to?: number): string;
    /**
    Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
    */
    facet<Output>(facet: Facet$5<any, Output>): Output;
    /**
    Convert this state to a JSON-serializable object. When custom
    fields should be serialized, you can pass them in as an object
    mapping property names (in the resulting object, which should
    not use `doc` or `selection`) to fields.
    */
    toJSON(fields?: {
        [prop: string]: StateField$5<any>;
    }): any;
    /**
    Deserialize a state from its JSON representation. When custom
    fields should be deserialized, pass the same object you passed
    to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
    third argument.
    */
    static fromJSON(json: any, config?: EditorStateConfig$5, fields?: {
        [prop: string]: StateField$5<any>;
    }): EditorState$5;
    /**
    Create a new state. You'll usually only need this when
    initializing an editor—updated states are created by applying
    transactions.
    */
    static create(config?: EditorStateConfig$5): EditorState$5;
    /**
    A facet that, when enabled, causes the editor to allow multiple
    ranges to be selected. Be careful though, because by default the
    editor relies on the native DOM selection, which cannot handle
    multiple selections. An extension like
    [`drawSelection`](https://codemirror.net/6/docs/ref/#view.drawSelection) can be used to make
    secondary selections visible to the user.
    */
    static allowMultipleSelections: Facet$5<boolean, boolean>;
    /**
    Configures the tab size to use in this state. The first
    (highest-precedence) value of the facet is used. If no value is
    given, this defaults to 4.
    */
    static tabSize: Facet$5<number, number>;
    /**
    The size (in columns) of a tab in the document, determined by
    the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
    */
    get tabSize(): number;
    /**
    The line separator to use. By default, any of `"\n"`, `"\r\n"`
    and `"\r"` is treated as a separator when splitting lines, and
    lines are joined with `"\n"`.
    
    When you configure a value here, only that precise separator
    will be used, allowing you to round-trip documents through the
    editor without normalizing line separators.
    */
    static lineSeparator: Facet$5<string, string | undefined>;
    /**
    Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
    string for this state.
    */
    get lineBreak(): string;
    /**
    This facet controls the value of the
    [`readOnly`](https://codemirror.net/6/docs/ref/#state.EditorState.readOnly) getter, which is
    consulted by commands and extensions that implement editing
    functionality to determine whether they should apply. It
    defaults to false, but when its highest-precedence value is
    `true`, such functionality disables itself.
    
    Not to be confused with
    [`EditorView.editable`](https://codemirror.net/6/docs/ref/#view.EditorView^editable), which
    controls whether the editor's DOM is set to be editable (and
    thus focusable).
    */
    static readOnly: Facet$5<boolean, boolean>;
    /**
    Returns true when the editor is
    [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
    */
    get readOnly(): boolean;
    /**
    Registers translation phrases. The
    [`phrase`](https://codemirror.net/6/docs/ref/#state.EditorState.phrase) method will look through
    all objects registered with this facet to find translations for
    its argument.
    */
    static phrases: Facet$5<{
        [key: string]: string;
    }, readonly {
        [key: string]: string;
    }[]>;
    /**
    Look up a translation for the given phrase (via the
    [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
    original string if no translation is found.
    
    If additional arguments are passed, they will be inserted in
    place of markers like `$1` (for the first value) and `$2`, etc.
    A single `$` is equivalent to `$1`, and `$$` will produce a
    literal dollar sign.
    */
    phrase(phrase: string, ...insert: any[]): string;
    /**
    A facet used to register [language
    data](https://codemirror.net/6/docs/ref/#state.EditorState.languageDataAt) providers.
    */
    static languageData: Facet$5<(state: EditorState$5, pos: number, side: 0 | 1 | -1) => readonly {
        [name: string]: any;
    }[], readonly ((state: EditorState$5, pos: number, side: 0 | 1 | -1) => readonly {
        [name: string]: any;
    }[])[]>;
    /**
    Find the values for a given language data field, provided by the
    the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
    
    Examples of language data fields are...
    
    - [`"commentTokens"`](https://codemirror.net/6/docs/ref/#commands.CommentTokens) for specifying
      comment syntax.
    - [`"autocomplete"`](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion^config.override)
      for providing language-specific completion sources.
    - [`"wordChars"`](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) for adding
      characters that should be considered part of words in this
      language.
    - [`"closeBrackets"`](https://codemirror.net/6/docs/ref/#autocomplete.CloseBracketConfig) controls
      bracket closing behavior.
    */
    languageDataAt<T>(name: string, pos: number, side?: -1 | 0 | 1): readonly T[];
    /**
    Return a function that can categorize strings (expected to
    represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak))
    into one of:
    
     - Word (contains an alphanumeric character or a character
       explicitly listed in the local language's `"wordChars"`
       language data, which should be a string)
     - Space (contains only whitespace)
     - Other (anything else)
    */
    charCategorizer(at: number): (char: string) => CharCategory$5;
    /**
    Find the word at the given position, meaning the range
    containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
    around it. If no word characters are adjacent to the position,
    this returns null.
    */
    wordAt(pos: number): SelectionRange$5 | null;
    /**
    Facet used to register change filters, which are called for each
    transaction (unless explicitly
    [disabled](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter)), and can suppress
    part of the transaction's changes.
    
    Such a function can return `true` to indicate that it doesn't
    want to do anything, `false` to completely stop the changes in
    the transaction, or a set of ranges in which changes should be
    suppressed. Such ranges are represented as an array of numbers,
    with each pair of two numbers indicating the start and end of a
    range. So for example `[10, 20, 100, 110]` suppresses changes
    between 10 and 20, and between 100 and 110.
    */
    static changeFilter: Facet$5<(tr: Transaction$5) => boolean | readonly number[], readonly ((tr: Transaction$5) => boolean | readonly number[])[]>;
    /**
    Facet used to register a hook that gets a chance to update or
    replace transaction specs before they are applied. This will
    only be applied for transactions that don't have
    [`filter`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter) set to `false`. You
    can either return a single transaction spec (possibly the input
    transaction), or an array of specs (which will be combined in
    the same way as the arguments to
    [`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update)).
    
    When possible, it is recommended to avoid accessing
    [`Transaction.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state) in a filter,
    since it will force creation of a state that will then be
    discarded again, if the transaction is actually filtered.
    
    (This functionality should be used with care. Indiscriminately
    modifying transaction is likely to break something or degrade
    the user experience.)
    */
    static transactionFilter: Facet$5<(tr: Transaction$5) => TransactionSpec$5 | readonly TransactionSpec$5[], readonly ((tr: Transaction$5) => TransactionSpec$5 | readonly TransactionSpec$5[])[]>;
    /**
    This is a more limited form of
    [`transactionFilter`](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter),
    which can only add
    [annotations](https://codemirror.net/6/docs/ref/#state.TransactionSpec.annotations) and
    [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects). _But_, this type
    of filter runs even if the transaction has disabled regular
    [filtering](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter), making it suitable
    for effects that don't need to touch the changes or selection,
    but do want to process every transaction.
    
    Extenders run _after_ filters, when both are present.
    */
    static transactionExtender: Facet$5<(tr: Transaction$5) => Pick<TransactionSpec$5, "effects" | "annotations"> | null, readonly ((tr: Transaction$5) => Pick<TransactionSpec$5, "effects" | "annotations"> | null)[]>;
}

/**
Subtype of [`Command`](https://codemirror.net/6/docs/ref/#view.Command) that doesn't require access
to the actual editor view. Mostly useful to define commands that
can be run and tested outside of a browser environment.
*/
declare type StateCommand$2 = (target: {
    state: EditorState$5;
    dispatch: (transaction: Transaction$5) => void;
}) => boolean;

/**
Utility function for combining behaviors to fill in a config
object from an array of provided configs. `defaults` should hold
default values for all optional fields in `Config`.

The function will, by default, error
when a field gets two values that aren't `===`-equal, but you can
provide combine functions per field to do something else.
*/
declare function combineConfig<Config extends object>(configs: readonly Partial<Config>[], defaults: Partial<Config>, // Should hold only the optional properties of Config, but I haven't managed to express that
combine?: {
    [P in keyof Config]?: (first: Config[P], second: Config[P]) => Config[P];
}): Config;

/**
Each range is associated with a value, which must inherit from
this class.
*/
declare abstract class RangeValue$4 {
    /**
    Compare this value with another value. Used when comparing
    rangesets. The default implementation compares by identity.
    Unless you are only creating a fixed number of unique instances
    of your value type, it is a good idea to implement this
    properly.
    */
    eq(other: RangeValue$4): boolean;
    /**
    The bias value at the start of the range. Determines how the
    range is positioned relative to other ranges starting at this
    position. Defaults to 0.
    */
    startSide: number;
    /**
    The bias value at the end of the range. Defaults to 0.
    */
    endSide: number;
    /**
    The mode with which the location of the range should be mapped
    when its `from` and `to` are the same, to decide whether a
    change deletes the range. Defaults to `MapMode.TrackDel`.
    */
    mapMode: MapMode$5;
    /**
    Determines whether this value marks a point range. Regular
    ranges affect the part of the document they cover, and are
    meaningless when empty. Point ranges have a meaning on their
    own. When non-empty, a point range is treated as atomic and
    shadows any ranges contained in it.
    */
    point: boolean;
    /**
    Create a [range](https://codemirror.net/6/docs/ref/#state.Range) with this value.
    */
    range(from: number, to?: number): Range$4<this>;
}
/**
A range associates a value with a range of positions.
*/
declare class Range$4<T extends RangeValue$4> {
    /**
    The range's start position.
    */
    readonly from: number;
    /**
    Its end position.
    */
    readonly to: number;
    /**
    The value associated with this range.
    */
    readonly value: T;
    private constructor();
}
/**
Collection of methods used when comparing range sets.
*/
interface RangeComparator$4<T extends RangeValue$4> {
    /**
    Notifies the comparator that a range (in positions in the new
    document) has the given sets of values associated with it, which
    are different in the old (A) and new (B) sets.
    */
    compareRange(from: number, to: number, activeA: T[], activeB: T[]): void;
    /**
    Notification for a changed (or inserted, or deleted) point range.
    */
    comparePoint(from: number, to: number, pointA: T | null, pointB: T | null): void;
}
/**
Methods used when iterating over the spans created by a set of
ranges. The entire iterated range will be covered with either
`span` or `point` calls.
*/
interface SpanIterator$4<T extends RangeValue$4> {
    /**
    Called for any ranges not covered by point decorations. `active`
    holds the values that the range is marked with (and may be
    empty). `openStart` indicates how many of those ranges are open
    (continued) at the start of the span.
    */
    span(from: number, to: number, active: readonly T[], openStart: number): void;
    /**
    Called when going over a point decoration. The active range
    decorations that cover the point and have a higher precedence
    are provided in `active`. The open count in `openStart` counts
    the number of those ranges that started before the point and. If
    the point started before the iterated range, `openStart` will be
    `active.length + 1` to signal this.
    */
    point(from: number, to: number, value: T, active: readonly T[], openStart: number, index: number): void;
}
/**
A range cursor is an object that moves to the next range every
time you call `next` on it. Note that, unlike ES6 iterators, these
start out pointing at the first element, so you should call `next`
only after reading the first range (if any).
*/
interface RangeCursor$4<T> {
    /**
    Move the iterator forward.
    */
    next: () => void;
    /**
    The next range's value. Holds `null` when the cursor has reached
    its end.
    */
    value: T | null;
    /**
    The next range's start position.
    */
    from: number;
    /**
    The next end position.
    */
    to: number;
}
declare type RangeSetUpdate$4<T extends RangeValue$4> = {
    /**
    An array of ranges to add. If given, this should be sorted by
    `from` position and `startSide` unless
    [`sort`](https://codemirror.net/6/docs/ref/#state.RangeSet.update^updateSpec.sort) is given as
    `true`.
    */
    add?: readonly Range$4<T>[];
    /**
    Indicates whether the library should sort the ranges in `add`.
    Defaults to `false`.
    */
    sort?: boolean;
    /**
    Filter the ranges already in the set. Only those for which this
    function returns `true` are kept.
    */
    filter?: (from: number, to: number, value: T) => boolean;
    /**
    Can be used to limit the range on which the filter is
    applied. Filtering only a small range, as opposed to the entire
    set, can make updates cheaper.
    */
    filterFrom?: number;
    /**
    The end position to apply the filter to.
    */
    filterTo?: number;
};
/**
A range set stores a collection of [ranges](https://codemirror.net/6/docs/ref/#state.Range) in a
way that makes them efficient to [map](https://codemirror.net/6/docs/ref/#state.RangeSet.map) and
[update](https://codemirror.net/6/docs/ref/#state.RangeSet.update). This is an immutable data
structure.
*/
declare class RangeSet$4<T extends RangeValue$4> {
    private constructor();
    /**
    The number of ranges in the set.
    */
    get size(): number;
    /**
    Update the range set, optionally adding new ranges or filtering
    out existing ones.
    
    (Note: The type parameter is just there as a kludge to work
    around TypeScript variance issues that prevented `RangeSet<X>`
    from being a subtype of `RangeSet<Y>` when `X` is a subtype of
    `Y`.)
    */
    update<U extends T>(updateSpec: RangeSetUpdate$4<U>): RangeSet$4<T>;
    /**
    Map this range set through a set of changes, return the new set.
    */
    map(changes: ChangeDesc$5): RangeSet$4<T>;
    /**
    Iterate over the ranges that touch the region `from` to `to`,
    calling `f` for each. There is no guarantee that the ranges will
    be reported in any specific order. When the callback returns
    `false`, iteration stops.
    */
    between(from: number, to: number, f: (from: number, to: number, value: T) => void | false): void;
    /**
    Iterate over the ranges in this set, in order, including all
    ranges that end at or after `from`.
    */
    iter(from?: number): RangeCursor$4<T>;
    /**
    Iterate over the ranges in a collection of sets, in order,
    starting from `from`.
    */
    static iter<T extends RangeValue$4>(sets: readonly RangeSet$4<T>[], from?: number): RangeCursor$4<T>;
    /**
    Iterate over two groups of sets, calling methods on `comparator`
    to notify it of possible differences.
    */
    static compare<T extends RangeValue$4>(oldSets: readonly RangeSet$4<T>[], newSets: readonly RangeSet$4<T>[], 
    /**
    This indicates how the underlying data changed between these
    ranges, and is needed to synchronize the iteration. `from` and
    `to` are coordinates in the _new_ space, after these changes.
    */
    textDiff: ChangeDesc$5, comparator: RangeComparator$4<T>, 
    /**
    Can be used to ignore all non-point ranges, and points below
    the given size. When -1, all ranges are compared.
    */
    minPointSize?: number): void;
    /**
    Compare the contents of two groups of range sets, returning true
    if they are equivalent in the given range.
    */
    static eq<T extends RangeValue$4>(oldSets: readonly RangeSet$4<T>[], newSets: readonly RangeSet$4<T>[], from?: number, to?: number): boolean;
    /**
    Iterate over a group of range sets at the same time, notifying
    the iterator about the ranges covering every given piece of
    content. Returns the open count (see
    [`SpanIterator.span`](https://codemirror.net/6/docs/ref/#state.SpanIterator.span)) at the end
    of the iteration.
    */
    static spans<T extends RangeValue$4>(sets: readonly RangeSet$4<T>[], from: number, to: number, iterator: SpanIterator$4<T>, 
    /**
    When given and greater than -1, only points of at least this
    size are taken into account.
    */
    minPointSize?: number): number;
    /**
    Create a range set for the given range or array of ranges. By
    default, this expects the ranges to be _sorted_ (by start
    position and, if two start at the same position,
    `value.startSide`). You can pass `true` as second argument to
    cause the method to sort them.
    */
    static of<T extends RangeValue$4>(ranges: readonly Range$4<T>[] | Range$4<T>, sort?: boolean): RangeSet$4<T>;
    /**
    The empty set of ranges.
    */
    static empty: RangeSet$4<any>;
}

interface ChangedRange$4 {
    fromA: number;
    toA: number;
    fromB: number;
    toB: number;
}
declare class TreeFragment$4 {
    readonly from: number;
    readonly to: number;
    readonly tree: Tree$4;
    readonly offset: number;
    constructor(from: number, to: number, tree: Tree$4, offset: number, openStart?: boolean, openEnd?: boolean);
    get openStart(): boolean;
    get openEnd(): boolean;
    static addTree(tree: Tree$4, fragments?: readonly TreeFragment$4[], partial?: boolean): TreeFragment$4[];
    static applyChanges(fragments: readonly TreeFragment$4[], changes: readonly ChangedRange$4[], minGap?: number): readonly TreeFragment$4[];
}
interface PartialParse$4 {
    advance(): Tree$4 | null;
    readonly parsedPos: number;
    stopAt(pos: number): void;
    readonly stoppedAt: number | null;
}
declare abstract class Parser$4 {
    abstract createParse(input: Input$4, fragments: readonly TreeFragment$4[], ranges: readonly {
        from: number;
        to: number;
    }[]): PartialParse$4;
    startParse(input: Input$4 | string, fragments?: readonly TreeFragment$4[], ranges?: readonly {
        from: number;
        to: number;
    }[]): PartialParse$4;
    parse(input: Input$4 | string, fragments?: readonly TreeFragment$4[], ranges?: readonly {
        from: number;
        to: number;
    }[]): Tree$4;
}
interface Input$4 {
    readonly length: number;
    chunk(from: number): string;
    readonly lineChunks: boolean;
    read(from: number, to: number): string;
}

declare class NodeProp$4<T> {
    perNode: boolean;
    deserialize: (str: string) => T;
    constructor(config?: {
        deserialize?: (str: string) => T;
        perNode?: boolean;
    });
    add(match: {
        [selector: string]: T;
    } | ((type: NodeType$4) => T | undefined)): NodePropSource$4;
    static closedBy: NodeProp$4<readonly string[]>;
    static openedBy: NodeProp$4<readonly string[]>;
    static group: NodeProp$4<readonly string[]>;
    static contextHash: NodeProp$4<number>;
    static lookAhead: NodeProp$4<number>;
    static mounted: NodeProp$4<MountedTree$4>;
}
declare class MountedTree$4 {
    readonly tree: Tree$4;
    readonly overlay: readonly {
        from: number;
        to: number;
    }[] | null;
    readonly parser: Parser$4;
    constructor(tree: Tree$4, overlay: readonly {
        from: number;
        to: number;
    }[] | null, parser: Parser$4);
}
declare type NodePropSource$4 = (type: NodeType$4) => null | [NodeProp$4<any>, any];
declare class NodeType$4 {
    readonly name: string;
    readonly id: number;
    static define(spec: {
        id: number;
        name?: string;
        props?: readonly ([NodeProp$4<any>, any] | NodePropSource$4)[];
        top?: boolean;
        error?: boolean;
        skipped?: boolean;
    }): NodeType$4;
    prop<T>(prop: NodeProp$4<T>): T | undefined;
    get isTop(): boolean;
    get isSkipped(): boolean;
    get isError(): boolean;
    get isAnonymous(): boolean;
    is(name: string | number): boolean;
    static none: NodeType$4;
    static match<T>(map: {
        [selector: string]: T;
    }): (node: NodeType$4) => T | undefined;
}
declare class NodeSet$4 {
    readonly types: readonly NodeType$4[];
    constructor(types: readonly NodeType$4[]);
    extend(...props: NodePropSource$4[]): NodeSet$4;
}
declare enum IterMode$4 {
    ExcludeBuffers = 1,
    IncludeAnonymous = 2,
    IgnoreMounts = 4,
    IgnoreOverlays = 8
}
declare class Tree$4 {
    readonly type: NodeType$4;
    readonly children: readonly (Tree$4 | TreeBuffer$4)[];
    readonly positions: readonly number[];
    readonly length: number;
    constructor(type: NodeType$4, children: readonly (Tree$4 | TreeBuffer$4)[], positions: readonly number[], length: number, props?: readonly [NodeProp$4<any> | number, any][]);
    static empty: Tree$4;
    cursor(mode?: IterMode$4): TreeCursor$4;
    cursorAt(pos: number, side?: -1 | 0 | 1, mode?: IterMode$4): TreeCursor$4;
    get topNode(): SyntaxNode$4;
    resolve(pos: number, side?: -1 | 0 | 1): SyntaxNode$4;
    resolveInner(pos: number, side?: -1 | 0 | 1): SyntaxNode$4;
    iterate(spec: {
        enter(node: SyntaxNodeRef$4): boolean | void;
        leave?(node: SyntaxNodeRef$4): void;
        from?: number;
        to?: number;
        mode?: IterMode$4;
    }): void;
    prop<T>(prop: NodeProp$4<T>): T | undefined;
    get propValues(): readonly [NodeProp$4<any> | number, any][];
    balance(config?: {
        makeTree?: (children: readonly (Tree$4 | TreeBuffer$4)[], positions: readonly number[], length: number) => Tree$4;
    }): Tree$4;
    static build(data: BuildData$4): Tree$4;
}
declare type BuildData$4 = {
    buffer: BufferCursor$4 | readonly number[];
    nodeSet: NodeSet$4;
    topID: number;
    start?: number;
    bufferStart?: number;
    length?: number;
    maxBufferLength?: number;
    reused?: readonly Tree$4[];
    minRepeatType?: number;
};
interface BufferCursor$4 {
    pos: number;
    id: number;
    start: number;
    end: number;
    size: number;
    next(): void;
    fork(): BufferCursor$4;
}
declare class TreeBuffer$4 {
    readonly buffer: Uint16Array;
    readonly length: number;
    readonly set: NodeSet$4;
    constructor(buffer: Uint16Array, length: number, set: NodeSet$4);
}
interface SyntaxNodeRef$4 {
    readonly from: number;
    readonly to: number;
    readonly type: NodeType$4;
    readonly name: string;
    readonly tree: Tree$4 | null;
    readonly node: SyntaxNode$4;
    matchContext(context: readonly string[]): boolean;
}
interface SyntaxNode$4 extends SyntaxNodeRef$4 {
    parent: SyntaxNode$4 | null;
    firstChild: SyntaxNode$4 | null;
    lastChild: SyntaxNode$4 | null;
    childAfter(pos: number): SyntaxNode$4 | null;
    childBefore(pos: number): SyntaxNode$4 | null;
    enter(pos: number, side: -1 | 0 | 1, mode?: IterMode$4): SyntaxNode$4 | null;
    nextSibling: SyntaxNode$4 | null;
    prevSibling: SyntaxNode$4 | null;
    cursor(mode?: IterMode$4): TreeCursor$4;
    resolve(pos: number, side?: -1 | 0 | 1): SyntaxNode$4;
    resolveInner(pos: number, side?: -1 | 0 | 1): SyntaxNode$4;
    enterUnfinishedNodesBefore(pos: number): SyntaxNode$4;
    toTree(): Tree$4;
    getChild(type: string | number, before?: string | number | null, after?: string | number | null): SyntaxNode$4 | null;
    getChildren(type: string | number, before?: string | number | null, after?: string | number | null): SyntaxNode$4[];
    matchContext(context: readonly string[]): boolean;
}
declare class TreeCursor$4 implements SyntaxNodeRef$4 {
    type: NodeType$4;
    get name(): string;
    from: number;
    to: number;
    private stack;
    private bufferNode;
    private yieldNode;
    private yieldBuf;
    private yield;
    firstChild(): boolean;
    lastChild(): boolean;
    childAfter(pos: number): boolean;
    childBefore(pos: number): boolean;
    enter(pos: number, side: -1 | 0 | 1, mode?: IterMode$4): boolean;
    parent(): boolean;
    nextSibling(): boolean;
    prevSibling(): boolean;
    private atLastNode;
    private move;
    next(enter?: boolean): boolean;
    prev(enter?: boolean): boolean;
    moveTo(pos: number, side?: -1 | 0 | 1): this;
    get node(): SyntaxNode$4;
    get tree(): Tree$4 | null;
    iterate(enter: (node: SyntaxNodeRef$4) => boolean | void, leave?: (node: SyntaxNodeRef$4) => void): void;
    matchContext(context: readonly string[]): boolean;
}

interface ChangedRange$3 {
    fromA: number;
    toA: number;
    fromB: number;
    toB: number;
}
declare class TreeFragment$3 {
    readonly from: number;
    readonly to: number;
    readonly tree: Tree$3;
    readonly offset: number;
    constructor(from: number, to: number, tree: Tree$3, offset: number, openStart?: boolean, openEnd?: boolean);
    get openStart(): boolean;
    get openEnd(): boolean;
    static addTree(tree: Tree$3, fragments?: readonly TreeFragment$3[], partial?: boolean): TreeFragment$3[];
    static applyChanges(fragments: readonly TreeFragment$3[], changes: readonly ChangedRange$3[], minGap?: number): readonly TreeFragment$3[];
}
interface PartialParse$3 {
    advance(): Tree$3 | null;
    readonly parsedPos: number;
    stopAt(pos: number): void;
    readonly stoppedAt: number | null;
}
declare abstract class Parser$3 {
    abstract createParse(input: Input$3, fragments: readonly TreeFragment$3[], ranges: readonly {
        from: number;
        to: number;
    }[]): PartialParse$3;
    startParse(input: Input$3 | string, fragments?: readonly TreeFragment$3[], ranges?: readonly {
        from: number;
        to: number;
    }[]): PartialParse$3;
    parse(input: Input$3 | string, fragments?: readonly TreeFragment$3[], ranges?: readonly {
        from: number;
        to: number;
    }[]): Tree$3;
}
interface Input$3 {
    readonly length: number;
    chunk(from: number): string;
    readonly lineChunks: boolean;
    read(from: number, to: number): string;
}
declare type ParseWrapper$2 = (inner: PartialParse$3, input: Input$3, fragments: readonly TreeFragment$3[], ranges: readonly {
    from: number;
    to: number;
}[]) => PartialParse$3;

declare class NodeProp$3<T> {
    perNode: boolean;
    deserialize: (str: string) => T;
    constructor(config?: {
        deserialize?: (str: string) => T;
        perNode?: boolean;
    });
    add(match: {
        [selector: string]: T;
    } | ((type: NodeType$3) => T | undefined)): NodePropSource$3;
    static closedBy: NodeProp$3<readonly string[]>;
    static openedBy: NodeProp$3<readonly string[]>;
    static group: NodeProp$3<readonly string[]>;
    static contextHash: NodeProp$3<number>;
    static lookAhead: NodeProp$3<number>;
    static mounted: NodeProp$3<MountedTree$3>;
}
declare class MountedTree$3 {
    readonly tree: Tree$3;
    readonly overlay: readonly {
        from: number;
        to: number;
    }[] | null;
    readonly parser: Parser$3;
    constructor(tree: Tree$3, overlay: readonly {
        from: number;
        to: number;
    }[] | null, parser: Parser$3);
}
declare type NodePropSource$3 = (type: NodeType$3) => null | [NodeProp$3<any>, any];
declare class NodeType$3 {
    readonly name: string;
    readonly id: number;
    static define(spec: {
        id: number;
        name?: string;
        props?: readonly ([NodeProp$3<any>, any] | NodePropSource$3)[];
        top?: boolean;
        error?: boolean;
        skipped?: boolean;
    }): NodeType$3;
    prop<T>(prop: NodeProp$3<T>): T | undefined;
    get isTop(): boolean;
    get isSkipped(): boolean;
    get isError(): boolean;
    get isAnonymous(): boolean;
    is(name: string | number): boolean;
    static none: NodeType$3;
    static match<T>(map: {
        [selector: string]: T;
    }): (node: NodeType$3) => T | undefined;
}
declare class NodeSet$3 {
    readonly types: readonly NodeType$3[];
    constructor(types: readonly NodeType$3[]);
    extend(...props: NodePropSource$3[]): NodeSet$3;
}
declare enum IterMode$3 {
    ExcludeBuffers = 1,
    IncludeAnonymous = 2,
    IgnoreMounts = 4,
    IgnoreOverlays = 8
}
declare class Tree$3 {
    readonly type: NodeType$3;
    readonly children: readonly (Tree$3 | TreeBuffer$3)[];
    readonly positions: readonly number[];
    readonly length: number;
    constructor(type: NodeType$3, children: readonly (Tree$3 | TreeBuffer$3)[], positions: readonly number[], length: number, props?: readonly [NodeProp$3<any> | number, any][]);
    static empty: Tree$3;
    cursor(mode?: IterMode$3): TreeCursor$3;
    cursorAt(pos: number, side?: -1 | 0 | 1, mode?: IterMode$3): TreeCursor$3;
    get topNode(): SyntaxNode$3;
    resolve(pos: number, side?: -1 | 0 | 1): SyntaxNode$3;
    resolveInner(pos: number, side?: -1 | 0 | 1): SyntaxNode$3;
    iterate(spec: {
        enter(node: SyntaxNodeRef$3): boolean | void;
        leave?(node: SyntaxNodeRef$3): void;
        from?: number;
        to?: number;
        mode?: IterMode$3;
    }): void;
    prop<T>(prop: NodeProp$3<T>): T | undefined;
    get propValues(): readonly [NodeProp$3<any> | number, any][];
    balance(config?: {
        makeTree?: (children: readonly (Tree$3 | TreeBuffer$3)[], positions: readonly number[], length: number) => Tree$3;
    }): Tree$3;
    static build(data: BuildData$3): Tree$3;
}
declare type BuildData$3 = {
    buffer: BufferCursor$3 | readonly number[];
    nodeSet: NodeSet$3;
    topID: number;
    start?: number;
    bufferStart?: number;
    length?: number;
    maxBufferLength?: number;
    reused?: readonly Tree$3[];
    minRepeatType?: number;
};
interface BufferCursor$3 {
    pos: number;
    id: number;
    start: number;
    end: number;
    size: number;
    next(): void;
    fork(): BufferCursor$3;
}
declare class TreeBuffer$3 {
    readonly buffer: Uint16Array;
    readonly length: number;
    readonly set: NodeSet$3;
    constructor(buffer: Uint16Array, length: number, set: NodeSet$3);
}
interface SyntaxNodeRef$3 {
    readonly from: number;
    readonly to: number;
    readonly type: NodeType$3;
    readonly name: string;
    readonly tree: Tree$3 | null;
    readonly node: SyntaxNode$3;
    matchContext(context: readonly string[]): boolean;
}
interface SyntaxNode$3 extends SyntaxNodeRef$3 {
    parent: SyntaxNode$3 | null;
    firstChild: SyntaxNode$3 | null;
    lastChild: SyntaxNode$3 | null;
    childAfter(pos: number): SyntaxNode$3 | null;
    childBefore(pos: number): SyntaxNode$3 | null;
    enter(pos: number, side: -1 | 0 | 1, mode?: IterMode$3): SyntaxNode$3 | null;
    nextSibling: SyntaxNode$3 | null;
    prevSibling: SyntaxNode$3 | null;
    cursor(mode?: IterMode$3): TreeCursor$3;
    resolve(pos: number, side?: -1 | 0 | 1): SyntaxNode$3;
    resolveInner(pos: number, side?: -1 | 0 | 1): SyntaxNode$3;
    enterUnfinishedNodesBefore(pos: number): SyntaxNode$3;
    toTree(): Tree$3;
    getChild(type: string | number, before?: string | number | null, after?: string | number | null): SyntaxNode$3 | null;
    getChildren(type: string | number, before?: string | number | null, after?: string | number | null): SyntaxNode$3[];
    matchContext(context: readonly string[]): boolean;
}
declare class TreeCursor$3 implements SyntaxNodeRef$3 {
    type: NodeType$3;
    get name(): string;
    from: number;
    to: number;
    private stack;
    private bufferNode;
    private yieldNode;
    private yieldBuf;
    private yield;
    firstChild(): boolean;
    lastChild(): boolean;
    childAfter(pos: number): boolean;
    childBefore(pos: number): boolean;
    enter(pos: number, side: -1 | 0 | 1, mode?: IterMode$3): boolean;
    parent(): boolean;
    nextSibling(): boolean;
    prevSibling(): boolean;
    private atLastNode;
    private move;
    next(enter?: boolean): boolean;
    prev(enter?: boolean): boolean;
    moveTo(pos: number, side?: -1 | 0 | 1): this;
    get node(): SyntaxNode$3;
    get tree(): Tree$3 | null;
    iterate(enter: (node: SyntaxNodeRef$3) => boolean | void, leave?: (node: SyntaxNodeRef$3) => void): void;
    matchContext(context: readonly string[]): boolean;
}

declare class Stack {
    pos: number;
    get context(): any;
    canShift(term: number): boolean;
    get parser(): LRParser;
    dialectEnabled(dialectID: number): boolean;
    private shiftContext;
    private reduceContext;
    private updateContext;
}

declare class InputStream {
    private chunk2;
    private chunk2Pos;
    next: number;
    pos: number;
    private rangeIndex;
    private range;
    peek(offset: number): any;
    acceptToken(token: number, endOffset?: number): void;
    private getChunk;
    private readNext;
    advance(n?: number): number;
    private setDone;
}
interface ExternalOptions {
    contextual?: boolean;
    fallback?: boolean;
    extend?: boolean;
}
declare class ExternalTokenizer {
    constructor(token: (input: InputStream, stack: Stack) => void, options?: ExternalOptions);
}

declare class ContextTracker<T> {
    constructor(spec: {
        start: T;
        shift?(context: T, term: number, stack: Stack, input: InputStream): T;
        reduce?(context: T, term: number, stack: Stack, input: InputStream): T;
        reuse?(context: T, node: Tree$3, stack: Stack, input: InputStream): T;
        hash?(context: T): number;
        strict?: boolean;
    });
}
interface ParserConfig {
    props?: readonly NodePropSource$3[];
    top?: string;
    dialect?: string;
    tokenizers?: {
        from: ExternalTokenizer;
        to: ExternalTokenizer;
    }[];
    specializers?: {
        from: (value: string, stack: Stack) => number;
        to: (value: string, stack: Stack) => number;
    }[];
    contextTracker?: ContextTracker<any>;
    strict?: boolean;
    wrap?: ParseWrapper$2;
    bufferLength?: number;
}
declare class LRParser extends Parser$3 {
    readonly nodeSet: NodeSet$3;
    createParse(input: Input$3, fragments: readonly TreeFragment$3[], ranges: readonly {
        from: number;
        to: number;
    }[]): PartialParse$3;
    configure(config: ParserConfig): LRParser;
    hasWrappers(): boolean;
    getName(term: number): string;
    get topNode(): NodeType$3;
    static deserialize(spec: any): LRParser;
}

/**
A text iterator iterates over a sequence of strings. When
iterating over a [`Text`](https://codemirror.net/6/docs/ref/#state.Text) document, result values will
either be lines or line breaks.
*/
interface TextIterator$4 extends Iterator<string>, Iterable<string> {
    /**
    Retrieve the next string. Optionally skip a given number of
    positions after the current position. Always returns the object
    itself.
    */
    next(skip?: number): this;
    /**
    The current string. Will be the empty string when the cursor is
    at its end or `next` hasn't been called on it yet.
    */
    value: string;
    /**
    Whether the end of the iteration has been reached. You should
    probably check this right after calling `next`.
    */
    done: boolean;
    /**
    Whether the current string represents a line break.
    */
    lineBreak: boolean;
}
/**
The data structure for documents. @nonabstract
*/
declare abstract class Text$4 implements Iterable<string> {
    /**
    The length of the string.
    */
    abstract readonly length: number;
    /**
    The number of lines in the string (always >= 1).
    */
    abstract readonly lines: number;
    /**
    Get the line description around the given position.
    */
    lineAt(pos: number): Line$5;
    /**
    Get the description for the given (1-based) line number.
    */
    line(n: number): Line$5;
    /**
    Replace a range of the text with the given content.
    */
    replace(from: number, to: number, text: Text$4): Text$4;
    /**
    Append another document to this one.
    */
    append(other: Text$4): Text$4;
    /**
    Retrieve the text between the given points.
    */
    slice(from: number, to?: number): Text$4;
    /**
    Retrieve a part of the document as a string
    */
    abstract sliceString(from: number, to?: number, lineSep?: string): string;
    /**
    Test whether this text is equal to another instance.
    */
    eq(other: Text$4): boolean;
    /**
    Iterate over the text. When `dir` is `-1`, iteration happens
    from end to start. This will return lines and the breaks between
    them as separate strings.
    */
    iter(dir?: 1 | -1): TextIterator$4;
    /**
    Iterate over a range of the text. When `from` > `to`, the
    iterator will run in reverse.
    */
    iterRange(from: number, to?: number): TextIterator$4;
    /**
    Return a cursor that iterates over the given range of lines,
    _without_ returning the line breaks between, and yielding empty
    strings for empty lines.
    
    When `from` and `to` are given, they should be 1-based line numbers.
    */
    iterLines(from?: number, to?: number): TextIterator$4;
    /**
    Convert the document to an array of lines (which can be
    deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#state.Text^of)).
    */
    toJSON(): string[];
    /**
    If this is a branch node, `children` will hold the `Text`
    objects that it is made up of. For leaf nodes, this holds null.
    */
    abstract readonly children: readonly Text$4[] | null;
    [Symbol.iterator]: () => Iterator<string>;
    /**
    Create a `Text` instance for the given array of lines.
    */
    static of(text: readonly string[]): Text$4;
    /**
    The empty document.
    */
    static empty: Text$4;
}
/**
This type describes a line in the document. It is created
on-demand when lines are [queried](https://codemirror.net/6/docs/ref/#state.Text.lineAt).
*/
declare class Line$5 {
    /**
    The position of the start of the line.
    */
    readonly from: number;
    /**
    The position at the end of the line (_before_ the line break,
    or at the end of document for the last line).
    */
    readonly to: number;
    /**
    This line's line number (1-based).
    */
    readonly number: number;
    /**
    The line's content.
    */
    readonly text: string;
    /**
    The length of the line (not including any line break after it).
    */
    get length(): number;
}

/**
Distinguishes different ways in which positions can be mapped.
*/
declare enum MapMode$4 {
    /**
    Map a position to a valid new position, even when its context
    was deleted.
    */
    Simple = 0,
    /**
    Return null if deletion happens across the position.
    */
    TrackDel = 1,
    /**
    Return null if the character _before_ the position is deleted.
    */
    TrackBefore = 2,
    /**
    Return null if the character _after_ the position is deleted.
    */
    TrackAfter = 3
}
/**
A change description is a variant of [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet)
that doesn't store the inserted text. As such, it can't be
applied, but is cheaper to store and manipulate.
*/
declare class ChangeDesc$4 {
    /**
    The length of the document before the change.
    */
    get length(): number;
    /**
    The length of the document after the change.
    */
    get newLength(): number;
    /**
    False when there are actual changes in this set.
    */
    get empty(): boolean;
    /**
    Iterate over the unchanged parts left by these changes. `posA`
    provides the position of the range in the old document, `posB`
    the new position in the changed document.
    */
    iterGaps(f: (posA: number, posB: number, length: number) => void): void;
    /**
    Iterate over the ranges changed by these changes. (See
    [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
    variant that also provides you with the inserted text.)
    `fromA`/`toA` provides the extent of the change in the starting
    document, `fromB`/`toB` the extent of the replacement in the
    changed document.
    
    When `individual` is true, adjacent changes (which are kept
    separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
    reported separately.
    */
    iterChangedRanges(f: (fromA: number, toA: number, fromB: number, toB: number) => void, individual?: boolean): void;
    /**
    Get a description of the inverted form of these changes.
    */
    get invertedDesc(): ChangeDesc$4;
    /**
    Compute the combined effect of applying another set of changes
    after this one. The length of the document after this set should
    match the length before `other`.
    */
    composeDesc(other: ChangeDesc$4): ChangeDesc$4;
    /**
    Map this description, which should start with the same document
    as `other`, over another set of changes, so that it can be
    applied after it. When `before` is true, map as if the changes
    in `other` happened before the ones in `this`.
    */
    mapDesc(other: ChangeDesc$4, before?: boolean): ChangeDesc$4;
    /**
    Map a given position through these changes, to produce a
    position pointing into the new document.
    
    `assoc` indicates which side the position should be associated
    with. When it is negative or zero, the mapping will try to keep
    the position close to the character before it (if any), and will
    move it before insertions at that point or replacements across
    that point. When it is positive, the position is associated with
    the character after it, and will be moved forward for insertions
    at or replacements across the position. Defaults to -1.
    
    `mode` determines whether deletions should be
    [reported](https://codemirror.net/6/docs/ref/#state.MapMode). It defaults to
    [`MapMode.Simple`](https://codemirror.net/6/docs/ref/#state.MapMode.Simple) (don't report
    deletions).
    */
    mapPos(pos: number, assoc?: number): number;
    mapPos(pos: number, assoc: number, mode: MapMode$4): number | null;
    /**
    Check whether these changes touch a given range. When one of the
    changes entirely covers the range, the string `"cover"` is
    returned.
    */
    touchesRange(from: number, to?: number): boolean | "cover";
    /**
    Serialize this change desc to a JSON-representable value.
    */
    toJSON(): readonly number[];
    /**
    Create a change desc from its JSON representation (as produced
    by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
    */
    static fromJSON(json: any): ChangeDesc$4;
}
/**
This type is used as argument to
[`EditorState.changes`](https://codemirror.net/6/docs/ref/#state.EditorState.changes) and in the
[`changes` field](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) of transaction
specs to succinctly describe document changes. It may either be a
plain object describing a change (a deletion, insertion, or
replacement, depending on which fields are present), a [change
set](https://codemirror.net/6/docs/ref/#state.ChangeSet), or an array of change specs.
*/
declare type ChangeSpec$4 = {
    from: number;
    to?: number;
    insert?: string | Text$4;
} | ChangeSet$4 | readonly ChangeSpec$4[];
/**
A change set represents a group of modifications to a document. It
stores the document length, and can only be applied to documents
with exactly that length.
*/
declare class ChangeSet$4 extends ChangeDesc$4 {
    private constructor();
    /**
    Apply the changes to a document, returning the modified
    document.
    */
    apply(doc: Text$4): Text$4;
    mapDesc(other: ChangeDesc$4, before?: boolean): ChangeDesc$4;
    /**
    Given the document as it existed _before_ the changes, return a
    change set that represents the inverse of this set, which could
    be used to go from the document created by the changes back to
    the document as it existed before the changes.
    */
    invert(doc: Text$4): ChangeSet$4;
    /**
    Combine two subsequent change sets into a single set. `other`
    must start in the document produced by `this`. If `this` goes
    `docA` → `docB` and `other` represents `docB` → `docC`, the
    returned value will represent the change `docA` → `docC`.
    */
    compose(other: ChangeSet$4): ChangeSet$4;
    /**
    Given another change set starting in the same document, maps this
    change set over the other, producing a new change set that can be
    applied to the document produced by applying `other`. When
    `before` is `true`, order changes as if `this` comes before
    `other`, otherwise (the default) treat `other` as coming first.
    
    Given two changes `A` and `B`, `A.compose(B.map(A))` and
    `B.compose(A.map(B, true))` will produce the same document. This
    provides a basic form of [operational
    transformation](https://en.wikipedia.org/wiki/Operational_transformation),
    and can be used for collaborative editing.
    */
    map(other: ChangeDesc$4, before?: boolean): ChangeSet$4;
    /**
    Iterate over the changed ranges in the document, calling `f` for
    each, with the range in the original document (`fromA`-`toA`)
    and the range that replaces it in the new document
    (`fromB`-`toB`).
    
    When `individual` is true, adjacent changes are reported
    separately.
    */
    iterChanges(f: (fromA: number, toA: number, fromB: number, toB: number, inserted: Text$4) => void, individual?: boolean): void;
    /**
    Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
    set.
    */
    get desc(): ChangeDesc$4;
    /**
    Serialize this change set to a JSON-representable value.
    */
    toJSON(): any;
    /**
    Create a change set for the given changes, for a document of the
    given length, using `lineSep` as line separator.
    */
    static of(changes: ChangeSpec$4, length: number, lineSep?: string): ChangeSet$4;
    /**
    Create an empty changeset of the given length.
    */
    static empty(length: number): ChangeSet$4;
    /**
    Create a changeset from its JSON representation (as produced by
    [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
    */
    static fromJSON(json: any): ChangeSet$4;
}

/**
A single selection range. When
[`allowMultipleSelections`](https://codemirror.net/6/docs/ref/#state.EditorState^allowMultipleSelections)
is enabled, a [selection](https://codemirror.net/6/docs/ref/#state.EditorSelection) may hold
multiple ranges. By default, selections hold exactly one range.
*/
declare class SelectionRange$4 {
    /**
    The lower boundary of the range.
    */
    readonly from: number;
    /**
    The upper boundary of the range.
    */
    readonly to: number;
    private flags;
    private constructor();
    /**
    The anchor of the range—the side that doesn't move when you
    extend it.
    */
    get anchor(): number;
    /**
    The head of the range, which is moved when the range is
    [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
    */
    get head(): number;
    /**
    True when `anchor` and `head` are at the same position.
    */
    get empty(): boolean;
    /**
    If this is a cursor that is explicitly associated with the
    character on one of its sides, this returns the side. -1 means
    the character before its position, 1 the character after, and 0
    means no association.
    */
    get assoc(): -1 | 0 | 1;
    /**
    The bidirectional text level associated with this cursor, if
    any.
    */
    get bidiLevel(): number | null;
    /**
    The goal column (stored vertical offset) associated with a
    cursor. This is used to preserve the vertical position when
    [moving](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) across
    lines of different length.
    */
    get goalColumn(): number | undefined;
    /**
    Map this range through a change, producing a valid range in the
    updated document.
    */
    map(change: ChangeDesc$4, assoc?: number): SelectionRange$4;
    /**
    Extend this range to cover at least `from` to `to`.
    */
    extend(from: number, to?: number): SelectionRange$4;
    /**
    Compare this range to another range.
    */
    eq(other: SelectionRange$4): boolean;
    /**
    Return a JSON-serializable object representing the range.
    */
    toJSON(): any;
    /**
    Convert a JSON representation of a range to a `SelectionRange`
    instance.
    */
    static fromJSON(json: any): SelectionRange$4;
}
/**
An editor selection holds one or more selection ranges.
*/
declare class EditorSelection$4 {
    /**
    The ranges in the selection, sorted by position. Ranges cannot
    overlap (but they may touch, if they aren't empty).
    */
    readonly ranges: readonly SelectionRange$4[];
    /**
    The index of the _main_ range in the selection (which is
    usually the range that was added last).
    */
    readonly mainIndex: number;
    private constructor();
    /**
    Map a selection through a change. Used to adjust the selection
    position for changes.
    */
    map(change: ChangeDesc$4, assoc?: number): EditorSelection$4;
    /**
    Compare this selection to another selection.
    */
    eq(other: EditorSelection$4): boolean;
    /**
    Get the primary selection range. Usually, you should make sure
    your code applies to _all_ ranges, by using methods like
    [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
    */
    get main(): SelectionRange$4;
    /**
    Make sure the selection only has one range. Returns a selection
    holding only the main range from this selection.
    */
    asSingle(): EditorSelection$4;
    /**
    Extend this selection with an extra range.
    */
    addRange(range: SelectionRange$4, main?: boolean): EditorSelection$4;
    /**
    Replace a given range with another range, and then normalize the
    selection to merge and sort ranges if necessary.
    */
    replaceRange(range: SelectionRange$4, which?: number): EditorSelection$4;
    /**
    Convert this selection to an object that can be serialized to
    JSON.
    */
    toJSON(): any;
    /**
    Create a selection from a JSON representation.
    */
    static fromJSON(json: any): EditorSelection$4;
    /**
    Create a selection holding a single range.
    */
    static single(anchor: number, head?: number): EditorSelection$4;
    /**
    Sort and merge the given set of ranges, creating a valid
    selection.
    */
    static create(ranges: readonly SelectionRange$4[], mainIndex?: number): EditorSelection$4;
    /**
    Create a cursor selection range at the given position. You can
    safely ignore the optional arguments in most situations.
    */
    static cursor(pos: number, assoc?: number, bidiLevel?: number, goalColumn?: number): SelectionRange$4;
    /**
    Create a selection range.
    */
    static range(anchor: number, head: number, goalColumn?: number): SelectionRange$4;
}

declare type FacetConfig$4<Input, Output> = {
    /**
    How to combine the input values into a single output value. When
    not given, the array of input values becomes the output. This
    function will immediately be called on creating the facet, with
    an empty array, to compute the facet's default value when no
    inputs are present.
    */
    combine?: (value: readonly Input[]) => Output;
    /**
    How to compare output values to determine whether the value of
    the facet changed. Defaults to comparing by `===` or, if no
    `combine` function was given, comparing each element of the
    array with `===`.
    */
    compare?: (a: Output, b: Output) => boolean;
    /**
    How to compare input values to avoid recomputing the output
    value when no inputs changed. Defaults to comparing with `===`.
    */
    compareInput?: (a: Input, b: Input) => boolean;
    /**
    Forbids dynamic inputs to this facet.
    */
    static?: boolean;
    /**
    If given, these extension(s) (or the result of calling the given
    function with the facet) will be added to any state where this
    facet is provided. (Note that, while a facet's default value can
    be read from a state even if the facet wasn't present in the
    state at all, these extensions won't be added in that
    situation.)
    */
    enables?: Extension$4 | ((self: Facet$4<Input, Output>) => Extension$4);
};
/**
A facet is a labeled value that is associated with an editor
state. It takes inputs from any number of extensions, and combines
those into a single output value.

Examples of uses of facets are the [tab
size](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize), [editor
attributes](https://codemirror.net/6/docs/ref/#view.EditorView^editorAttributes), and [update
listeners](https://codemirror.net/6/docs/ref/#view.EditorView^updateListener).
*/
declare class Facet$4<Input, Output = readonly Input[]> {
    private isStatic;
    private constructor();
    /**
    Define a new facet.
    */
    static define<Input, Output = readonly Input[]>(config?: FacetConfig$4<Input, Output>): Facet$4<Input, Output>;
    /**
    Returns an extension that adds the given value to this facet.
    */
    of(value: Input): Extension$4;
    /**
    Create an extension that computes a value for the facet from a
    state. You must take care to declare the parts of the state that
    this value depends on, since your function is only called again
    for a new state when one of those parts changed.
    
    In cases where your value depends only on a single field, you'll
    want to use the [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method instead.
    */
    compute(deps: readonly Slot$4<any>[], get: (state: EditorState$4) => Input): Extension$4;
    /**
    Create an extension that computes zero or more values for this
    facet from a state.
    */
    computeN(deps: readonly Slot$4<any>[], get: (state: EditorState$4) => readonly Input[]): Extension$4;
    /**
    Shorthand method for registering a facet source with a state
    field as input. If the field's type corresponds to this facet's
    input type, the getter function can be omitted. If given, it
    will be used to retrieve the input from the field value.
    */
    from<T extends Input>(field: StateField$4<T>): Extension$4;
    from<T>(field: StateField$4<T>, get: (value: T) => Input): Extension$4;
}
declare type Slot$4<T> = Facet$4<any, T> | StateField$4<T> | "doc" | "selection";
declare type StateFieldSpec$4<Value> = {
    /**
    Creates the initial value for the field when a state is created.
    */
    create: (state: EditorState$4) => Value;
    /**
    Compute a new value from the field's previous value and a
    [transaction](https://codemirror.net/6/docs/ref/#state.Transaction).
    */
    update: (value: Value, transaction: Transaction$4) => Value;
    /**
    Compare two values of the field, returning `true` when they are
    the same. This is used to avoid recomputing facets that depend
    on the field when its value did not change. Defaults to using
    `===`.
    */
    compare?: (a: Value, b: Value) => boolean;
    /**
    Provide extensions based on this field. The given function will
    be called once with the initialized field. It will usually want
    to call some facet's [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method to
    create facet inputs from this field, but can also return other
    extensions that should be enabled when the field is present in a
    configuration.
    */
    provide?: (field: StateField$4<Value>) => Extension$4;
    /**
    A function used to serialize this field's content to JSON. Only
    necessary when this field is included in the argument to
    [`EditorState.toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON).
    */
    toJSON?: (value: Value, state: EditorState$4) => any;
    /**
    A function that deserializes the JSON representation of this
    field's content.
    */
    fromJSON?: (json: any, state: EditorState$4) => Value;
};
/**
Fields can store additional information in an editor state, and
keep it in sync with the rest of the state.
*/
declare class StateField$4<Value> {
    private createF;
    private updateF;
    private compareF;
    private constructor();
    /**
    Define a state field.
    */
    static define<Value>(config: StateFieldSpec$4<Value>): StateField$4<Value>;
    private create;
    /**
    Returns an extension that enables this field and overrides the
    way it is initialized. Can be useful when you need to provide a
    non-default starting value for the field.
    */
    init(create: (state: EditorState$4) => Value): Extension$4;
    /**
    State field instances can be used as
    [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
    given state.
    */
    get extension(): Extension$4;
}
/**
Extension values can be
[provided](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions) when creating a
state to attach various kinds of configuration and behavior
information. They can either be built-in extension-providing
objects, such as [state fields](https://codemirror.net/6/docs/ref/#state.StateField) or [facet
providers](https://codemirror.net/6/docs/ref/#state.Facet.of), or objects with an extension in its
`extension` property. Extensions can be nested in arrays
arbitrarily deep—they will be flattened when processed.
*/
declare type Extension$4 = {
    extension: Extension$4;
} | readonly Extension$4[];

/**
Annotations are tagged values that are used to add metadata to
transactions in an extensible way. They should be used to model
things that effect the entire transaction (such as its [time
stamp](https://codemirror.net/6/docs/ref/#state.Transaction^time) or information about its
[origin](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent)). For effects that happen
_alongside_ the other changes made by the transaction, [state
effects](https://codemirror.net/6/docs/ref/#state.StateEffect) are more appropriate.
*/
declare class Annotation$4<T> {
    /**
    The annotation type.
    */
    readonly type: AnnotationType$4<T>;
    /**
    The value of this annotation.
    */
    readonly value: T;
    /**
    Define a new type of annotation.
    */
    static define<T>(): AnnotationType$4<T>;
    private _isAnnotation;
}
/**
Marker that identifies a type of [annotation](https://codemirror.net/6/docs/ref/#state.Annotation).
*/
declare class AnnotationType$4<T> {
    /**
    Create an instance of this annotation.
    */
    of(value: T): Annotation$4<T>;
}
interface StateEffectSpec$4<Value> {
    /**
    Provides a way to map an effect like this through a position
    mapping. When not given, the effects will simply not be mapped.
    When the function returns `undefined`, that means the mapping
    deletes the effect.
    */
    map?: (value: Value, mapping: ChangeDesc$4) => Value | undefined;
}
/**
Representation of a type of state effect. Defined with
[`StateEffect.define`](https://codemirror.net/6/docs/ref/#state.StateEffect^define).
*/
declare class StateEffectType$4<Value> {
    /**
    @internal
    */
    readonly map: (value: any, mapping: ChangeDesc$4) => any | undefined;
    /**
    Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
    type.
    */
    of(value: Value): StateEffect$4<Value>;
}
/**
State effects can be used to represent additional effects
associated with a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction.effects). They
are often useful to model changes to custom [state
fields](https://codemirror.net/6/docs/ref/#state.StateField), when those changes aren't implicit in
document or selection changes.
*/
declare class StateEffect$4<Value> {
    /**
    The value of this effect.
    */
    readonly value: Value;
    /**
    Map this effect through a position mapping. Will return
    `undefined` when that ends up deleting the effect.
    */
    map(mapping: ChangeDesc$4): StateEffect$4<Value> | undefined;
    /**
    Tells you whether this effect object is of a given
    [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
    */
    is<T>(type: StateEffectType$4<T>): this is StateEffect$4<T>;
    /**
    Define a new effect type. The type parameter indicates the type
    of values that his effect holds.
    */
    static define<Value = null>(spec?: StateEffectSpec$4<Value>): StateEffectType$4<Value>;
    /**
    Map an array of effects through a change set.
    */
    static mapEffects(effects: readonly StateEffect$4<any>[], mapping: ChangeDesc$4): readonly StateEffect$4<any>[];
    /**
    This effect can be used to reconfigure the root extensions of
    the editor. Doing this will discard any extensions
    [appended](https://codemirror.net/6/docs/ref/#state.StateEffect^appendConfig), but does not reset
    the content of [reconfigured](https://codemirror.net/6/docs/ref/#state.Compartment.reconfigure)
    compartments.
    */
    static reconfigure: StateEffectType$4<Extension$4>;
    /**
    Append extensions to the top-level configuration of the editor.
    */
    static appendConfig: StateEffectType$4<Extension$4>;
}
/**
Describes a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) when calling the
[`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update) method.
*/
interface TransactionSpec$4 {
    /**
    The changes to the document made by this transaction.
    */
    changes?: ChangeSpec$4;
    /**
    When set, this transaction explicitly updates the selection.
    Offsets in this selection should refer to the document as it is
    _after_ the transaction.
    */
    selection?: EditorSelection$4 | {
        anchor: number;
        head?: number;
    };
    /**
    Attach [state effects](https://codemirror.net/6/docs/ref/#state.StateEffect) to this transaction.
    Again, when they contain positions and this same spec makes
    changes, those positions should refer to positions in the
    updated document.
    */
    effects?: StateEffect$4<any> | readonly StateEffect$4<any>[];
    /**
    Set [annotations](https://codemirror.net/6/docs/ref/#state.Annotation) for this transaction.
    */
    annotations?: Annotation$4<any> | readonly Annotation$4<any>[];
    /**
    Shorthand for `annotations:` [`Transaction.userEvent`](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent)`.of(...)`.
    */
    userEvent?: string;
    /**
    When set to `true`, the transaction is marked as needing to
    scroll the current selection into view.
    */
    scrollIntoView?: boolean;
    /**
    By default, transactions can be modified by [change
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^changeFilter) and [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter). You can set this
    to `false` to disable that. This can be necessary for
    transactions that, for example, include annotations that must be
    kept consistent with their changes.
    */
    filter?: boolean;
    /**
    Normally, when multiple specs are combined (for example by
    [`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update)), the
    positions in `changes` are taken to refer to the document
    positions in the initial document. When a spec has `sequental`
    set to true, its positions will be taken to refer to the
    document created by the specs before it instead.
    */
    sequential?: boolean;
}
/**
Changes to the editor state are grouped into transactions.
Typically, a user action creates a single transaction, which may
contain any number of document changes, may change the selection,
or have other effects. Create a transaction by calling
[`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update), or immediately
dispatch one by calling
[`EditorView.dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch).
*/
declare class Transaction$4 {
    /**
    The state from which the transaction starts.
    */
    readonly startState: EditorState$4;
    /**
    The document changes made by this transaction.
    */
    readonly changes: ChangeSet$4;
    /**
    The selection set by this transaction, or undefined if it
    doesn't explicitly set a selection.
    */
    readonly selection: EditorSelection$4 | undefined;
    /**
    The effects added to the transaction.
    */
    readonly effects: readonly StateEffect$4<any>[];
    /**
    Whether the selection should be scrolled into view after this
    transaction is dispatched.
    */
    readonly scrollIntoView: boolean;
    private constructor();
    /**
    The new document produced by the transaction. Contrary to
    [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
    force the entire new state to be computed right away, so it is
    recommended that [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
    when they need to look at the new document.
    */
    get newDoc(): Text$4;
    /**
    The new selection produced by the transaction. If
    [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
    this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
    current selection through the changes made by the transaction.
    */
    get newSelection(): EditorSelection$4;
    /**
    The new state created by the transaction. Computed on demand
    (but retained for subsequent access), so it is recommended not to
    access it in [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
    */
    get state(): EditorState$4;
    /**
    Get the value of the given annotation type, if any.
    */
    annotation<T>(type: AnnotationType$4<T>): T | undefined;
    /**
    Indicates whether the transaction changed the document.
    */
    get docChanged(): boolean;
    /**
    Indicates whether this transaction reconfigures the state
    (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
    with a top-level configuration
    [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
    */
    get reconfigured(): boolean;
    /**
    Returns true if the transaction has a [user
    event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
    or more specific than `event`. For example, if the transaction
    has `"select.pointer"` as user event, `"select"` and
    `"select.pointer"` will match it.
    */
    isUserEvent(event: string): boolean;
    /**
    Annotation used to store transaction timestamps. Automatically
    added to every transaction, holding `Date.now()`.
    */
    static time: AnnotationType$4<number>;
    /**
    Annotation used to associate a transaction with a user interface
    event. Holds a string identifying the event, using a
    dot-separated format to support attaching more specific
    information. The events used by the core libraries are:
    
     - `"input"` when content is entered
       - `"input.type"` for typed input
         - `"input.type.compose"` for composition
       - `"input.paste"` for pasted input
       - `"input.drop"` when adding content with drag-and-drop
       - `"input.complete"` when autocompleting
     - `"delete"` when the user deletes content
       - `"delete.selection"` when deleting the selection
       - `"delete.forward"` when deleting forward from the selection
       - `"delete.backward"` when deleting backward from the selection
       - `"delete.cut"` when cutting to the clipboard
     - `"move"` when content is moved
       - `"move.drop"` when content is moved within the editor through drag-and-drop
     - `"select"` when explicitly changing the selection
       - `"select.pointer"` when selecting with a mouse or other pointing device
     - `"undo"` and `"redo"` for history actions
    
    Use [`isUserEvent`](https://codemirror.net/6/docs/ref/#state.Transaction.isUserEvent) to check
    whether the annotation matches a given event.
    */
    static userEvent: AnnotationType$4<string>;
    /**
    Annotation indicating whether a transaction should be added to
    the undo history or not.
    */
    static addToHistory: AnnotationType$4<boolean>;
    /**
    Annotation indicating (when present and true) that a transaction
    represents a change made by some other actor, not the user. This
    is used, for example, to tag other people's changes in
    collaborative editing.
    */
    static remote: AnnotationType$4<boolean>;
}

/**
The categories produced by a [character
categorizer](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer). These are used
do things like selecting by word.
*/
declare enum CharCategory$4 {
    /**
    Word characters.
    */
    Word = 0,
    /**
    Whitespace.
    */
    Space = 1,
    /**
    Anything else.
    */
    Other = 2
}

/**
Options passed when [creating](https://codemirror.net/6/docs/ref/#state.EditorState^create) an
editor state.
*/
interface EditorStateConfig$4 {
    /**
    The initial document. Defaults to an empty document. Can be
    provided either as a plain string (which will be split into
    lines according to the value of the [`lineSeparator`
    facet](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)), or an instance of
    the [`Text`](https://codemirror.net/6/docs/ref/#state.Text) class (which is what the state will use
    to represent the document).
    */
    doc?: string | Text$4;
    /**
    The starting selection. Defaults to a cursor at the very start
    of the document.
    */
    selection?: EditorSelection$4 | {
        anchor: number;
        head?: number;
    };
    /**
    [Extension(s)](https://codemirror.net/6/docs/ref/#state.Extension) to associate with this state.
    */
    extensions?: Extension$4;
}
/**
The editor state class is a persistent (immutable) data structure.
To update a state, you [create](https://codemirror.net/6/docs/ref/#state.EditorState.update) a
[transaction](https://codemirror.net/6/docs/ref/#state.Transaction), which produces a _new_ state
instance, without modifying the original object.

As such, _never_ mutate properties of a state directly. That'll
just break things.
*/
declare class EditorState$4 {
    /**
    The current document.
    */
    readonly doc: Text$4;
    /**
    The current selection.
    */
    readonly selection: EditorSelection$4;
    private constructor();
    /**
    Retrieve the value of a [state field](https://codemirror.net/6/docs/ref/#state.StateField). Throws
    an error when the state doesn't have that field, unless you pass
    `false` as second parameter.
    */
    field<T>(field: StateField$4<T>): T;
    field<T>(field: StateField$4<T>, require: false): T | undefined;
    /**
    Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
    state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
    can be passed. Unless
    [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
    [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
    are assumed to start in the _current_ document (not the document
    produced by previous specs), and its
    [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
    [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
    to the document created by its _own_ changes. The resulting
    transaction contains the combined effect of all the different
    specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
    specs take precedence over earlier ones.
    */
    update(...specs: readonly TransactionSpec$4[]): Transaction$4;
    /**
    Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
    replaces every selection range with the given content.
    */
    replaceSelection(text: string | Text$4): TransactionSpec$4;
    /**
    Create a set of changes and a new selection by running the given
    function for each range in the active selection. The function
    can return an optional set of changes (in the coordinate space
    of the start document), plus an updated range (in the coordinate
    space of the document produced by the call's own changes). This
    method will merge all the changes and ranges into a single
    changeset and selection, and return it as a [transaction
    spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
    [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
    */
    changeByRange(f: (range: SelectionRange$4) => {
        range: SelectionRange$4;
        changes?: ChangeSpec$4;
        effects?: StateEffect$4<any> | readonly StateEffect$4<any>[];
    }): {
        changes: ChangeSet$4;
        selection: EditorSelection$4;
        effects: readonly StateEffect$4<any>[];
    };
    /**
    Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
    description, taking the state's document length and line
    separator into account.
    */
    changes(spec?: ChangeSpec$4): ChangeSet$4;
    /**
    Using the state's [line
    separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
    [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
    */
    toText(string: string): Text$4;
    /**
    Return the given range of the document as a string.
    */
    sliceDoc(from?: number, to?: number): string;
    /**
    Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
    */
    facet<Output>(facet: Facet$4<any, Output>): Output;
    /**
    Convert this state to a JSON-serializable object. When custom
    fields should be serialized, you can pass them in as an object
    mapping property names (in the resulting object, which should
    not use `doc` or `selection`) to fields.
    */
    toJSON(fields?: {
        [prop: string]: StateField$4<any>;
    }): any;
    /**
    Deserialize a state from its JSON representation. When custom
    fields should be deserialized, pass the same object you passed
    to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
    third argument.
    */
    static fromJSON(json: any, config?: EditorStateConfig$4, fields?: {
        [prop: string]: StateField$4<any>;
    }): EditorState$4;
    /**
    Create a new state. You'll usually only need this when
    initializing an editor—updated states are created by applying
    transactions.
    */
    static create(config?: EditorStateConfig$4): EditorState$4;
    /**
    A facet that, when enabled, causes the editor to allow multiple
    ranges to be selected. Be careful though, because by default the
    editor relies on the native DOM selection, which cannot handle
    multiple selections. An extension like
    [`drawSelection`](https://codemirror.net/6/docs/ref/#view.drawSelection) can be used to make
    secondary selections visible to the user.
    */
    static allowMultipleSelections: Facet$4<boolean, boolean>;
    /**
    Configures the tab size to use in this state. The first
    (highest-precedence) value of the facet is used. If no value is
    given, this defaults to 4.
    */
    static tabSize: Facet$4<number, number>;
    /**
    The size (in columns) of a tab in the document, determined by
    the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
    */
    get tabSize(): number;
    /**
    The line separator to use. By default, any of `"\n"`, `"\r\n"`
    and `"\r"` is treated as a separator when splitting lines, and
    lines are joined with `"\n"`.
    
    When you configure a value here, only that precise separator
    will be used, allowing you to round-trip documents through the
    editor without normalizing line separators.
    */
    static lineSeparator: Facet$4<string, string | undefined>;
    /**
    Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
    string for this state.
    */
    get lineBreak(): string;
    /**
    This facet controls the value of the
    [`readOnly`](https://codemirror.net/6/docs/ref/#state.EditorState.readOnly) getter, which is
    consulted by commands and extensions that implement editing
    functionality to determine whether they should apply. It
    defaults to false, but when its highest-precedence value is
    `true`, such functionality disables itself.
    
    Not to be confused with
    [`EditorView.editable`](https://codemirror.net/6/docs/ref/#view.EditorView^editable), which
    controls whether the editor's DOM is set to be editable (and
    thus focusable).
    */
    static readOnly: Facet$4<boolean, boolean>;
    /**
    Returns true when the editor is
    [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
    */
    get readOnly(): boolean;
    /**
    Registers translation phrases. The
    [`phrase`](https://codemirror.net/6/docs/ref/#state.EditorState.phrase) method will look through
    all objects registered with this facet to find translations for
    its argument.
    */
    static phrases: Facet$4<{
        [key: string]: string;
    }, readonly {
        [key: string]: string;
    }[]>;
    /**
    Look up a translation for the given phrase (via the
    [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
    original string if no translation is found.
    
    If additional arguments are passed, they will be inserted in
    place of markers like `$1` (for the first value) and `$2`, etc.
    A single `$` is equivalent to `$1`, and `$$` will produce a
    literal dollar sign.
    */
    phrase(phrase: string, ...insert: any[]): string;
    /**
    A facet used to register [language
    data](https://codemirror.net/6/docs/ref/#state.EditorState.languageDataAt) providers.
    */
    static languageData: Facet$4<(state: EditorState$4, pos: number, side: 0 | 1 | -1) => readonly {
        [name: string]: any;
    }[], readonly ((state: EditorState$4, pos: number, side: 0 | 1 | -1) => readonly {
        [name: string]: any;
    }[])[]>;
    /**
    Find the values for a given language data field, provided by the
    the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
    
    Examples of language data fields are...
    
    - [`"commentTokens"`](https://codemirror.net/6/docs/ref/#commands.CommentTokens) for specifying
      comment syntax.
    - [`"autocomplete"`](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion^config.override)
      for providing language-specific completion sources.
    - [`"wordChars"`](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) for adding
      characters that should be considered part of words in this
      language.
    - [`"closeBrackets"`](https://codemirror.net/6/docs/ref/#autocomplete.CloseBracketConfig) controls
      bracket closing behavior.
    */
    languageDataAt<T>(name: string, pos: number, side?: -1 | 0 | 1): readonly T[];
    /**
    Return a function that can categorize strings (expected to
    represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak))
    into one of:
    
     - Word (contains an alphanumeric character or a character
       explicitly listed in the local language's `"wordChars"`
       language data, which should be a string)
     - Space (contains only whitespace)
     - Other (anything else)
    */
    charCategorizer(at: number): (char: string) => CharCategory$4;
    /**
    Find the word at the given position, meaning the range
    containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
    around it. If no word characters are adjacent to the position,
    this returns null.
    */
    wordAt(pos: number): SelectionRange$4 | null;
    /**
    Facet used to register change filters, which are called for each
    transaction (unless explicitly
    [disabled](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter)), and can suppress
    part of the transaction's changes.
    
    Such a function can return `true` to indicate that it doesn't
    want to do anything, `false` to completely stop the changes in
    the transaction, or a set of ranges in which changes should be
    suppressed. Such ranges are represented as an array of numbers,
    with each pair of two numbers indicating the start and end of a
    range. So for example `[10, 20, 100, 110]` suppresses changes
    between 10 and 20, and between 100 and 110.
    */
    static changeFilter: Facet$4<(tr: Transaction$4) => boolean | readonly number[], readonly ((tr: Transaction$4) => boolean | readonly number[])[]>;
    /**
    Facet used to register a hook that gets a chance to update or
    replace transaction specs before they are applied. This will
    only be applied for transactions that don't have
    [`filter`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter) set to `false`. You
    can either return a single transaction spec (possibly the input
    transaction), or an array of specs (which will be combined in
    the same way as the arguments to
    [`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update)).
    
    When possible, it is recommended to avoid accessing
    [`Transaction.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state) in a filter,
    since it will force creation of a state that will then be
    discarded again, if the transaction is actually filtered.
    
    (This functionality should be used with care. Indiscriminately
    modifying transaction is likely to break something or degrade
    the user experience.)
    */
    static transactionFilter: Facet$4<(tr: Transaction$4) => TransactionSpec$4 | readonly TransactionSpec$4[], readonly ((tr: Transaction$4) => TransactionSpec$4 | readonly TransactionSpec$4[])[]>;
    /**
    This is a more limited form of
    [`transactionFilter`](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter),
    which can only add
    [annotations](https://codemirror.net/6/docs/ref/#state.TransactionSpec.annotations) and
    [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects). _But_, this type
    of filter runs even if the transaction has disabled regular
    [filtering](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter), making it suitable
    for effects that don't need to touch the changes or selection,
    but do want to process every transaction.
    
    Extenders run _after_ filters, when both are present.
    */
    static transactionExtender: Facet$4<(tr: Transaction$4) => Pick<TransactionSpec$4, "effects" | "annotations"> | null, readonly ((tr: Transaction$4) => Pick<TransactionSpec$4, "effects" | "annotations"> | null)[]>;
}

/**
Each range is associated with a value, which must inherit from
this class.
*/
declare abstract class RangeValue$3 {
    /**
    Compare this value with another value. Used when comparing
    rangesets. The default implementation compares by identity.
    Unless you are only creating a fixed number of unique instances
    of your value type, it is a good idea to implement this
    properly.
    */
    eq(other: RangeValue$3): boolean;
    /**
    The bias value at the start of the range. Determines how the
    range is positioned relative to other ranges starting at this
    position. Defaults to 0.
    */
    startSide: number;
    /**
    The bias value at the end of the range. Defaults to 0.
    */
    endSide: number;
    /**
    The mode with which the location of the range should be mapped
    when its `from` and `to` are the same, to decide whether a
    change deletes the range. Defaults to `MapMode.TrackDel`.
    */
    mapMode: MapMode$4;
    /**
    Determines whether this value marks a point range. Regular
    ranges affect the part of the document they cover, and are
    meaningless when empty. Point ranges have a meaning on their
    own. When non-empty, a point range is treated as atomic and
    shadows any ranges contained in it.
    */
    point: boolean;
    /**
    Create a [range](https://codemirror.net/6/docs/ref/#state.Range) with this value.
    */
    range(from: number, to?: number): Range$3<this>;
}
/**
A range associates a value with a range of positions.
*/
declare class Range$3<T extends RangeValue$3> {
    /**
    The range's start position.
    */
    readonly from: number;
    /**
    Its end position.
    */
    readonly to: number;
    /**
    The value associated with this range.
    */
    readonly value: T;
    private constructor();
}
/**
Collection of methods used when comparing range sets.
*/
interface RangeComparator$3<T extends RangeValue$3> {
    /**
    Notifies the comparator that a range (in positions in the new
    document) has the given sets of values associated with it, which
    are different in the old (A) and new (B) sets.
    */
    compareRange(from: number, to: number, activeA: T[], activeB: T[]): void;
    /**
    Notification for a changed (or inserted, or deleted) point range.
    */
    comparePoint(from: number, to: number, pointA: T | null, pointB: T | null): void;
}
/**
Methods used when iterating over the spans created by a set of
ranges. The entire iterated range will be covered with either
`span` or `point` calls.
*/
interface SpanIterator$3<T extends RangeValue$3> {
    /**
    Called for any ranges not covered by point decorations. `active`
    holds the values that the range is marked with (and may be
    empty). `openStart` indicates how many of those ranges are open
    (continued) at the start of the span.
    */
    span(from: number, to: number, active: readonly T[], openStart: number): void;
    /**
    Called when going over a point decoration. The active range
    decorations that cover the point and have a higher precedence
    are provided in `active`. The open count in `openStart` counts
    the number of those ranges that started before the point and. If
    the point started before the iterated range, `openStart` will be
    `active.length + 1` to signal this.
    */
    point(from: number, to: number, value: T, active: readonly T[], openStart: number, index: number): void;
}
/**
A range cursor is an object that moves to the next range every
time you call `next` on it. Note that, unlike ES6 iterators, these
start out pointing at the first element, so you should call `next`
only after reading the first range (if any).
*/
interface RangeCursor$3<T> {
    /**
    Move the iterator forward.
    */
    next: () => void;
    /**
    The next range's value. Holds `null` when the cursor has reached
    its end.
    */
    value: T | null;
    /**
    The next range's start position.
    */
    from: number;
    /**
    The next end position.
    */
    to: number;
}
declare type RangeSetUpdate$3<T extends RangeValue$3> = {
    /**
    An array of ranges to add. If given, this should be sorted by
    `from` position and `startSide` unless
    [`sort`](https://codemirror.net/6/docs/ref/#state.RangeSet.update^updateSpec.sort) is given as
    `true`.
    */
    add?: readonly Range$3<T>[];
    /**
    Indicates whether the library should sort the ranges in `add`.
    Defaults to `false`.
    */
    sort?: boolean;
    /**
    Filter the ranges already in the set. Only those for which this
    function returns `true` are kept.
    */
    filter?: (from: number, to: number, value: T) => boolean;
    /**
    Can be used to limit the range on which the filter is
    applied. Filtering only a small range, as opposed to the entire
    set, can make updates cheaper.
    */
    filterFrom?: number;
    /**
    The end position to apply the filter to.
    */
    filterTo?: number;
};
/**
A range set stores a collection of [ranges](https://codemirror.net/6/docs/ref/#state.Range) in a
way that makes them efficient to [map](https://codemirror.net/6/docs/ref/#state.RangeSet.map) and
[update](https://codemirror.net/6/docs/ref/#state.RangeSet.update). This is an immutable data
structure.
*/
declare class RangeSet$3<T extends RangeValue$3> {
    private constructor();
    /**
    The number of ranges in the set.
    */
    get size(): number;
    /**
    Update the range set, optionally adding new ranges or filtering
    out existing ones.
    
    (Note: The type parameter is just there as a kludge to work
    around TypeScript variance issues that prevented `RangeSet<X>`
    from being a subtype of `RangeSet<Y>` when `X` is a subtype of
    `Y`.)
    */
    update<U extends T>(updateSpec: RangeSetUpdate$3<U>): RangeSet$3<T>;
    /**
    Map this range set through a set of changes, return the new set.
    */
    map(changes: ChangeDesc$4): RangeSet$3<T>;
    /**
    Iterate over the ranges that touch the region `from` to `to`,
    calling `f` for each. There is no guarantee that the ranges will
    be reported in any specific order. When the callback returns
    `false`, iteration stops.
    */
    between(from: number, to: number, f: (from: number, to: number, value: T) => void | false): void;
    /**
    Iterate over the ranges in this set, in order, including all
    ranges that end at or after `from`.
    */
    iter(from?: number): RangeCursor$3<T>;
    /**
    Iterate over the ranges in a collection of sets, in order,
    starting from `from`.
    */
    static iter<T extends RangeValue$3>(sets: readonly RangeSet$3<T>[], from?: number): RangeCursor$3<T>;
    /**
    Iterate over two groups of sets, calling methods on `comparator`
    to notify it of possible differences.
    */
    static compare<T extends RangeValue$3>(oldSets: readonly RangeSet$3<T>[], newSets: readonly RangeSet$3<T>[], 
    /**
    This indicates how the underlying data changed between these
    ranges, and is needed to synchronize the iteration. `from` and
    `to` are coordinates in the _new_ space, after these changes.
    */
    textDiff: ChangeDesc$4, comparator: RangeComparator$3<T>, 
    /**
    Can be used to ignore all non-point ranges, and points below
    the given size. When -1, all ranges are compared.
    */
    minPointSize?: number): void;
    /**
    Compare the contents of two groups of range sets, returning true
    if they are equivalent in the given range.
    */
    static eq<T extends RangeValue$3>(oldSets: readonly RangeSet$3<T>[], newSets: readonly RangeSet$3<T>[], from?: number, to?: number): boolean;
    /**
    Iterate over a group of range sets at the same time, notifying
    the iterator about the ranges covering every given piece of
    content. Returns the open count (see
    [`SpanIterator.span`](https://codemirror.net/6/docs/ref/#state.SpanIterator.span)) at the end
    of the iteration.
    */
    static spans<T extends RangeValue$3>(sets: readonly RangeSet$3<T>[], from: number, to: number, iterator: SpanIterator$3<T>, 
    /**
    When given and greater than -1, only points of at least this
    size are taken into account.
    */
    minPointSize?: number): number;
    /**
    Create a range set for the given range or array of ranges. By
    default, this expects the ranges to be _sorted_ (by start
    position and, if two start at the same position,
    `value.startSide`). You can pass `true` as second argument to
    cause the method to sort them.
    */
    static of<T extends RangeValue$3>(ranges: readonly Range$3<T>[] | Range$3<T>, sort?: boolean): RangeSet$3<T>;
    /**
    The empty set of ranges.
    */
    static empty: RangeSet$3<any>;
}

declare class StyleModule {
  constructor(spec: {[selector: string]: StyleSpec}, options?: {
    finish?(sel: string): string
  })
  getRules(): string
  static mount(root: Document | ShadowRoot | DocumentOrShadowRoot, module: StyleModule | ReadonlyArray<StyleModule>): void
  static newName(): string
}

type StyleSpec = {
  [propOrSelector: string]: string | number | StyleSpec | null
}

declare type Attrs$4 = {
    [name: string]: string;
};

interface MarkDecorationSpec$4 {
    /**
    Whether the mark covers its start and end position or not. This
    influences whether content inserted at those positions becomes
    part of the mark. Defaults to false.
    */
    inclusive?: boolean;
    /**
    Specify whether the start position of the marked range should be
    inclusive. Overrides `inclusive`, when both are present.
    */
    inclusiveStart?: boolean;
    /**
    Whether the end should be inclusive.
    */
    inclusiveEnd?: boolean;
    /**
    Add attributes to the DOM elements that hold the text in the
    marked range.
    */
    attributes?: {
        [key: string]: string;
    };
    /**
    Shorthand for `{attributes: {class: value}}`.
    */
    class?: string;
    /**
    Add a wrapping element around the text in the marked range. Note
    that there will not necessarily be a single element covering the
    entire range—other decorations with lower precedence might split
    this one if they partially overlap it, and line breaks always
    end decoration elements.
    */
    tagName?: string;
    /**
    Decoration specs allow extra properties, which can be retrieved
    through the decoration's [`spec`](https://codemirror.net/6/docs/ref/#view.Decoration.spec)
    property.
    */
    [other: string]: any;
}
interface WidgetDecorationSpec$4 {
    /**
    The type of widget to draw here.
    */
    widget: WidgetType$4;
    /**
    Which side of the given position the widget is on. When this is
    positive, the widget will be drawn after the cursor if the
    cursor is on the same position. Otherwise, it'll be drawn before
    it. When multiple widgets sit at the same position, their `side`
    values will determine their ordering—those with a lower value
    come first. Defaults to 0.
    */
    side?: number;
    /**
    Determines whether this is a block widgets, which will be drawn
    between lines, or an inline widget (the default) which is drawn
    between the surrounding text.
    
    Note that block-level decorations should not have vertical
    margins, and if you dynamically change their height, you should
    make sure to call
    [`requestMeasure`](https://codemirror.net/6/docs/ref/#view.EditorView.requestMeasure), so that the
    editor can update its information about its vertical layout.
    */
    block?: boolean;
    /**
    Other properties are allowed.
    */
    [other: string]: any;
}
interface ReplaceDecorationSpec$4 {
    /**
    An optional widget to drawn in the place of the replaced
    content.
    */
    widget?: WidgetType$4;
    /**
    Whether this range covers the positions on its sides. This
    influences whether new content becomes part of the range and
    whether the cursor can be drawn on its sides. Defaults to false
    for inline replacements, and true for block replacements.
    */
    inclusive?: boolean;
    /**
    Set inclusivity at the start.
    */
    inclusiveStart?: boolean;
    /**
    Set inclusivity at the end.
    */
    inclusiveEnd?: boolean;
    /**
    Whether this is a block-level decoration. Defaults to false.
    */
    block?: boolean;
    /**
    Other properties are allowed.
    */
    [other: string]: any;
}
interface LineDecorationSpec$4 {
    /**
    DOM attributes to add to the element wrapping the line.
    */
    attributes?: {
        [key: string]: string;
    };
    /**
    Shorthand for `{attributes: {class: value}}`.
    */
    class?: string;
    /**
    Other properties are allowed.
    */
    [other: string]: any;
}
/**
Widgets added to the content are described by subclasses of this
class. Using a description object like that makes it possible to
delay creating of the DOM structure for a widget until it is
needed, and to avoid redrawing widgets even if the decorations
that define them are recreated.
*/
declare abstract class WidgetType$4 {
    /**
    Build the DOM structure for this widget instance.
    */
    abstract toDOM(view: EditorView$4): HTMLElement;
    /**
    Compare this instance to another instance of the same type.
    (TypeScript can't express this, but only instances of the same
    specific class will be passed to this method.) This is used to
    avoid redrawing widgets when they are replaced by a new
    decoration of the same type. The default implementation just
    returns `false`, which will cause new instances of the widget to
    always be redrawn.
    */
    eq(widget: WidgetType$4): boolean;
    /**
    Update a DOM element created by a widget of the same type (but
    different, non-`eq` content) to reflect this widget. May return
    true to indicate that it could update, false to indicate it
    couldn't (in which case the widget will be redrawn). The default
    implementation just returns false.
    */
    updateDOM(dom: HTMLElement): boolean;
    /**
    The estimated height this widget will have, to be used when
    estimating the height of content that hasn't been drawn. May
    return -1 to indicate you don't know. The default implementation
    returns -1.
    */
    get estimatedHeight(): number;
    /**
    Can be used to configure which kinds of events inside the widget
    should be ignored by the editor. The default is to ignore all
    events.
    */
    ignoreEvent(event: Event): boolean;
    /**
    This is called when the an instance of the widget is removed
    from the editor view.
    */
    destroy(dom: HTMLElement): void;
}
/**
A decoration set represents a collection of decorated ranges,
organized for efficient access and mapping. See
[`RangeSet`](https://codemirror.net/6/docs/ref/#state.RangeSet) for its methods.
*/
declare type DecorationSet$4 = RangeSet$3<Decoration$4>;
/**
The different types of blocks that can occur in an editor view.
*/
declare enum BlockType$4 {
    /**
    A line of text.
    */
    Text = 0,
    /**
    A block widget associated with the position after it.
    */
    WidgetBefore = 1,
    /**
    A block widget associated with the position before it.
    */
    WidgetAfter = 2,
    /**
    A block widget [replacing](https://codemirror.net/6/docs/ref/#view.Decoration^replace) a range of content.
    */
    WidgetRange = 3
}
/**
A decoration provides information on how to draw or style a piece
of content. You'll usually use it wrapped in a
[`Range`](https://codemirror.net/6/docs/ref/#state.Range), which adds a start and end position.
@nonabstract
*/
declare abstract class Decoration$4 extends RangeValue$3 {
    /**
    The config object used to create this decoration. You can
    include additional properties in there to store metadata about
    your decoration.
    */
    readonly spec: any;
    protected constructor(
    /**
    @internal
    */
    startSide: number, 
    /**
    @internal
    */
    endSide: number, 
    /**
    @internal
    */
    widget: WidgetType$4 | null, 
    /**
    The config object used to create this decoration. You can
    include additional properties in there to store metadata about
    your decoration.
    */
    spec: any);
    abstract eq(other: Decoration$4): boolean;
    /**
    Create a mark decoration, which influences the styling of the
    content in its range. Nested mark decorations will cause nested
    DOM elements to be created. Nesting order is determined by
    precedence of the [facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations), with
    the higher-precedence decorations creating the inner DOM nodes.
    Such elements are split on line boundaries and on the boundaries
    of lower-precedence decorations.
    */
    static mark(spec: MarkDecorationSpec$4): Decoration$4;
    /**
    Create a widget decoration, which displays a DOM element at the
    given position.
    */
    static widget(spec: WidgetDecorationSpec$4): Decoration$4;
    /**
    Create a replace decoration which replaces the given range with
    a widget, or simply hides it.
    */
    static replace(spec: ReplaceDecorationSpec$4): Decoration$4;
    /**
    Create a line decoration, which can add DOM attributes to the
    line starting at the given position.
    */
    static line(spec: LineDecorationSpec$4): Decoration$4;
    /**
    Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
    decorated range or ranges. If the ranges aren't already sorted,
    pass `true` for `sort` to make the library sort them for you.
    */
    static set(of: Range$3<Decoration$4> | readonly Range$3<Decoration$4>[], sort?: boolean): DecorationSet$4;
    /**
    The empty set of decorations.
    */
    static none: DecorationSet$4;
}

/**
Basic rectangle type.
*/
interface Rect$4 {
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;
}
declare type ScrollStrategy$4 = "nearest" | "start" | "end" | "center";

/**
Command functions are used in key bindings and other types of user
actions. Given an editor view, they check whether their effect can
apply to the editor, and if it can, perform it as a side effect
(which usually means [dispatching](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) a
transaction) and return `true`.
*/
declare type Command$3 = (target: EditorView$4) => boolean;
/**
This is the interface plugin objects conform to.
*/
interface PluginValue$4 extends Object {
    /**
    Notifies the plugin of an update that happened in the view. This
    is called _before_ the view updates its own DOM. It is
    responsible for updating the plugin's internal state (including
    any state that may be read by plugin fields) and _writing_ to
    the DOM for the changes in the update. To avoid unnecessary
    layout recomputations, it should _not_ read the DOM layout—use
    [`requestMeasure`](https://codemirror.net/6/docs/ref/#view.EditorView.requestMeasure) to schedule
    your code in a DOM reading phase if you need to.
    */
    update?(update: ViewUpdate$4): void;
    /**
    Called when the plugin is no longer going to be used. Should
    revert any changes the plugin made to the DOM.
    */
    destroy?(): void;
}
/**
Provides additional information when defining a [view
plugin](https://codemirror.net/6/docs/ref/#view.ViewPlugin).
*/
interface PluginSpec$4<V extends PluginValue$4> {
    /**
    Register the given [event
    handlers](https://codemirror.net/6/docs/ref/#view.EditorView^domEventHandlers) for the plugin.
    When called, these will have their `this` bound to the plugin
    value.
    */
    eventHandlers?: DOMEventHandlers$4<V>;
    /**
    Specify that the plugin provides additional extensions when
    added to an editor configuration.
    */
    provide?: (plugin: ViewPlugin$4<V>) => Extension$4;
    /**
    Allow the plugin to provide decorations. When given, this should
    be a function that take the plugin value and return a
    [decoration set](https://codemirror.net/6/docs/ref/#view.DecorationSet). See also the caveat about
    [layout-changing decorations](https://codemirror.net/6/docs/ref/#view.EditorView^decorations) that
    depend on the view.
    */
    decorations?: (value: V) => DecorationSet$4;
}
/**
View plugins associate stateful values with a view. They can
influence the way the content is drawn, and are notified of things
that happen in the view.
*/
declare class ViewPlugin$4<V extends PluginValue$4> {
    /**
    Instances of this class act as extensions.
    */
    extension: Extension$4;
    private constructor();
    /**
    Define a plugin from a constructor function that creates the
    plugin's value, given an editor view.
    */
    static define<V extends PluginValue$4>(create: (view: EditorView$4) => V, spec?: PluginSpec$4<V>): ViewPlugin$4<V>;
    /**
    Create a plugin for a class whose constructor takes a single
    editor view as argument.
    */
    static fromClass<V extends PluginValue$4>(cls: {
        new (view: EditorView$4): V;
    }, spec?: PluginSpec$4<V>): ViewPlugin$4<V>;
}
interface MeasureRequest$4<T> {
    /**
    Called in a DOM read phase to gather information that requires
    DOM layout. Should _not_ mutate the document.
    */
    read(view: EditorView$4): T;
    /**
    Called in a DOM write phase to update the document. Should _not_
    do anything that triggers DOM layout.
    */
    write?(measure: T, view: EditorView$4): void;
    /**
    When multiple requests with the same key are scheduled, only the
    last one will actually be ran.
    */
    key?: any;
}
declare type AttrSource$4 = Attrs$4 | ((view: EditorView$4) => Attrs$4 | null);
/**
View [plugins](https://codemirror.net/6/docs/ref/#view.ViewPlugin) are given instances of this
class, which describe what happened, whenever the view is updated.
*/
declare class ViewUpdate$4 {
    /**
    The editor view that the update is associated with.
    */
    readonly view: EditorView$4;
    /**
    The new editor state.
    */
    readonly state: EditorState$4;
    /**
    The transactions involved in the update. May be empty.
    */
    readonly transactions: readonly Transaction$4[];
    /**
    The changes made to the document by this update.
    */
    readonly changes: ChangeSet$4;
    /**
    The previous editor state.
    */
    readonly startState: EditorState$4;
    private constructor();
    /**
    Tells you whether the [viewport](https://codemirror.net/6/docs/ref/#view.EditorView.viewport) or
    [visible ranges](https://codemirror.net/6/docs/ref/#view.EditorView.visibleRanges) changed in this
    update.
    */
    get viewportChanged(): boolean;
    /**
    Indicates whether the height of a block element in the editor
    changed in this update.
    */
    get heightChanged(): boolean;
    /**
    Returns true when the document was modified or the size of the
    editor, or elements within the editor, changed.
    */
    get geometryChanged(): boolean;
    /**
    True when this update indicates a focus change.
    */
    get focusChanged(): boolean;
    /**
    Whether the document changed in this update.
    */
    get docChanged(): boolean;
    /**
    Whether the selection was explicitly set in this update.
    */
    get selectionSet(): boolean;
}

/**
Interface that objects registered with
[`EditorView.mouseSelectionStyle`](https://codemirror.net/6/docs/ref/#view.EditorView^mouseSelectionStyle)
must conform to.
*/
interface MouseSelectionStyle$4 {
    /**
    Return a new selection for the mouse gesture that starts with
    the event that was originally given to the constructor, and ends
    with the event passed here. In case of a plain click, those may
    both be the `mousedown` event, in case of a drag gesture, the
    latest `mousemove` event will be passed.
    
    When `extend` is true, that means the new selection should, if
    possible, extend the start selection. If `multiple` is true, the
    new selection should be added to the original selection.
    */
    get: (curEvent: MouseEvent, extend: boolean, multiple: boolean) => EditorSelection$4;
    /**
    Called when the view is updated while the gesture is in
    progress. When the document changes, it may be necessary to map
    some data (like the original selection or start position)
    through the changes.
    
    This may return `true` to indicate that the `get` method should
    get queried again after the update, because something in the
    update could change its result. Be wary of infinite loops when
    using this (where `get` returns a new selection, which will
    trigger `update`, which schedules another `get` in response).
    */
    update: (update: ViewUpdate$4) => boolean | void;
}
declare type MakeSelectionStyle$4 = (view: EditorView$4, event: MouseEvent) => MouseSelectionStyle$4 | null;

/**
Record used to represent information about a block-level element
in the editor view.
*/
declare class BlockInfo$4 {
    /**
    The start of the element in the document.
    */
    readonly from: number;
    /**
    The length of the element.
    */
    readonly length: number;
    /**
    The top position of the element (relative to the top of the
    document).
    */
    readonly top: number;
    /**
    Its height.
    */
    readonly height: number;
    /**
    The type of element this is. When querying lines, this may be
    an array of all the blocks that make up the line.
    */
    readonly type: BlockType$4 | readonly BlockInfo$4[];
    /**
    The end of the element as a document position.
    */
    get to(): number;
    /**
    The bottom position of the element.
    */
    get bottom(): number;
}

/**
Used to indicate [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
*/
declare enum Direction$4 {
    /**
    Left-to-right.
    */
    LTR = 0,
    /**
    Right-to-left.
    */
    RTL = 1
}
/**
Represents a contiguous range of text that has a single direction
(as in left-to-right or right-to-left).
*/
declare class BidiSpan$4 {
    /**
    The start of the span (relative to the start of the line).
    */
    readonly from: number;
    /**
    The end of the span.
    */
    readonly to: number;
    /**
    The ["bidi
    level"](https://unicode.org/reports/tr9/#Basic_Display_Algorithm)
    of the span (in this context, 0 means
    left-to-right, 1 means right-to-left, 2 means left-to-right
    number inside right-to-left text).
    */
    readonly level: number;
    /**
    The direction of this span.
    */
    get dir(): Direction$4;
}

/**
The type of object given to the [`EditorView`](https://codemirror.net/6/docs/ref/#view.EditorView)
constructor.
*/
interface EditorViewConfig$4 extends EditorStateConfig$4 {
    /**
    The view's initial state. If not given, a new state is created
    by passing this configuration object to
    [`EditorState.create`](https://codemirror.net/6/docs/ref/#state.EditorState^create), using its
    `doc`, `selection`, and `extensions` field (if provided).
    */
    state?: EditorState$4;
    /**
    When given, the editor is immediately appended to the given
    element on creation. (Otherwise, you'll have to place the view's
    [`dom`](https://codemirror.net/6/docs/ref/#view.EditorView.dom) element in the document yourself.)
    */
    parent?: Element | DocumentFragment;
    /**
    If the view is going to be mounted in a shadow root or document
    other than the one held by the global variable `document` (the
    default), you should pass it here. If you provide `parent`, but
    not this option, the editor will automatically look up a root
    from the parent.
    */
    root?: Document | ShadowRoot;
    /**
    Override the transaction [dispatch
    function](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) for this editor view, which
    is the way updates get routed to the view. Your implementation,
    if provided, should probably call the view's [`update`
    method](https://codemirror.net/6/docs/ref/#view.EditorView.update).
    */
    dispatch?: (tr: Transaction$4) => void;
}
/**
An editor view represents the editor's user interface. It holds
the editable DOM surface, and possibly other elements such as the
line number gutter. It handles events and dispatches state
transactions for editing actions.
*/
declare class EditorView$4 {
    /**
    The current editor state.
    */
    get state(): EditorState$4;
    /**
    To be able to display large documents without consuming too much
    memory or overloading the browser, CodeMirror only draws the
    code that is visible (plus a margin around it) to the DOM. This
    property tells you the extent of the current drawn viewport, in
    document positions.
    */
    get viewport(): {
        from: number;
        to: number;
    };
    /**
    When there are, for example, large collapsed ranges in the
    viewport, its size can be a lot bigger than the actual visible
    content. Thus, if you are doing something like styling the
    content in the viewport, it is preferable to only do so for
    these ranges, which are the subset of the viewport that is
    actually drawn.
    */
    get visibleRanges(): readonly {
        from: number;
        to: number;
    }[];
    /**
    Returns false when the editor is entirely scrolled out of view
    or otherwise hidden.
    */
    get inView(): boolean;
    /**
    Indicates whether the user is currently composing text via
    [IME](https://en.wikipedia.org/wiki/Input_method), and at least
    one change has been made in the current composition.
    */
    get composing(): boolean;
    /**
    Indicates whether the user is currently in composing state. Note
    that on some platforms, like Android, this will be the case a
    lot, since just putting the cursor on a word starts a
    composition there.
    */
    get compositionStarted(): boolean;
    private _dispatch;
    private _root;
    /**
    The document or shadow root that the view lives in.
    */
    get root(): DocumentOrShadowRoot;
    /**
    The DOM element that wraps the entire editor view.
    */
    readonly dom: HTMLElement;
    /**
    The DOM element that can be styled to scroll. (Note that it may
    not have been, so you can't assume this is scrollable.)
    */
    readonly scrollDOM: HTMLElement;
    /**
    The editable DOM element holding the editor content. You should
    not, usually, interact with this content directly though the
    DOM, since the editor will immediately undo most of the changes
    you make. Instead, [dispatch](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch)
    [transactions](https://codemirror.net/6/docs/ref/#state.Transaction) to modify content, and
    [decorations](https://codemirror.net/6/docs/ref/#view.Decoration) to style it.
    */
    readonly contentDOM: HTMLElement;
    private announceDOM;
    private plugins;
    private pluginMap;
    private editorAttrs;
    private contentAttrs;
    private styleModules;
    private bidiCache;
    private destroyed;
    /**
    Construct a new view. You'll want to either provide a `parent`
    option, or put `view.dom` into your document after creating a
    view, so that the user can see the editor.
    */
    constructor(config?: EditorViewConfig$4);
    /**
    All regular editor state updates should go through this. It
    takes a transaction or transaction spec and updates the view to
    show the new state produced by that transaction. Its
    implementation can be overridden with an
    [option](https://codemirror.net/6/docs/ref/#view.EditorView.constructor^config.dispatch). This
    function is bound to the view instance, so it does not have to
    be called as a method.
    */
    dispatch(tr: Transaction$4): void;
    dispatch(...specs: TransactionSpec$4[]): void;
    /**
    Update the view for the given array of transactions. This will
    update the visible document and selection to match the state
    produced by the transactions, and notify view plugins of the
    change. You should usually call
    [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead, which uses this
    as a primitive.
    */
    update(transactions: readonly Transaction$4[]): void;
    /**
    Reset the view to the given state. (This will cause the entire
    document to be redrawn and all view plugins to be reinitialized,
    so you should probably only use it when the new state isn't
    derived from the old state. Otherwise, use
    [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead.)
    */
    setState(newState: EditorState$4): void;
    private updatePlugins;
    /**
    Get the CSS classes for the currently active editor themes.
    */
    get themeClasses(): string;
    private updateAttrs;
    private showAnnouncements;
    private mountStyles;
    private readMeasured;
    /**
    Schedule a layout measurement, optionally providing callbacks to
    do custom DOM measuring followed by a DOM write phase. Using
    this is preferable reading DOM layout directly from, for
    example, an event handler, because it'll make sure measuring and
    drawing done by other components is synchronized, avoiding
    unnecessary DOM layout computations.
    */
    requestMeasure<T>(request?: MeasureRequest$4<T>): void;
    /**
    Get the value of a specific plugin, if present. Note that
    plugins that crash can be dropped from a view, so even when you
    know you registered a given plugin, it is recommended to check
    the return value of this method.
    */
    plugin<T extends PluginValue$4>(plugin: ViewPlugin$4<T>): T | null;
    /**
    The top position of the document, in screen coordinates. This
    may be negative when the editor is scrolled down. Points
    directly to the top of the first line, not above the padding.
    */
    get documentTop(): number;
    /**
    Reports the padding above and below the document.
    */
    get documentPadding(): {
        top: number;
        bottom: number;
    };
    /**
    Find the text line or block widget at the given vertical
    position (which is interpreted as relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop)).
    */
    elementAtHeight(height: number): BlockInfo$4;
    /**
    Find the line block (see
    [`lineBlockAt`](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) at the given
    height, again interpreted relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop).
    */
    lineBlockAtHeight(height: number): BlockInfo$4;
    /**
    Get the extent and vertical position of all [line
    blocks](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) in the viewport. Positions
    are relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop);
    */
    get viewportLineBlocks(): BlockInfo$4[];
    /**
    Find the line block around the given document position. A line
    block is a range delimited on both sides by either a
    non-[hidden](https://codemirror.net/6/docs/ref/#view.Decoration^replace) line breaks, or the
    start/end of the document. It will usually just hold a line of
    text, but may be broken into multiple textblocks by block
    widgets.
    */
    lineBlockAt(pos: number): BlockInfo$4;
    /**
    The editor's total content height.
    */
    get contentHeight(): number;
    /**
    Move a cursor position by [grapheme
    cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak). `forward` determines whether
    the motion is away from the line start, or towards it. In
    bidirectional text, the line is traversed in visual order, using
    the editor's [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
    When the start position was the last one on the line, the
    returned position will be across the line break. If there is no
    further line, the original position is returned.
    
    By default, this method moves over a single cluster. The
    optional `by` argument can be used to move across more. It will
    be called with the first cluster as argument, and should return
    a predicate that determines, for each subsequent cluster,
    whether it should also be moved over.
    */
    moveByChar(start: SelectionRange$4, forward: boolean, by?: (initial: string) => (next: string) => boolean): SelectionRange$4;
    /**
    Move a cursor position across the next group of either
    [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
    non-whitespace characters.
    */
    moveByGroup(start: SelectionRange$4, forward: boolean): SelectionRange$4;
    /**
    Move to the next line boundary in the given direction. If
    `includeWrap` is true, line wrapping is on, and there is a
    further wrap point on the current line, the wrap point will be
    returned. Otherwise this function will return the start or end
    of the line.
    */
    moveToLineBoundary(start: SelectionRange$4, forward: boolean, includeWrap?: boolean): SelectionRange$4;
    /**
    Move a cursor position vertically. When `distance` isn't given,
    it defaults to moving to the next line (including wrapped
    lines). Otherwise, `distance` should provide a positive distance
    in pixels.
    
    When `start` has a
    [`goalColumn`](https://codemirror.net/6/docs/ref/#state.SelectionRange.goalColumn), the vertical
    motion will use that as a target horizontal position. Otherwise,
    the cursor's own horizontal position is used. The returned
    cursor will have its goal column set to whichever column was
    used.
    */
    moveVertically(start: SelectionRange$4, forward: boolean, distance?: number): SelectionRange$4;
    /**
    Find the DOM parent node and offset (child offset if `node` is
    an element, character offset when it is a text node) at the
    given document position.
    
    Note that for positions that aren't currently in
    `visibleRanges`, the resulting DOM position isn't necessarily
    meaningful (it may just point before or after a placeholder
    element).
    */
    domAtPos(pos: number): {
        node: Node;
        offset: number;
    };
    /**
    Find the document position at the given DOM node. Can be useful
    for associating positions with DOM events. Will raise an error
    when `node` isn't part of the editor content.
    */
    posAtDOM(node: Node, offset?: number): number;
    /**
    Get the document position at the given screen coordinates. For
    positions not covered by the visible viewport's DOM structure,
    this will return null, unless `false` is passed as second
    argument, in which case it'll return an estimated position that
    would be near the coordinates if it were rendered.
    */
    posAtCoords(coords: {
        x: number;
        y: number;
    }, precise: false): number;
    posAtCoords(coords: {
        x: number;
        y: number;
    }): number | null;
    /**
    Get the screen coordinates at the given document position.
    `side` determines whether the coordinates are based on the
    element before (-1) or after (1) the position (if no element is
    available on the given side, the method will transparently use
    another strategy to get reasonable coordinates).
    */
    coordsAtPos(pos: number, side?: -1 | 1): Rect$4 | null;
    /**
    The default width of a character in the editor. May not
    accurately reflect the width of all characters (given variable
    width fonts or styling of invididual ranges).
    */
    get defaultCharacterWidth(): number;
    /**
    The default height of a line in the editor. May not be accurate
    for all lines.
    */
    get defaultLineHeight(): number;
    /**
    The text direction
    ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
    CSS property) of the editor's content element.
    */
    get textDirection(): Direction$4;
    /**
    Find the text direction of the block at the given position, as
    assigned by CSS. If
    [`perLineTextDirection`](https://codemirror.net/6/docs/ref/#view.EditorView^perLineTextDirection)
    isn't enabled, or the given position is outside of the viewport,
    this will always return the same as
    [`textDirection`](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection). Note that
    this may trigger a DOM layout.
    */
    textDirectionAt(pos: number): Direction$4;
    /**
    Whether this editor [wraps lines](https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping)
    (as determined by the
    [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
    CSS property of its content element).
    */
    get lineWrapping(): boolean;
    /**
    Returns the bidirectional text structure of the given line
    (which should be in the current document) as an array of span
    objects. The order of these spans matches the [text
    direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection)—if that is
    left-to-right, the leftmost spans come first, otherwise the
    rightmost spans come first.
    */
    bidiSpans(line: Line$5): readonly BidiSpan$4[];
    /**
    Check whether the editor has focus.
    */
    get hasFocus(): boolean;
    /**
    Put focus on the editor.
    */
    focus(): void;
    /**
    Update the [root](https://codemirror.net/6/docs/ref/##view.EditorViewConfig.root) in which the editor lives. This is only
    necessary when moving the editor's existing DOM to a new window or shadow root.
    */
    setRoot(root: Document | ShadowRoot): void;
    /**
    Clean up this editor view, removing its element from the
    document, unregistering event handlers, and notifying
    plugins. The view instance can no longer be used after
    calling this.
    */
    destroy(): void;
    /**
    Returns an effect that can be
    [added](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) to a transaction to
    cause it to scroll the given position or range into view.
    */
    static scrollIntoView(pos: number | SelectionRange$4, options?: {
        /**
        By default (`"nearest"`) the position will be vertically
        scrolled only the minimal amount required to move the given
        position into view. You can set this to `"start"` to move it
        to the top of the view, `"end"` to move it to the bottom, or
        `"center"` to move it to the center.
        */
        y?: ScrollStrategy$4;
        /**
        Effect similar to
        [`y`](https://codemirror.net/6/docs/ref/#view.EditorView^scrollIntoView^options.y), but for the
        horizontal scroll position.
        */
        x?: ScrollStrategy$4;
        /**
        Extra vertical distance to add when moving something into
        view. Not used with the `"center"` strategy. Defaults to 5.
        */
        yMargin?: number;
        /**
        Extra horizontal distance to add. Not used with the `"center"`
        strategy. Defaults to 5.
        */
        xMargin?: number;
    }): StateEffect$4<unknown>;
    /**
    Facet to add a [style
    module](https://github.com/marijnh/style-mod#documentation) to
    an editor view. The view will ensure that the module is
    mounted in its [document
    root](https://codemirror.net/6/docs/ref/#view.EditorView.constructor^config.root).
    */
    static styleModule: Facet$4<StyleModule, readonly StyleModule[]>;
    /**
    Returns an extension that can be used to add DOM event handlers.
    The value should be an object mapping event names to handler
    functions. For any given event, such functions are ordered by
    extension precedence, and the first handler to return true will
    be assumed to have handled that event, and no other handlers or
    built-in behavior will be activated for it. These are registered
    on the [content element](https://codemirror.net/6/docs/ref/#view.EditorView.contentDOM), except
    for `scroll` handlers, which will be called any time the
    editor's [scroll element](https://codemirror.net/6/docs/ref/#view.EditorView.scrollDOM) or one of
    its parent nodes is scrolled.
    */
    static domEventHandlers(handlers: DOMEventHandlers$4<any>): Extension$4;
    /**
    An input handler can override the way changes to the editable
    DOM content are handled. Handlers are passed the document
    positions between which the change was found, and the new
    content. When one returns true, no further input handlers are
    called and the default behavior is prevented.
    */
    static inputHandler: Facet$4<(view: EditorView$4, from: number, to: number, text: string) => boolean, readonly ((view: EditorView$4, from: number, to: number, text: string) => boolean)[]>;
    /**
    By default, the editor assumes all its content has the same
    [text direction](https://codemirror.net/6/docs/ref/#view.Direction). Configure this with a `true`
    value to make it read the text direction of every (rendered)
    line separately.
    */
    static perLineTextDirection: Facet$4<boolean, boolean>;
    /**
    Allows you to provide a function that should be called when the
    library catches an exception from an extension (mostly from view
    plugins, but may be used by other extensions to route exceptions
    from user-code-provided callbacks). This is mostly useful for
    debugging and logging. See [`logException`](https://codemirror.net/6/docs/ref/#view.logException).
    */
    static exceptionSink: Facet$4<(exception: any) => void, readonly ((exception: any) => void)[]>;
    /**
    A facet that can be used to register a function to be called
    every time the view updates.
    */
    static updateListener: Facet$4<(update: ViewUpdate$4) => void, readonly ((update: ViewUpdate$4) => void)[]>;
    /**
    Facet that controls whether the editor content DOM is editable.
    When its highest-precedence value is `false`, the element will
    not have its `contenteditable` attribute set. (Note that this
    doesn't affect API calls that change the editor content, even
    when those are bound to keys or buttons. See the
    [`readOnly`](https://codemirror.net/6/docs/ref/#state.EditorState.readOnly) facet for that.)
    */
    static editable: Facet$4<boolean, boolean>;
    /**
    Allows you to influence the way mouse selection happens. The
    functions in this facet will be called for a `mousedown` event
    on the editor, and can return an object that overrides the way a
    selection is computed from that mouse click or drag.
    */
    static mouseSelectionStyle: Facet$4<MakeSelectionStyle$4, readonly MakeSelectionStyle$4[]>;
    /**
    Facet used to configure whether a given selection drag event
    should move or copy the selection. The given predicate will be
    called with the `mousedown` event, and can return `true` when
    the drag should move the content.
    */
    static dragMovesSelection: Facet$4<(event: MouseEvent) => boolean, readonly ((event: MouseEvent) => boolean)[]>;
    /**
    Facet used to configure whether a given selecting click adds a
    new range to the existing selection or replaces it entirely. The
    default behavior is to check `event.metaKey` on macOS, and
    `event.ctrlKey` elsewhere.
    */
    static clickAddsSelectionRange: Facet$4<(event: MouseEvent) => boolean, readonly ((event: MouseEvent) => boolean)[]>;
    /**
    A facet that determines which [decorations](https://codemirror.net/6/docs/ref/#view.Decoration)
    are shown in the view. Decorations can be provided in two
    ways—directly, or via a function that takes an editor view.
    
    Only decoration sets provided directly are allowed to influence
    the editor's vertical layout structure. The ones provided as
    functions are called _after_ the new viewport has been computed,
    and thus **must not** introduce block widgets or replacing
    decorations that cover line breaks.
    
    If you want decorated ranges to behave like atomic units for
    cursor motion and deletion purposes, also provide the range set
    containing the decorations to
    [`EditorView.atomicRanges`](https://codemirror.net/6/docs/ref/#view.EditorView^atomicRanges).
    */
    static decorations: Facet$4<DecorationSet$4 | ((view: EditorView$4) => DecorationSet$4), readonly (DecorationSet$4 | ((view: EditorView$4) => DecorationSet$4))[]>;
    /**
    Used to provide ranges that should be treated as atoms as far as
    cursor motion is concerned. This causes methods like
    [`moveByChar`](https://codemirror.net/6/docs/ref/#view.EditorView.moveByChar) and
    [`moveVertically`](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) (and the
    commands built on top of them) to skip across such regions when
    a selection endpoint would enter them. This does _not_ prevent
    direct programmatic [selection
    updates](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) from moving into such
    regions.
    */
    static atomicRanges: Facet$4<(view: EditorView$4) => RangeSet$3<any>, readonly ((view: EditorView$4) => RangeSet$3<any>)[]>;
    /**
    Facet that allows extensions to provide additional scroll
    margins (space around the sides of the scrolling element that
    should be considered invisible). This can be useful when the
    plugin introduces elements that cover part of that element (for
    example a horizontally fixed gutter).
    */
    static scrollMargins: Facet$4<(view: EditorView$4) => Partial<Rect$4> | null, readonly ((view: EditorView$4) => Partial<Rect$4> | null)[]>;
    /**
    Create a theme extension. The first argument can be a
    [`style-mod`](https://github.com/marijnh/style-mod#documentation)
    style spec providing the styles for the theme. These will be
    prefixed with a generated class for the style.
    
    Because the selectors will be prefixed with a scope class, rule
    that directly match the editor's [wrapper
    element](https://codemirror.net/6/docs/ref/#view.EditorView.dom)—to which the scope class will be
    added—need to be explicitly differentiated by adding an `&` to
    the selector for that element—for example
    `&.cm-focused`.
    
    When `dark` is set to true, the theme will be marked as dark,
    which will cause the `&dark` rules from [base
    themes](https://codemirror.net/6/docs/ref/#view.EditorView^baseTheme) to be used (as opposed to
    `&light` when a light theme is active).
    */
    static theme(spec: {
        [selector: string]: StyleSpec;
    }, options?: {
        dark?: boolean;
    }): Extension$4;
    /**
    This facet records whether a dark theme is active. The extension
    returned by [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme) automatically
    includes an instance of this when the `dark` option is set to
    true.
    */
    static darkTheme: Facet$4<boolean, boolean>;
    /**
    Create an extension that adds styles to the base theme. Like
    with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
    place of the editor wrapper element when directly targeting
    that. You can also use `&dark` or `&light` instead to only
    target editors with a dark or light theme.
    */
    static baseTheme(spec: {
        [selector: string]: StyleSpec;
    }): Extension$4;
    /**
    Facet that provides additional DOM attributes for the editor's
    editable DOM element.
    */
    static contentAttributes: Facet$4<AttrSource$4, readonly AttrSource$4[]>;
    /**
    Facet that provides DOM attributes for the editor's outer
    element.
    */
    static editorAttributes: Facet$4<AttrSource$4, readonly AttrSource$4[]>;
    /**
    An extension that enables line wrapping in the editor (by
    setting CSS `white-space` to `pre-wrap` in the content).
    */
    static lineWrapping: Extension$4;
    /**
    State effect used to include screen reader announcements in a
    transaction. These will be added to the DOM in a visually hidden
    element with `aria-live="polite"` set, and should be used to
    describe effects that are visually obvious but may not be
    noticed by screen reader users (such as moving to the next
    search match).
    */
    static announce: StateEffectType$4<string>;
    /**
    Retrieve an editor view instance from the view's DOM
    representation.
    */
    static findFromDOM(dom: HTMLElement): EditorView$4 | null;
}
/**
Helper type that maps event names to event object types, or the
`any` type for unknown events.
*/
interface DOMEventMap$4 extends HTMLElementEventMap {
    [other: string]: any;
}
/**
Event handlers are specified with objects like this. For event
types known by TypeScript, this will infer the event argument type
to hold the appropriate event object type. For unknown events, it
is inferred to `any`, and should be explicitly set if you want type
checking.
*/
declare type DOMEventHandlers$4<This> = {
    [event in keyof DOMEventMap$4]?: (this: This, event: DOMEventMap$4[event], view: EditorView$4) => boolean | void;
};

/**
Key bindings associate key names with
[command](https://codemirror.net/6/docs/ref/#view.Command)-style functions.

Key names may be strings like `"Shift-Ctrl-Enter"`—a key identifier
prefixed with zero or more modifiers. Key identifiers are based on
the strings that can appear in
[`KeyEvent.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).
Use lowercase letters to refer to letter keys (or uppercase letters
if you want shift to be held). You may use `"Space"` as an alias
for the `" "` name.

Modifiers can be given in any order. `Shift-` (or `s-`), `Alt-` (or
`a-`), `Ctrl-` (or `c-` or `Control-`) and `Cmd-` (or `m-` or
`Meta-`) are recognized.

When a key binding contains multiple key names separated by
spaces, it represents a multi-stroke binding, which will fire when
the user presses the given keys after each other.

You can use `Mod-` as a shorthand for `Cmd-` on Mac and `Ctrl-` on
other platforms. So `Mod-b` is `Ctrl-b` on Linux but `Cmd-b` on
macOS.
*/
interface KeyBinding$3 {
    /**
    The key name to use for this binding. If the platform-specific
    property (`mac`, `win`, or `linux`) for the current platform is
    used as well in the binding, that one takes precedence. If `key`
    isn't defined and the platform-specific binding isn't either,
    a binding is ignored.
    */
    key?: string;
    /**
    Key to use specifically on macOS.
    */
    mac?: string;
    /**
    Key to use specifically on Windows.
    */
    win?: string;
    /**
    Key to use specifically on Linux.
    */
    linux?: string;
    /**
    The command to execute when this binding is triggered. When the
    command function returns `false`, further bindings will be tried
    for the key.
    */
    run?: Command$3;
    /**
    When given, this defines a second binding, using the (possibly
    platform-specific) key name prefixed with `Shift-` to activate
    this command.
    */
    shift?: Command$3;
    /**
    When this property is present, the function is called for every
    key that is not a multi-stroke prefix.
    */
    any?: (view: EditorView$4, event: KeyboardEvent) => boolean;
    /**
    By default, key bindings apply when focus is on the editor
    content (the `"editor"` scope). Some extensions, mostly those
    that define their own panels, might want to allow you to
    register bindings local to that panel. Such bindings should use
    a custom scope name. You may also assign multiple scope names to
    a binding, separating them by spaces.
    */
    scope?: string;
    /**
    When set to true (the default is false), this will always
    prevent the further handling for the bound key, even if the
    command(s) return false. This can be useful for cases where the
    native behavior of the key is annoying or irrelevant but the
    command doesn't always apply (such as, Mod-u for undo selection,
    which would cause the browser to view source instead when no
    selection can be undone).
    */
    preventDefault?: boolean;
}

declare class Tag$2 {
    readonly set: Tag$2[];
    static define(parent?: Tag$2): Tag$2;
    static defineModifier(): (tag: Tag$2) => Tag$2;
}
interface Highlighter {
    style(tags: readonly Tag$2[]): string | null;
    scope?(node: NodeType$4): boolean;
}

/**
A language object manages parsing and per-language
[metadata](https://codemirror.net/6/docs/ref/#state.EditorState.languageDataAt). Parse data is
managed as a [Lezer](https://lezer.codemirror.net) tree. The class
can be used directly, via the [`LRLanguage`](https://codemirror.net/6/docs/ref/#language.LRLanguage)
subclass for [Lezer](https://lezer.codemirror.net/) LR parsers, or
via the [`StreamLanguage`](https://codemirror.net/6/docs/ref/#language.StreamLanguage) subclass
for stream parsers.
*/
declare class Language {
    /**
    The [language data](https://codemirror.net/6/docs/ref/#state.EditorState.languageDataAt) facet
    used for this language.
    */
    readonly data: Facet$4<{
        [name: string]: any;
    }>;
    /**
    A language name.
    */
    readonly name: string;
    /**
    The extension value to install this as the document language.
    */
    readonly extension: Extension$4;
    /**
    The parser object. Can be useful when using this as a [nested
    parser](https://lezer.codemirror.net/docs/ref#common.Parser).
    */
    parser: Parser$4;
    /**
    Construct a language object. If you need to invoke this
    directly, first define a data facet with
    [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
    configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
    to the language's outer syntax node.
    */
    constructor(
    /**
    The [language data](https://codemirror.net/6/docs/ref/#state.EditorState.languageDataAt) facet
    used for this language.
    */
    data: Facet$4<{
        [name: string]: any;
    }>, parser: Parser$4, extraExtensions?: Extension$4[], 
    /**
    A language name.
    */
    name?: string);
    /**
    Query whether this language is active at the given position.
    */
    isActiveAt(state: EditorState$4, pos: number, side?: -1 | 0 | 1): boolean;
    /**
    Find the document regions that were parsed using this language.
    The returned regions will _include_ any nested languages rooted
    in this language, when those exist.
    */
    findRegions(state: EditorState$4): {
        from: number;
        to: number;
    }[];
    /**
    Indicates whether this language allows nested languages. The
    default implementation returns true.
    */
    get allowsNesting(): boolean;
}
/**
A subclass of [`Language`](https://codemirror.net/6/docs/ref/#language.Language) for use with Lezer
[LR parsers](https://lezer.codemirror.net/docs/ref#lr.LRParser)
parsers.
*/
declare class LRLanguage extends Language {
    readonly parser: LRParser;
    private constructor();
    /**
    Define a language from a parser.
    */
    static define(spec: {
        /**
        The [name](https://codemirror.net/6/docs/ref/#Language.name) of the language.
        */
        name?: string;
        /**
        The parser to use. Should already have added editor-relevant
        node props (and optionally things like dialect and top rule)
        configured.
        */
        parser: LRParser;
        /**
        [Language data](https://codemirror.net/6/docs/ref/#state.EditorState.languageDataAt)
        to register for this language.
        */
        languageData?: {
            [name: string]: any;
        };
    }): LRLanguage;
    /**
    Create a new instance of this language with a reconfigured
    version of its parser and optionally a new name.
    */
    configure(options: ParserConfig, name?: string): LRLanguage;
    get allowsNesting(): boolean;
}
/**
Get the syntax tree for a state, which is the current (possibly
incomplete) parse tree of the active
[language](https://codemirror.net/6/docs/ref/#language.Language), or the empty tree if there is no
language available.
*/
declare function syntaxTree(state: EditorState$4): Tree$4;
/**
Queries whether there is a full syntax tree available up to the
given document position. If there isn't, the background parse
process _might_ still be working and update the tree further, but
there is no guarantee of that—the parser will [stop
working](https://codemirror.net/6/docs/ref/#language.syntaxParserRunning) when it has spent a
certain amount of time or has moved beyond the visible viewport.
Always returns false if no language has been enabled.
*/
declare function syntaxTreeAvailable(state: EditorState$4, upto?: number): boolean;
/**
This class bundles a [language](https://codemirror.net/6/docs/ref/#language.Language) with an
optional set of supporting extensions. Language packages are
encouraged to export a function that optionally takes a
configuration object and returns a `LanguageSupport` instance, as
the main way for client code to use the package.
*/
declare class LanguageSupport {
    /**
    The language object.
    */
    readonly language: Language;
    /**
    An optional set of supporting extensions. When nesting a
    language in another language, the outer language is encouraged
    to include the supporting extensions for its inner languages
    in its own set of support extensions.
    */
    readonly support: Extension$4;
    /**
    An extension including both the language and its support
    extensions. (Allowing the object to be used as an extension
    value itself.)
    */
    extension: Extension$4;
    /**
    Create a language support object.
    */
    constructor(
    /**
    The language object.
    */
    language: Language, 
    /**
    An optional set of supporting extensions. When nesting a
    language in another language, the outer language is encouraged
    to include the supporting extensions for its inner languages
    in its own set of support extensions.
    */
    support?: Extension$4);
}
/**
Language descriptions are used to store metadata about languages
and to dynamically load them. Their main role is finding the
appropriate language for a filename or dynamically loading nested
parsers.
*/
declare class LanguageDescription {
    /**
    The name of this language.
    */
    readonly name: string;
    /**
    Alternative names for the mode (lowercased, includes `this.name`).
    */
    readonly alias: readonly string[];
    /**
    File extensions associated with this language.
    */
    readonly extensions: readonly string[];
    /**
    Optional filename pattern that should be associated with this
    language.
    */
    readonly filename: RegExp | undefined;
    private loadFunc;
    /**
    If the language has been loaded, this will hold its value.
    */
    support: LanguageSupport | undefined;
    private loading;
    private constructor();
    /**
    Start loading the the language. Will return a promise that
    resolves to a [`LanguageSupport`](https://codemirror.net/6/docs/ref/#language.LanguageSupport)
    object when the language successfully loads.
    */
    load(): Promise<LanguageSupport>;
    /**
    Create a language description.
    */
    static of(spec: {
        /**
        The language's name.
        */
        name: string;
        /**
        An optional array of alternative names.
        */
        alias?: readonly string[];
        /**
        An optional array of filename extensions associated with this
        language.
        */
        extensions?: readonly string[];
        /**
        An optional filename pattern associated with this language.
        */
        filename?: RegExp;
        /**
        A function that will asynchronously load the language.
        */
        load?: () => Promise<LanguageSupport>;
        /**
        Alternatively to `load`, you can provide an already loaded
        support object. Either this or `load` should be provided.
        */
        support?: LanguageSupport;
    }): LanguageDescription;
    /**
    Look for a language in the given array of descriptions that
    matches the filename. Will first match
    [`filename`](https://codemirror.net/6/docs/ref/#language.LanguageDescription.filename) patterns,
    and then [extensions](https://codemirror.net/6/docs/ref/#language.LanguageDescription.extensions),
    and return the first language that matches.
    */
    static matchFilename(descs: readonly LanguageDescription[], filename: string): LanguageDescription | null;
    /**
    Look for a language whose name or alias matches the the given
    name (case-insensitively). If `fuzzy` is true, and no direct
    matchs is found, this'll also search for a language whose name
    or alias occurs in the string (for names shorter than three
    characters, only when surrounded by non-word characters).
    */
    static matchLanguageName(descs: readonly LanguageDescription[], name: string, fuzzy?: boolean): LanguageDescription | null;
}
/**
Facet for overriding the unit by which indentation happens.
Should be a string consisting either entirely of spaces or
entirely of tabs. When not set, this defaults to 2 spaces.
*/
declare const indentUnit: Facet$4<string, string>;
/**
Enables reindentation on input. When a language defines an
`indentOnInput` field in its [language
data](https://codemirror.net/6/docs/ref/#state.EditorState.languageDataAt), which must hold a regular
expression, the line at the cursor will be reindented whenever new
text is typed and the input from the start of the line up to the
cursor matches that regexp.

To avoid unneccesary reindents, it is recommended to start the
regexp with `^` (usually followed by `\s*`), and end it with `$`.
For example, `/^\s*\}$/` will reindent when a closing brace is
added at the start of a line.
*/
declare function indentOnInput(): Extension$4;
/**
Default fold-related key bindings.

 - Ctrl-Shift-[ (Cmd-Alt-[ on macOS): [`foldCode`](https://codemirror.net/6/docs/ref/#language.foldCode).
 - Ctrl-Shift-] (Cmd-Alt-] on macOS): [`unfoldCode`](https://codemirror.net/6/docs/ref/#language.unfoldCode).
 - Ctrl-Alt-[: [`foldAll`](https://codemirror.net/6/docs/ref/#language.foldAll).
 - Ctrl-Alt-]: [`unfoldAll`](https://codemirror.net/6/docs/ref/#language.unfoldAll).
*/
declare const foldKeymap: readonly KeyBinding$3[];
declare type Handlers$1 = {
    [event: string]: (view: EditorView$4, line: BlockInfo$4, event: Event) => boolean;
};
interface FoldGutterConfig {
    /**
    A function that creates the DOM element used to indicate a
    given line is folded or can be folded.
    When not given, the `openText`/`closeText` option will be used instead.
    */
    markerDOM?: ((open: boolean) => HTMLElement) | null;
    /**
    Text used to indicate that a given line can be folded.
    Defaults to `"⌄"`.
    */
    openText?: string;
    /**
    Text used to indicate that a given line is folded.
    Defaults to `"›"`.
    */
    closedText?: string;
    /**
    Supply event handlers for DOM events on this gutter.
    */
    domEventHandlers?: Handlers$1;
    /**
    When given, if this returns true for a given view update,
    recompute the fold markers.
    */
    foldingChanged?: (update: ViewUpdate$4) => boolean;
}
/**
Create an extension that registers a fold gutter, which shows a
fold status indicator before foldable lines (which can be clicked
to fold or unfold the line).
*/
declare function foldGutter(config?: FoldGutterConfig): Extension$4;

/**
A highlight style associates CSS styles with higlighting
[tags](https://lezer.codemirror.net/docs/ref#highlight.Tag).
*/
declare class HighlightStyle implements Highlighter {
    /**
    The tag styles used to create this highlight style.
    */
    readonly specs: readonly TagStyle[];
    /**
    A style module holding the CSS rules for this highlight style.
    When using
    [`highlightTree`](https://lezer.codemirror.net/docs/ref#highlight.highlightTree)
    outside of the editor, you may want to manually mount this
    module to show the highlighting.
    */
    readonly module: StyleModule | null;
    readonly style: (tags: readonly Tag$2[]) => string | null;
    readonly scope: ((type: NodeType$4) => boolean) | undefined;
    private constructor();
    /**
    Create a highlighter style that associates the given styles to
    the given tags. The specs must be objects that hold a style tag
    or array of tags in their `tag` property, and either a single
    `class` property providing a static CSS class (for highlighter
    that rely on external styling), or a
    [`style-mod`](https://github.com/marijnh/style-mod#documentation)-style
    set of CSS properties (which define the styling for those tags).
    
    The CSS rules created for a highlighter will be emitted in the
    order of the spec's properties. That means that for elements that
    have multiple tags associated with them, styles defined further
    down in the list will have a higher CSS precedence than styles
    defined earlier.
    */
    static define(specs: readonly TagStyle[], options?: {
        /**
        By default, highlighters apply to the entire document. You can
        scope them to a single language by providing the language
        object or a language's top node type here.
        */
        scope?: Language | NodeType$4;
        /**
        Add a style to _all_ content. Probably only useful in
        combination with `scope`.
        */
        all?: string | StyleSpec;
        /**
        Specify that this highlight style should only be active then
        the theme is dark or light. By default, it is active
        regardless of theme.
        */
        themeType?: "dark" | "light";
    }): HighlightStyle;
}
/**
Wrap a highlighter in an editor extension that uses it to apply
syntax highlighting to the editor content.

When multiple (non-fallback) styles are provided, the styling
applied is the union of the classes they emit.
*/
declare function syntaxHighlighting(highlighter: Highlighter, options?: {
    /**
    When enabled, this marks the highlighter as a fallback, which
    only takes effect if no other highlighters are registered.
    */
    fallback: boolean;
}): Extension$4;
/**
The type of object used in
[`HighlightStyle.define`](https://codemirror.net/6/docs/ref/#language.HighlightStyle^define).
Assigns a style to one or more highlighting
[tags](https://lezer.codemirror.net/docs/ref#highlight.Tag), which can either be a fixed class name
(which must be defined elsewhere), or a set of CSS properties, for
which the library will define an anonymous class.
*/
interface TagStyle {
    /**
    The tag or tags to target.
    */
    tag: Tag$2 | readonly Tag$2[];
    /**
    If given, this maps the tags to a fixed class name.
    */
    class?: string;
    /**
    Any further properties (if `class` isn't given) will be
    interpreted as in style objects given to
    [style-mod](https://github.com/marijnh/style-mod#documentation).
    (The type here is `any` because of TypeScript limitations.)
    */
    [styleProperty: string]: any;
}
/**
A default highlight style (works well with light themes).
*/
declare const defaultHighlightStyle: HighlightStyle;

interface Config {
    /**
    Whether the bracket matching should look at the character after
    the cursor when matching (if the one before isn't a bracket).
    Defaults to true.
    */
    afterCursor?: boolean;
    /**
    The bracket characters to match, as a string of pairs. Defaults
    to `"()[]{}"`. Note that these are only used as fallback when
    there is no [matching
    information](https://lezer.codemirror.net/docs/ref/#common.NodeProp^closedBy)
    in the syntax tree.
    */
    brackets?: string;
    /**
    The maximum distance to scan for matching brackets. This is only
    relevant for brackets not encoded in the syntax tree. Defaults
    to 10 000.
    */
    maxScanDistance?: number;
    /**
    Can be used to configure the way in which brackets are
    decorated. The default behavior is to add the
    `cm-matchingBracket` class for matching pairs, and
    `cm-nonmatchingBracket` for mismatched pairs or single brackets.
    */
    renderMatch?: (match: MatchResult, state: EditorState$4) => readonly Range$3<Decoration$4>[];
}
/**
Create an extension that enables bracket matching. Whenever the
cursor is next to a bracket, that bracket and the one it matches
are highlighted. Or, when no matching bracket is found, another
highlighting style is used to indicate this.
*/
declare function bracketMatching(config?: Config): Extension$4;
/**
The result returned from `matchBrackets`.
*/
interface MatchResult {
    /**
    The extent of the bracket token found.
    */
    start: {
        from: number;
        to: number;
    };
    /**
    The extent of the matched token, if any was found.
    */
    end?: {
        from: number;
        to: number;
    };
    /**
    Whether the tokens match. This can be false even when `end` has
    a value, if that token doesn't match the opening token.
    */
    matched: boolean;
}

declare type JuliaLanguageConfig = {
    /** Enable keyword completion */
    enableKeywordCompletion?: boolean;
};
declare function julia(config?: JuliaLanguageConfig): LanguageSupport;

declare type Attrs$3 = {
    [name: string]: string;
};

interface MarkDecorationSpec$3 {
    /**
    Whether the mark covers its start and end position or not. This
    influences whether content inserted at those positions becomes
    part of the mark. Defaults to false.
    */
    inclusive?: boolean;
    /**
    Specify whether the start position of the marked range should be
    inclusive. Overrides `inclusive`, when both are present.
    */
    inclusiveStart?: boolean;
    /**
    Whether the end should be inclusive.
    */
    inclusiveEnd?: boolean;
    /**
    Add attributes to the DOM elements that hold the text in the
    marked range.
    */
    attributes?: {
        [key: string]: string;
    };
    /**
    Shorthand for `{attributes: {class: value}}`.
    */
    class?: string;
    /**
    Add a wrapping element around the text in the marked range. Note
    that there will not necessarily be a single element covering the
    entire range—other decorations with lower precedence might split
    this one if they partially overlap it, and line breaks always
    end decoration elements.
    */
    tagName?: string;
    /**
    Decoration specs allow extra properties, which can be retrieved
    through the decoration's [`spec`](https://codemirror.net/6/docs/ref/#view.Decoration.spec)
    property.
    */
    [other: string]: any;
}
interface WidgetDecorationSpec$3 {
    /**
    The type of widget to draw here.
    */
    widget: WidgetType$3;
    /**
    Which side of the given position the widget is on. When this is
    positive, the widget will be drawn after the cursor if the
    cursor is on the same position. Otherwise, it'll be drawn before
    it. When multiple widgets sit at the same position, their `side`
    values will determine their ordering—those with a lower value
    come first. Defaults to 0.
    */
    side?: number;
    /**
    Determines whether this is a block widgets, which will be drawn
    between lines, or an inline widget (the default) which is drawn
    between the surrounding text.
    
    Note that block-level decorations should not have vertical
    margins, and if you dynamically change their height, you should
    make sure to call
    [`requestMeasure`](https://codemirror.net/6/docs/ref/#view.EditorView.requestMeasure), so that the
    editor can update its information about its vertical layout.
    */
    block?: boolean;
    /**
    Other properties are allowed.
    */
    [other: string]: any;
}
interface ReplaceDecorationSpec$3 {
    /**
    An optional widget to drawn in the place of the replaced
    content.
    */
    widget?: WidgetType$3;
    /**
    Whether this range covers the positions on its sides. This
    influences whether new content becomes part of the range and
    whether the cursor can be drawn on its sides. Defaults to false
    for inline replacements, and true for block replacements.
    */
    inclusive?: boolean;
    /**
    Set inclusivity at the start.
    */
    inclusiveStart?: boolean;
    /**
    Set inclusivity at the end.
    */
    inclusiveEnd?: boolean;
    /**
    Whether this is a block-level decoration. Defaults to false.
    */
    block?: boolean;
    /**
    Other properties are allowed.
    */
    [other: string]: any;
}
interface LineDecorationSpec$3 {
    /**
    DOM attributes to add to the element wrapping the line.
    */
    attributes?: {
        [key: string]: string;
    };
    /**
    Shorthand for `{attributes: {class: value}}`.
    */
    class?: string;
    /**
    Other properties are allowed.
    */
    [other: string]: any;
}
/**
Widgets added to the content are described by subclasses of this
class. Using a description object like that makes it possible to
delay creating of the DOM structure for a widget until it is
needed, and to avoid redrawing widgets even if the decorations
that define them are recreated.
*/
declare abstract class WidgetType$3 {
    /**
    Build the DOM structure for this widget instance.
    */
    abstract toDOM(view: EditorView$3): HTMLElement;
    /**
    Compare this instance to another instance of the same type.
    (TypeScript can't express this, but only instances of the same
    specific class will be passed to this method.) This is used to
    avoid redrawing widgets when they are replaced by a new
    decoration of the same type. The default implementation just
    returns `false`, which will cause new instances of the widget to
    always be redrawn.
    */
    eq(widget: WidgetType$3): boolean;
    /**
    Update a DOM element created by a widget of the same type (but
    different, non-`eq` content) to reflect this widget. May return
    true to indicate that it could update, false to indicate it
    couldn't (in which case the widget will be redrawn). The default
    implementation just returns false.
    */
    updateDOM(dom: HTMLElement): boolean;
    /**
    The estimated height this widget will have, to be used when
    estimating the height of content that hasn't been drawn. May
    return -1 to indicate you don't know. The default implementation
    returns -1.
    */
    get estimatedHeight(): number;
    /**
    Can be used to configure which kinds of events inside the widget
    should be ignored by the editor. The default is to ignore all
    events.
    */
    ignoreEvent(event: Event): boolean;
    /**
    This is called when the an instance of the widget is removed
    from the editor view.
    */
    destroy(dom: HTMLElement): void;
}
/**
A decoration set represents a collection of decorated ranges,
organized for efficient access and mapping. See
[`RangeSet`](https://codemirror.net/6/docs/ref/#state.RangeSet) for its methods.
*/
declare type DecorationSet$3 = RangeSet$4<Decoration$3>;
/**
The different types of blocks that can occur in an editor view.
*/
declare enum BlockType$3 {
    /**
    A line of text.
    */
    Text = 0,
    /**
    A block widget associated with the position after it.
    */
    WidgetBefore = 1,
    /**
    A block widget associated with the position before it.
    */
    WidgetAfter = 2,
    /**
    A block widget [replacing](https://codemirror.net/6/docs/ref/#view.Decoration^replace) a range of content.
    */
    WidgetRange = 3
}
/**
A decoration provides information on how to draw or style a piece
of content. You'll usually use it wrapped in a
[`Range`](https://codemirror.net/6/docs/ref/#state.Range), which adds a start and end position.
@nonabstract
*/
declare abstract class Decoration$3 extends RangeValue$4 {
    /**
    The config object used to create this decoration. You can
    include additional properties in there to store metadata about
    your decoration.
    */
    readonly spec: any;
    protected constructor(
    /**
    @internal
    */
    startSide: number, 
    /**
    @internal
    */
    endSide: number, 
    /**
    @internal
    */
    widget: WidgetType$3 | null, 
    /**
    The config object used to create this decoration. You can
    include additional properties in there to store metadata about
    your decoration.
    */
    spec: any);
    abstract eq(other: Decoration$3): boolean;
    /**
    Create a mark decoration, which influences the styling of the
    content in its range. Nested mark decorations will cause nested
    DOM elements to be created. Nesting order is determined by
    precedence of the [facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations), with
    the higher-precedence decorations creating the inner DOM nodes.
    Such elements are split on line boundaries and on the boundaries
    of lower-precedence decorations.
    */
    static mark(spec: MarkDecorationSpec$3): Decoration$3;
    /**
    Create a widget decoration, which displays a DOM element at the
    given position.
    */
    static widget(spec: WidgetDecorationSpec$3): Decoration$3;
    /**
    Create a replace decoration which replaces the given range with
    a widget, or simply hides it.
    */
    static replace(spec: ReplaceDecorationSpec$3): Decoration$3;
    /**
    Create a line decoration, which can add DOM attributes to the
    line starting at the given position.
    */
    static line(spec: LineDecorationSpec$3): Decoration$3;
    /**
    Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
    decorated range or ranges. If the ranges aren't already sorted,
    pass `true` for `sort` to make the library sort them for you.
    */
    static set(of: Range$4<Decoration$3> | readonly Range$4<Decoration$3>[], sort?: boolean): DecorationSet$3;
    /**
    The empty set of decorations.
    */
    static none: DecorationSet$3;
}

/**
Basic rectangle type.
*/
interface Rect$3 {
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;
}
declare type ScrollStrategy$3 = "nearest" | "start" | "end" | "center";

/**
Command functions are used in key bindings and other types of user
actions. Given an editor view, they check whether their effect can
apply to the editor, and if it can, perform it as a side effect
(which usually means [dispatching](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) a
transaction) and return `true`.
*/
declare type Command$2 = (target: EditorView$3) => boolean;
/**
This is the interface plugin objects conform to.
*/
interface PluginValue$3 extends Object {
    /**
    Notifies the plugin of an update that happened in the view. This
    is called _before_ the view updates its own DOM. It is
    responsible for updating the plugin's internal state (including
    any state that may be read by plugin fields) and _writing_ to
    the DOM for the changes in the update. To avoid unnecessary
    layout recomputations, it should _not_ read the DOM layout—use
    [`requestMeasure`](https://codemirror.net/6/docs/ref/#view.EditorView.requestMeasure) to schedule
    your code in a DOM reading phase if you need to.
    */
    update?(update: ViewUpdate$3): void;
    /**
    Called when the plugin is no longer going to be used. Should
    revert any changes the plugin made to the DOM.
    */
    destroy?(): void;
}
/**
Provides additional information when defining a [view
plugin](https://codemirror.net/6/docs/ref/#view.ViewPlugin).
*/
interface PluginSpec$3<V extends PluginValue$3> {
    /**
    Register the given [event
    handlers](https://codemirror.net/6/docs/ref/#view.EditorView^domEventHandlers) for the plugin.
    When called, these will have their `this` bound to the plugin
    value.
    */
    eventHandlers?: DOMEventHandlers$3<V>;
    /**
    Specify that the plugin provides additional extensions when
    added to an editor configuration.
    */
    provide?: (plugin: ViewPlugin$3<V>) => Extension$5;
    /**
    Allow the plugin to provide decorations. When given, this should
    be a function that take the plugin value and return a
    [decoration set](https://codemirror.net/6/docs/ref/#view.DecorationSet). See also the caveat about
    [layout-changing decorations](https://codemirror.net/6/docs/ref/#view.EditorView^decorations) that
    depend on the view.
    */
    decorations?: (value: V) => DecorationSet$3;
}
/**
View plugins associate stateful values with a view. They can
influence the way the content is drawn, and are notified of things
that happen in the view.
*/
declare class ViewPlugin$3<V extends PluginValue$3> {
    /**
    Instances of this class act as extensions.
    */
    extension: Extension$5;
    private constructor();
    /**
    Define a plugin from a constructor function that creates the
    plugin's value, given an editor view.
    */
    static define<V extends PluginValue$3>(create: (view: EditorView$3) => V, spec?: PluginSpec$3<V>): ViewPlugin$3<V>;
    /**
    Create a plugin for a class whose constructor takes a single
    editor view as argument.
    */
    static fromClass<V extends PluginValue$3>(cls: {
        new (view: EditorView$3): V;
    }, spec?: PluginSpec$3<V>): ViewPlugin$3<V>;
}
interface MeasureRequest$3<T> {
    /**
    Called in a DOM read phase to gather information that requires
    DOM layout. Should _not_ mutate the document.
    */
    read(view: EditorView$3): T;
    /**
    Called in a DOM write phase to update the document. Should _not_
    do anything that triggers DOM layout.
    */
    write?(measure: T, view: EditorView$3): void;
    /**
    When multiple requests with the same key are scheduled, only the
    last one will actually be ran.
    */
    key?: any;
}
declare type AttrSource$3 = Attrs$3 | ((view: EditorView$3) => Attrs$3 | null);
/**
View [plugins](https://codemirror.net/6/docs/ref/#view.ViewPlugin) are given instances of this
class, which describe what happened, whenever the view is updated.
*/
declare class ViewUpdate$3 {
    /**
    The editor view that the update is associated with.
    */
    readonly view: EditorView$3;
    /**
    The new editor state.
    */
    readonly state: EditorState$5;
    /**
    The transactions involved in the update. May be empty.
    */
    readonly transactions: readonly Transaction$5[];
    /**
    The changes made to the document by this update.
    */
    readonly changes: ChangeSet$5;
    /**
    The previous editor state.
    */
    readonly startState: EditorState$5;
    private constructor();
    /**
    Tells you whether the [viewport](https://codemirror.net/6/docs/ref/#view.EditorView.viewport) or
    [visible ranges](https://codemirror.net/6/docs/ref/#view.EditorView.visibleRanges) changed in this
    update.
    */
    get viewportChanged(): boolean;
    /**
    Indicates whether the height of a block element in the editor
    changed in this update.
    */
    get heightChanged(): boolean;
    /**
    Returns true when the document was modified or the size of the
    editor, or elements within the editor, changed.
    */
    get geometryChanged(): boolean;
    /**
    True when this update indicates a focus change.
    */
    get focusChanged(): boolean;
    /**
    Whether the document changed in this update.
    */
    get docChanged(): boolean;
    /**
    Whether the selection was explicitly set in this update.
    */
    get selectionSet(): boolean;
}

/**
Interface that objects registered with
[`EditorView.mouseSelectionStyle`](https://codemirror.net/6/docs/ref/#view.EditorView^mouseSelectionStyle)
must conform to.
*/
interface MouseSelectionStyle$3 {
    /**
    Return a new selection for the mouse gesture that starts with
    the event that was originally given to the constructor, and ends
    with the event passed here. In case of a plain click, those may
    both be the `mousedown` event, in case of a drag gesture, the
    latest `mousemove` event will be passed.
    
    When `extend` is true, that means the new selection should, if
    possible, extend the start selection. If `multiple` is true, the
    new selection should be added to the original selection.
    */
    get: (curEvent: MouseEvent, extend: boolean, multiple: boolean) => EditorSelection$5;
    /**
    Called when the view is updated while the gesture is in
    progress. When the document changes, it may be necessary to map
    some data (like the original selection or start position)
    through the changes.
    
    This may return `true` to indicate that the `get` method should
    get queried again after the update, because something in the
    update could change its result. Be wary of infinite loops when
    using this (where `get` returns a new selection, which will
    trigger `update`, which schedules another `get` in response).
    */
    update: (update: ViewUpdate$3) => boolean | void;
}
declare type MakeSelectionStyle$3 = (view: EditorView$3, event: MouseEvent) => MouseSelectionStyle$3 | null;

/**
Record used to represent information about a block-level element
in the editor view.
*/
declare class BlockInfo$3 {
    /**
    The start of the element in the document.
    */
    readonly from: number;
    /**
    The length of the element.
    */
    readonly length: number;
    /**
    The top position of the element (relative to the top of the
    document).
    */
    readonly top: number;
    /**
    Its height.
    */
    readonly height: number;
    /**
    The type of element this is. When querying lines, this may be
    an array of all the blocks that make up the line.
    */
    readonly type: BlockType$3 | readonly BlockInfo$3[];
    /**
    The end of the element as a document position.
    */
    get to(): number;
    /**
    The bottom position of the element.
    */
    get bottom(): number;
}

/**
Used to indicate [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
*/
declare enum Direction$3 {
    /**
    Left-to-right.
    */
    LTR = 0,
    /**
    Right-to-left.
    */
    RTL = 1
}
/**
Represents a contiguous range of text that has a single direction
(as in left-to-right or right-to-left).
*/
declare class BidiSpan$3 {
    /**
    The start of the span (relative to the start of the line).
    */
    readonly from: number;
    /**
    The end of the span.
    */
    readonly to: number;
    /**
    The ["bidi
    level"](https://unicode.org/reports/tr9/#Basic_Display_Algorithm)
    of the span (in this context, 0 means
    left-to-right, 1 means right-to-left, 2 means left-to-right
    number inside right-to-left text).
    */
    readonly level: number;
    /**
    The direction of this span.
    */
    get dir(): Direction$3;
}

/**
The type of object given to the [`EditorView`](https://codemirror.net/6/docs/ref/#view.EditorView)
constructor.
*/
interface EditorViewConfig$3 extends EditorStateConfig$5 {
    /**
    The view's initial state. If not given, a new state is created
    by passing this configuration object to
    [`EditorState.create`](https://codemirror.net/6/docs/ref/#state.EditorState^create), using its
    `doc`, `selection`, and `extensions` field (if provided).
    */
    state?: EditorState$5;
    /**
    When given, the editor is immediately appended to the given
    element on creation. (Otherwise, you'll have to place the view's
    [`dom`](https://codemirror.net/6/docs/ref/#view.EditorView.dom) element in the document yourself.)
    */
    parent?: Element | DocumentFragment;
    /**
    If the view is going to be mounted in a shadow root or document
    other than the one held by the global variable `document` (the
    default), you should pass it here. If you provide `parent`, but
    not this option, the editor will automatically look up a root
    from the parent.
    */
    root?: Document | ShadowRoot;
    /**
    Override the transaction [dispatch
    function](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) for this editor view, which
    is the way updates get routed to the view. Your implementation,
    if provided, should probably call the view's [`update`
    method](https://codemirror.net/6/docs/ref/#view.EditorView.update).
    */
    dispatch?: (tr: Transaction$5) => void;
}
/**
An editor view represents the editor's user interface. It holds
the editable DOM surface, and possibly other elements such as the
line number gutter. It handles events and dispatches state
transactions for editing actions.
*/
declare class EditorView$3 {
    /**
    The current editor state.
    */
    get state(): EditorState$5;
    /**
    To be able to display large documents without consuming too much
    memory or overloading the browser, CodeMirror only draws the
    code that is visible (plus a margin around it) to the DOM. This
    property tells you the extent of the current drawn viewport, in
    document positions.
    */
    get viewport(): {
        from: number;
        to: number;
    };
    /**
    When there are, for example, large collapsed ranges in the
    viewport, its size can be a lot bigger than the actual visible
    content. Thus, if you are doing something like styling the
    content in the viewport, it is preferable to only do so for
    these ranges, which are the subset of the viewport that is
    actually drawn.
    */
    get visibleRanges(): readonly {
        from: number;
        to: number;
    }[];
    /**
    Returns false when the editor is entirely scrolled out of view
    or otherwise hidden.
    */
    get inView(): boolean;
    /**
    Indicates whether the user is currently composing text via
    [IME](https://en.wikipedia.org/wiki/Input_method), and at least
    one change has been made in the current composition.
    */
    get composing(): boolean;
    /**
    Indicates whether the user is currently in composing state. Note
    that on some platforms, like Android, this will be the case a
    lot, since just putting the cursor on a word starts a
    composition there.
    */
    get compositionStarted(): boolean;
    private _dispatch;
    private _root;
    /**
    The document or shadow root that the view lives in.
    */
    get root(): DocumentOrShadowRoot;
    /**
    The DOM element that wraps the entire editor view.
    */
    readonly dom: HTMLElement;
    /**
    The DOM element that can be styled to scroll. (Note that it may
    not have been, so you can't assume this is scrollable.)
    */
    readonly scrollDOM: HTMLElement;
    /**
    The editable DOM element holding the editor content. You should
    not, usually, interact with this content directly though the
    DOM, since the editor will immediately undo most of the changes
    you make. Instead, [dispatch](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch)
    [transactions](https://codemirror.net/6/docs/ref/#state.Transaction) to modify content, and
    [decorations](https://codemirror.net/6/docs/ref/#view.Decoration) to style it.
    */
    readonly contentDOM: HTMLElement;
    private announceDOM;
    private plugins;
    private pluginMap;
    private editorAttrs;
    private contentAttrs;
    private styleModules;
    private bidiCache;
    private destroyed;
    /**
    Construct a new view. You'll want to either provide a `parent`
    option, or put `view.dom` into your document after creating a
    view, so that the user can see the editor.
    */
    constructor(config?: EditorViewConfig$3);
    /**
    All regular editor state updates should go through this. It
    takes a transaction or transaction spec and updates the view to
    show the new state produced by that transaction. Its
    implementation can be overridden with an
    [option](https://codemirror.net/6/docs/ref/#view.EditorView.constructor^config.dispatch). This
    function is bound to the view instance, so it does not have to
    be called as a method.
    */
    dispatch(tr: Transaction$5): void;
    dispatch(...specs: TransactionSpec$5[]): void;
    /**
    Update the view for the given array of transactions. This will
    update the visible document and selection to match the state
    produced by the transactions, and notify view plugins of the
    change. You should usually call
    [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead, which uses this
    as a primitive.
    */
    update(transactions: readonly Transaction$5[]): void;
    /**
    Reset the view to the given state. (This will cause the entire
    document to be redrawn and all view plugins to be reinitialized,
    so you should probably only use it when the new state isn't
    derived from the old state. Otherwise, use
    [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead.)
    */
    setState(newState: EditorState$5): void;
    private updatePlugins;
    /**
    Get the CSS classes for the currently active editor themes.
    */
    get themeClasses(): string;
    private updateAttrs;
    private showAnnouncements;
    private mountStyles;
    private readMeasured;
    /**
    Schedule a layout measurement, optionally providing callbacks to
    do custom DOM measuring followed by a DOM write phase. Using
    this is preferable reading DOM layout directly from, for
    example, an event handler, because it'll make sure measuring and
    drawing done by other components is synchronized, avoiding
    unnecessary DOM layout computations.
    */
    requestMeasure<T>(request?: MeasureRequest$3<T>): void;
    /**
    Get the value of a specific plugin, if present. Note that
    plugins that crash can be dropped from a view, so even when you
    know you registered a given plugin, it is recommended to check
    the return value of this method.
    */
    plugin<T extends PluginValue$3>(plugin: ViewPlugin$3<T>): T | null;
    /**
    The top position of the document, in screen coordinates. This
    may be negative when the editor is scrolled down. Points
    directly to the top of the first line, not above the padding.
    */
    get documentTop(): number;
    /**
    Reports the padding above and below the document.
    */
    get documentPadding(): {
        top: number;
        bottom: number;
    };
    /**
    Find the text line or block widget at the given vertical
    position (which is interpreted as relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop)).
    */
    elementAtHeight(height: number): BlockInfo$3;
    /**
    Find the line block (see
    [`lineBlockAt`](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) at the given
    height, again interpreted relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop).
    */
    lineBlockAtHeight(height: number): BlockInfo$3;
    /**
    Get the extent and vertical position of all [line
    blocks](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) in the viewport. Positions
    are relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop);
    */
    get viewportLineBlocks(): BlockInfo$3[];
    /**
    Find the line block around the given document position. A line
    block is a range delimited on both sides by either a
    non-[hidden](https://codemirror.net/6/docs/ref/#view.Decoration^replace) line breaks, or the
    start/end of the document. It will usually just hold a line of
    text, but may be broken into multiple textblocks by block
    widgets.
    */
    lineBlockAt(pos: number): BlockInfo$3;
    /**
    The editor's total content height.
    */
    get contentHeight(): number;
    /**
    Move a cursor position by [grapheme
    cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak). `forward` determines whether
    the motion is away from the line start, or towards it. In
    bidirectional text, the line is traversed in visual order, using
    the editor's [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
    When the start position was the last one on the line, the
    returned position will be across the line break. If there is no
    further line, the original position is returned.
    
    By default, this method moves over a single cluster. The
    optional `by` argument can be used to move across more. It will
    be called with the first cluster as argument, and should return
    a predicate that determines, for each subsequent cluster,
    whether it should also be moved over.
    */
    moveByChar(start: SelectionRange$5, forward: boolean, by?: (initial: string) => (next: string) => boolean): SelectionRange$5;
    /**
    Move a cursor position across the next group of either
    [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
    non-whitespace characters.
    */
    moveByGroup(start: SelectionRange$5, forward: boolean): SelectionRange$5;
    /**
    Move to the next line boundary in the given direction. If
    `includeWrap` is true, line wrapping is on, and there is a
    further wrap point on the current line, the wrap point will be
    returned. Otherwise this function will return the start or end
    of the line.
    */
    moveToLineBoundary(start: SelectionRange$5, forward: boolean, includeWrap?: boolean): SelectionRange$5;
    /**
    Move a cursor position vertically. When `distance` isn't given,
    it defaults to moving to the next line (including wrapped
    lines). Otherwise, `distance` should provide a positive distance
    in pixels.
    
    When `start` has a
    [`goalColumn`](https://codemirror.net/6/docs/ref/#state.SelectionRange.goalColumn), the vertical
    motion will use that as a target horizontal position. Otherwise,
    the cursor's own horizontal position is used. The returned
    cursor will have its goal column set to whichever column was
    used.
    */
    moveVertically(start: SelectionRange$5, forward: boolean, distance?: number): SelectionRange$5;
    /**
    Find the DOM parent node and offset (child offset if `node` is
    an element, character offset when it is a text node) at the
    given document position.
    
    Note that for positions that aren't currently in
    `visibleRanges`, the resulting DOM position isn't necessarily
    meaningful (it may just point before or after a placeholder
    element).
    */
    domAtPos(pos: number): {
        node: Node;
        offset: number;
    };
    /**
    Find the document position at the given DOM node. Can be useful
    for associating positions with DOM events. Will raise an error
    when `node` isn't part of the editor content.
    */
    posAtDOM(node: Node, offset?: number): number;
    /**
    Get the document position at the given screen coordinates. For
    positions not covered by the visible viewport's DOM structure,
    this will return null, unless `false` is passed as second
    argument, in which case it'll return an estimated position that
    would be near the coordinates if it were rendered.
    */
    posAtCoords(coords: {
        x: number;
        y: number;
    }, precise: false): number;
    posAtCoords(coords: {
        x: number;
        y: number;
    }): number | null;
    /**
    Get the screen coordinates at the given document position.
    `side` determines whether the coordinates are based on the
    element before (-1) or after (1) the position (if no element is
    available on the given side, the method will transparently use
    another strategy to get reasonable coordinates).
    */
    coordsAtPos(pos: number, side?: -1 | 1): Rect$3 | null;
    /**
    The default width of a character in the editor. May not
    accurately reflect the width of all characters (given variable
    width fonts or styling of invididual ranges).
    */
    get defaultCharacterWidth(): number;
    /**
    The default height of a line in the editor. May not be accurate
    for all lines.
    */
    get defaultLineHeight(): number;
    /**
    The text direction
    ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
    CSS property) of the editor's content element.
    */
    get textDirection(): Direction$3;
    /**
    Find the text direction of the block at the given position, as
    assigned by CSS. If
    [`perLineTextDirection`](https://codemirror.net/6/docs/ref/#view.EditorView^perLineTextDirection)
    isn't enabled, or the given position is outside of the viewport,
    this will always return the same as
    [`textDirection`](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection). Note that
    this may trigger a DOM layout.
    */
    textDirectionAt(pos: number): Direction$3;
    /**
    Whether this editor [wraps lines](https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping)
    (as determined by the
    [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
    CSS property of its content element).
    */
    get lineWrapping(): boolean;
    /**
    Returns the bidirectional text structure of the given line
    (which should be in the current document) as an array of span
    objects. The order of these spans matches the [text
    direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection)—if that is
    left-to-right, the leftmost spans come first, otherwise the
    rightmost spans come first.
    */
    bidiSpans(line: Line$6): readonly BidiSpan$3[];
    /**
    Check whether the editor has focus.
    */
    get hasFocus(): boolean;
    /**
    Put focus on the editor.
    */
    focus(): void;
    /**
    Update the [root](https://codemirror.net/6/docs/ref/##view.EditorViewConfig.root) in which the editor lives. This is only
    necessary when moving the editor's existing DOM to a new window or shadow root.
    */
    setRoot(root: Document | ShadowRoot): void;
    /**
    Clean up this editor view, removing its element from the
    document, unregistering event handlers, and notifying
    plugins. The view instance can no longer be used after
    calling this.
    */
    destroy(): void;
    /**
    Returns an effect that can be
    [added](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) to a transaction to
    cause it to scroll the given position or range into view.
    */
    static scrollIntoView(pos: number | SelectionRange$5, options?: {
        /**
        By default (`"nearest"`) the position will be vertically
        scrolled only the minimal amount required to move the given
        position into view. You can set this to `"start"` to move it
        to the top of the view, `"end"` to move it to the bottom, or
        `"center"` to move it to the center.
        */
        y?: ScrollStrategy$3;
        /**
        Effect similar to
        [`y`](https://codemirror.net/6/docs/ref/#view.EditorView^scrollIntoView^options.y), but for the
        horizontal scroll position.
        */
        x?: ScrollStrategy$3;
        /**
        Extra vertical distance to add when moving something into
        view. Not used with the `"center"` strategy. Defaults to 5.
        */
        yMargin?: number;
        /**
        Extra horizontal distance to add. Not used with the `"center"`
        strategy. Defaults to 5.
        */
        xMargin?: number;
    }): StateEffect$5<unknown>;
    /**
    Facet to add a [style
    module](https://github.com/marijnh/style-mod#documentation) to
    an editor view. The view will ensure that the module is
    mounted in its [document
    root](https://codemirror.net/6/docs/ref/#view.EditorView.constructor^config.root).
    */
    static styleModule: Facet$5<StyleModule, readonly StyleModule[]>;
    /**
    Returns an extension that can be used to add DOM event handlers.
    The value should be an object mapping event names to handler
    functions. For any given event, such functions are ordered by
    extension precedence, and the first handler to return true will
    be assumed to have handled that event, and no other handlers or
    built-in behavior will be activated for it. These are registered
    on the [content element](https://codemirror.net/6/docs/ref/#view.EditorView.contentDOM), except
    for `scroll` handlers, which will be called any time the
    editor's [scroll element](https://codemirror.net/6/docs/ref/#view.EditorView.scrollDOM) or one of
    its parent nodes is scrolled.
    */
    static domEventHandlers(handlers: DOMEventHandlers$3<any>): Extension$5;
    /**
    An input handler can override the way changes to the editable
    DOM content are handled. Handlers are passed the document
    positions between which the change was found, and the new
    content. When one returns true, no further input handlers are
    called and the default behavior is prevented.
    */
    static inputHandler: Facet$5<(view: EditorView$3, from: number, to: number, text: string) => boolean, readonly ((view: EditorView$3, from: number, to: number, text: string) => boolean)[]>;
    /**
    By default, the editor assumes all its content has the same
    [text direction](https://codemirror.net/6/docs/ref/#view.Direction). Configure this with a `true`
    value to make it read the text direction of every (rendered)
    line separately.
    */
    static perLineTextDirection: Facet$5<boolean, boolean>;
    /**
    Allows you to provide a function that should be called when the
    library catches an exception from an extension (mostly from view
    plugins, but may be used by other extensions to route exceptions
    from user-code-provided callbacks). This is mostly useful for
    debugging and logging. See [`logException`](https://codemirror.net/6/docs/ref/#view.logException).
    */
    static exceptionSink: Facet$5<(exception: any) => void, readonly ((exception: any) => void)[]>;
    /**
    A facet that can be used to register a function to be called
    every time the view updates.
    */
    static updateListener: Facet$5<(update: ViewUpdate$3) => void, readonly ((update: ViewUpdate$3) => void)[]>;
    /**
    Facet that controls whether the editor content DOM is editable.
    When its highest-precedence value is `false`, the element will
    not have its `contenteditable` attribute set. (Note that this
    doesn't affect API calls that change the editor content, even
    when those are bound to keys or buttons. See the
    [`readOnly`](https://codemirror.net/6/docs/ref/#state.EditorState.readOnly) facet for that.)
    */
    static editable: Facet$5<boolean, boolean>;
    /**
    Allows you to influence the way mouse selection happens. The
    functions in this facet will be called for a `mousedown` event
    on the editor, and can return an object that overrides the way a
    selection is computed from that mouse click or drag.
    */
    static mouseSelectionStyle: Facet$5<MakeSelectionStyle$3, readonly MakeSelectionStyle$3[]>;
    /**
    Facet used to configure whether a given selection drag event
    should move or copy the selection. The given predicate will be
    called with the `mousedown` event, and can return `true` when
    the drag should move the content.
    */
    static dragMovesSelection: Facet$5<(event: MouseEvent) => boolean, readonly ((event: MouseEvent) => boolean)[]>;
    /**
    Facet used to configure whether a given selecting click adds a
    new range to the existing selection or replaces it entirely. The
    default behavior is to check `event.metaKey` on macOS, and
    `event.ctrlKey` elsewhere.
    */
    static clickAddsSelectionRange: Facet$5<(event: MouseEvent) => boolean, readonly ((event: MouseEvent) => boolean)[]>;
    /**
    A facet that determines which [decorations](https://codemirror.net/6/docs/ref/#view.Decoration)
    are shown in the view. Decorations can be provided in two
    ways—directly, or via a function that takes an editor view.
    
    Only decoration sets provided directly are allowed to influence
    the editor's vertical layout structure. The ones provided as
    functions are called _after_ the new viewport has been computed,
    and thus **must not** introduce block widgets or replacing
    decorations that cover line breaks.
    
    If you want decorated ranges to behave like atomic units for
    cursor motion and deletion purposes, also provide the range set
    containing the decorations to
    [`EditorView.atomicRanges`](https://codemirror.net/6/docs/ref/#view.EditorView^atomicRanges).
    */
    static decorations: Facet$5<DecorationSet$3 | ((view: EditorView$3) => DecorationSet$3), readonly (DecorationSet$3 | ((view: EditorView$3) => DecorationSet$3))[]>;
    /**
    Used to provide ranges that should be treated as atoms as far as
    cursor motion is concerned. This causes methods like
    [`moveByChar`](https://codemirror.net/6/docs/ref/#view.EditorView.moveByChar) and
    [`moveVertically`](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) (and the
    commands built on top of them) to skip across such regions when
    a selection endpoint would enter them. This does _not_ prevent
    direct programmatic [selection
    updates](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) from moving into such
    regions.
    */
    static atomicRanges: Facet$5<(view: EditorView$3) => RangeSet$4<any>, readonly ((view: EditorView$3) => RangeSet$4<any>)[]>;
    /**
    Facet that allows extensions to provide additional scroll
    margins (space around the sides of the scrolling element that
    should be considered invisible). This can be useful when the
    plugin introduces elements that cover part of that element (for
    example a horizontally fixed gutter).
    */
    static scrollMargins: Facet$5<(view: EditorView$3) => Partial<Rect$3> | null, readonly ((view: EditorView$3) => Partial<Rect$3> | null)[]>;
    /**
    Create a theme extension. The first argument can be a
    [`style-mod`](https://github.com/marijnh/style-mod#documentation)
    style spec providing the styles for the theme. These will be
    prefixed with a generated class for the style.
    
    Because the selectors will be prefixed with a scope class, rule
    that directly match the editor's [wrapper
    element](https://codemirror.net/6/docs/ref/#view.EditorView.dom)—to which the scope class will be
    added—need to be explicitly differentiated by adding an `&` to
    the selector for that element—for example
    `&.cm-focused`.
    
    When `dark` is set to true, the theme will be marked as dark,
    which will cause the `&dark` rules from [base
    themes](https://codemirror.net/6/docs/ref/#view.EditorView^baseTheme) to be used (as opposed to
    `&light` when a light theme is active).
    */
    static theme(spec: {
        [selector: string]: StyleSpec;
    }, options?: {
        dark?: boolean;
    }): Extension$5;
    /**
    This facet records whether a dark theme is active. The extension
    returned by [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme) automatically
    includes an instance of this when the `dark` option is set to
    true.
    */
    static darkTheme: Facet$5<boolean, boolean>;
    /**
    Create an extension that adds styles to the base theme. Like
    with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
    place of the editor wrapper element when directly targeting
    that. You can also use `&dark` or `&light` instead to only
    target editors with a dark or light theme.
    */
    static baseTheme(spec: {
        [selector: string]: StyleSpec;
    }): Extension$5;
    /**
    Facet that provides additional DOM attributes for the editor's
    editable DOM element.
    */
    static contentAttributes: Facet$5<AttrSource$3, readonly AttrSource$3[]>;
    /**
    Facet that provides DOM attributes for the editor's outer
    element.
    */
    static editorAttributes: Facet$5<AttrSource$3, readonly AttrSource$3[]>;
    /**
    An extension that enables line wrapping in the editor (by
    setting CSS `white-space` to `pre-wrap` in the content).
    */
    static lineWrapping: Extension$5;
    /**
    State effect used to include screen reader announcements in a
    transaction. These will be added to the DOM in a visually hidden
    element with `aria-live="polite"` set, and should be used to
    describe effects that are visually obvious but may not be
    noticed by screen reader users (such as moving to the next
    search match).
    */
    static announce: StateEffectType$5<string>;
    /**
    Retrieve an editor view instance from the view's DOM
    representation.
    */
    static findFromDOM(dom: HTMLElement): EditorView$3 | null;
}
/**
Helper type that maps event names to event object types, or the
`any` type for unknown events.
*/
interface DOMEventMap$3 extends HTMLElementEventMap {
    [other: string]: any;
}
/**
Event handlers are specified with objects like this. For event
types known by TypeScript, this will infer the event argument type
to hold the appropriate event object type. For unknown events, it
is inferred to `any`, and should be explicitly set if you want type
checking.
*/
declare type DOMEventHandlers$3<This> = {
    [event in keyof DOMEventMap$3]?: (this: This, event: DOMEventMap$3[event], view: EditorView$3) => boolean | void;
};

/**
Key bindings associate key names with
[command](https://codemirror.net/6/docs/ref/#view.Command)-style functions.

Key names may be strings like `"Shift-Ctrl-Enter"`—a key identifier
prefixed with zero or more modifiers. Key identifiers are based on
the strings that can appear in
[`KeyEvent.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).
Use lowercase letters to refer to letter keys (or uppercase letters
if you want shift to be held). You may use `"Space"` as an alias
for the `" "` name.

Modifiers can be given in any order. `Shift-` (or `s-`), `Alt-` (or
`a-`), `Ctrl-` (or `c-` or `Control-`) and `Cmd-` (or `m-` or
`Meta-`) are recognized.

When a key binding contains multiple key names separated by
spaces, it represents a multi-stroke binding, which will fire when
the user presses the given keys after each other.

You can use `Mod-` as a shorthand for `Cmd-` on Mac and `Ctrl-` on
other platforms. So `Mod-b` is `Ctrl-b` on Linux but `Cmd-b` on
macOS.
*/
interface KeyBinding$2 {
    /**
    The key name to use for this binding. If the platform-specific
    property (`mac`, `win`, or `linux`) for the current platform is
    used as well in the binding, that one takes precedence. If `key`
    isn't defined and the platform-specific binding isn't either,
    a binding is ignored.
    */
    key?: string;
    /**
    Key to use specifically on macOS.
    */
    mac?: string;
    /**
    Key to use specifically on Windows.
    */
    win?: string;
    /**
    Key to use specifically on Linux.
    */
    linux?: string;
    /**
    The command to execute when this binding is triggered. When the
    command function returns `false`, further bindings will be tried
    for the key.
    */
    run?: Command$2;
    /**
    When given, this defines a second binding, using the (possibly
    platform-specific) key name prefixed with `Shift-` to activate
    this command.
    */
    shift?: Command$2;
    /**
    When this property is present, the function is called for every
    key that is not a multi-stroke prefix.
    */
    any?: (view: EditorView$3, event: KeyboardEvent) => boolean;
    /**
    By default, key bindings apply when focus is on the editor
    content (the `"editor"` scope). Some extensions, mostly those
    that define their own panels, might want to allow you to
    register bindings local to that panel. Such bindings should use
    a custom scope name. You may also assign multiple scope names to
    a binding, separating them by spaces.
    */
    scope?: string;
    /**
    When set to true (the default is false), this will always
    prevent the further handling for the bound key, even if the
    command(s) return false. This can be useful for cases where the
    native behavior of the key is annoying or irrelevant but the
    command doesn't always apply (such as, Mod-u for undo selection,
    which would cause the browser to view source instead when no
    selection can be undone).
    */
    preventDefault?: boolean;
}
/**
Facet used for registering keymaps.

You can add multiple keymaps to an editor. Their priorities
determine their precedence (the ones specified early or with high
priority get checked first). When a handler has returned `true`
for a given key, no further handlers are called.
*/
declare const keymap: Facet$5<readonly KeyBinding$2[], readonly (readonly KeyBinding$2[])[]>;

declare type SelectionConfig = {
    /**
    The length of a full cursor blink cycle, in milliseconds.
    Defaults to 1200. Can be set to 0 to disable blinking.
    */
    cursorBlinkRate?: number;
    /**
    Whether to show a cursor for non-empty ranges. Defaults to
    true.
    */
    drawRangeCursor?: boolean;
};
/**
Returns an extension that hides the browser's native selection and
cursor, replacing the selection with a background behind the text
(with the `cm-selectionBackground` class), and the
cursors with elements overlaid over the code (using
`cm-cursor-primary` and `cm-cursor-secondary`).

This allows the editor to display secondary selection ranges, and
tends to produce a type of selection more in line with that users
expect in a text editor (the native selection styling will often
leave gaps between lines and won't fill the horizontal space after
a line when the selection continues past it).

It does have a performance cost, in that it requires an extra DOM
layout cycle for many updates (the selection is drawn based on DOM
layout information that's only available after laying out the
content).
*/
declare function drawSelection(config?: SelectionConfig): Extension$5;

interface SpecialCharConfig {
    /**
    An optional function that renders the placeholder elements.
    
    The `description` argument will be text that clarifies what the
    character is, which should be provided to screen readers (for
    example with the
    [`aria-label`](https://www.w3.org/TR/wai-aria/#aria-label)
    attribute) and optionally shown to the user in other ways (such
    as the
    [`title`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/title)
    attribute).
    
    The given placeholder string is a suggestion for how to display
    the character visually.
    */
    render?: ((code: number, description: string | null, placeholder: string) => HTMLElement) | null;
    /**
    Regular expression that matches the special characters to
    highlight. Must have its 'g'/global flag set.
    */
    specialChars?: RegExp;
    /**
    Regular expression that can be used to add characters to the
    default set of characters to highlight.
    */
    addSpecialChars?: RegExp | null;
}
/**
Returns an extension that installs highlighting of special
characters.
*/
declare function highlightSpecialChars(
/**
Configuration options.
*/
config?: SpecialCharConfig): Extension$5;

/**
Extension that enables a placeholder—a piece of example content
to show when the editor is empty.
*/
declare function placeholder(content: string | HTMLElement): Extension$5;

/**
Create an extension that enables rectangular selections. By
default, it will react to left mouse drag with the Alt key held
down. When such a selection occurs, the text within the rectangle
that was dragged over will be selected, as one selection
[range](https://codemirror.net/6/docs/ref/#state.SelectionRange) per line.
*/
declare function rectangularSelection(options?: {
    /**
    A custom predicate function, which takes a `mousedown` event and
    returns true if it should be used for rectangular selection.
    */
    eventFilter?: (event: MouseEvent) => boolean;
}): Extension$5;
declare type Handlers = {
    [event: string]: (view: EditorView$3, line: BlockInfo$3, event: Event) => boolean;
};
interface LineNumberConfig {
    /**
    How to display line numbers. Defaults to simply converting them
    to string.
    */
    formatNumber?: (lineNo: number, state: EditorState$5) => string;
    /**
    Supply event handlers for DOM events on this gutter.
    */
    domEventHandlers?: Handlers;
}
/**
Create a line number gutter extension.
*/
declare function lineNumbers(config?: LineNumberConfig): Extension$5;

/**
A text iterator iterates over a sequence of strings. When
iterating over a [`Text`](https://codemirror.net/6/docs/ref/#state.Text) document, result values will
either be lines or line breaks.
*/
interface TextIterator$3 extends Iterator<string>, Iterable<string> {
    /**
    Retrieve the next string. Optionally skip a given number of
    positions after the current position. Always returns the object
    itself.
    */
    next(skip?: number): this;
    /**
    The current string. Will be the empty string when the cursor is
    at its end or `next` hasn't been called on it yet.
    */
    value: string;
    /**
    Whether the end of the iteration has been reached. You should
    probably check this right after calling `next`.
    */
    done: boolean;
    /**
    Whether the current string represents a line break.
    */
    lineBreak: boolean;
}
/**
The data structure for documents. @nonabstract
*/
declare abstract class Text$3 implements Iterable<string> {
    /**
    The length of the string.
    */
    abstract readonly length: number;
    /**
    The number of lines in the string (always >= 1).
    */
    abstract readonly lines: number;
    /**
    Get the line description around the given position.
    */
    lineAt(pos: number): Line$4;
    /**
    Get the description for the given (1-based) line number.
    */
    line(n: number): Line$4;
    /**
    Replace a range of the text with the given content.
    */
    replace(from: number, to: number, text: Text$3): Text$3;
    /**
    Append another document to this one.
    */
    append(other: Text$3): Text$3;
    /**
    Retrieve the text between the given points.
    */
    slice(from: number, to?: number): Text$3;
    /**
    Retrieve a part of the document as a string
    */
    abstract sliceString(from: number, to?: number, lineSep?: string): string;
    /**
    Test whether this text is equal to another instance.
    */
    eq(other: Text$3): boolean;
    /**
    Iterate over the text. When `dir` is `-1`, iteration happens
    from end to start. This will return lines and the breaks between
    them as separate strings.
    */
    iter(dir?: 1 | -1): TextIterator$3;
    /**
    Iterate over a range of the text. When `from` > `to`, the
    iterator will run in reverse.
    */
    iterRange(from: number, to?: number): TextIterator$3;
    /**
    Return a cursor that iterates over the given range of lines,
    _without_ returning the line breaks between, and yielding empty
    strings for empty lines.
    
    When `from` and `to` are given, they should be 1-based line numbers.
    */
    iterLines(from?: number, to?: number): TextIterator$3;
    /**
    Convert the document to an array of lines (which can be
    deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#state.Text^of)).
    */
    toJSON(): string[];
    /**
    If this is a branch node, `children` will hold the `Text`
    objects that it is made up of. For leaf nodes, this holds null.
    */
    abstract readonly children: readonly Text$3[] | null;
    [Symbol.iterator]: () => Iterator<string>;
    /**
    Create a `Text` instance for the given array of lines.
    */
    static of(text: readonly string[]): Text$3;
    /**
    The empty document.
    */
    static empty: Text$3;
}
/**
This type describes a line in the document. It is created
on-demand when lines are [queried](https://codemirror.net/6/docs/ref/#state.Text.lineAt).
*/
declare class Line$4 {
    /**
    The position of the start of the line.
    */
    readonly from: number;
    /**
    The position at the end of the line (_before_ the line break,
    or at the end of document for the last line).
    */
    readonly to: number;
    /**
    This line's line number (1-based).
    */
    readonly number: number;
    /**
    The line's content.
    */
    readonly text: string;
    /**
    The length of the line (not including any line break after it).
    */
    get length(): number;
}

/**
Distinguishes different ways in which positions can be mapped.
*/
declare enum MapMode$3 {
    /**
    Map a position to a valid new position, even when its context
    was deleted.
    */
    Simple = 0,
    /**
    Return null if deletion happens across the position.
    */
    TrackDel = 1,
    /**
    Return null if the character _before_ the position is deleted.
    */
    TrackBefore = 2,
    /**
    Return null if the character _after_ the position is deleted.
    */
    TrackAfter = 3
}
/**
A change description is a variant of [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet)
that doesn't store the inserted text. As such, it can't be
applied, but is cheaper to store and manipulate.
*/
declare class ChangeDesc$3 {
    /**
    The length of the document before the change.
    */
    get length(): number;
    /**
    The length of the document after the change.
    */
    get newLength(): number;
    /**
    False when there are actual changes in this set.
    */
    get empty(): boolean;
    /**
    Iterate over the unchanged parts left by these changes. `posA`
    provides the position of the range in the old document, `posB`
    the new position in the changed document.
    */
    iterGaps(f: (posA: number, posB: number, length: number) => void): void;
    /**
    Iterate over the ranges changed by these changes. (See
    [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
    variant that also provides you with the inserted text.)
    `fromA`/`toA` provides the extent of the change in the starting
    document, `fromB`/`toB` the extent of the replacement in the
    changed document.
    
    When `individual` is true, adjacent changes (which are kept
    separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
    reported separately.
    */
    iterChangedRanges(f: (fromA: number, toA: number, fromB: number, toB: number) => void, individual?: boolean): void;
    /**
    Get a description of the inverted form of these changes.
    */
    get invertedDesc(): ChangeDesc$3;
    /**
    Compute the combined effect of applying another set of changes
    after this one. The length of the document after this set should
    match the length before `other`.
    */
    composeDesc(other: ChangeDesc$3): ChangeDesc$3;
    /**
    Map this description, which should start with the same document
    as `other`, over another set of changes, so that it can be
    applied after it. When `before` is true, map as if the changes
    in `other` happened before the ones in `this`.
    */
    mapDesc(other: ChangeDesc$3, before?: boolean): ChangeDesc$3;
    /**
    Map a given position through these changes, to produce a
    position pointing into the new document.
    
    `assoc` indicates which side the position should be associated
    with. When it is negative or zero, the mapping will try to keep
    the position close to the character before it (if any), and will
    move it before insertions at that point or replacements across
    that point. When it is positive, the position is associated with
    the character after it, and will be moved forward for insertions
    at or replacements across the position. Defaults to -1.
    
    `mode` determines whether deletions should be
    [reported](https://codemirror.net/6/docs/ref/#state.MapMode). It defaults to
    [`MapMode.Simple`](https://codemirror.net/6/docs/ref/#state.MapMode.Simple) (don't report
    deletions).
    */
    mapPos(pos: number, assoc?: number): number;
    mapPos(pos: number, assoc: number, mode: MapMode$3): number | null;
    /**
    Check whether these changes touch a given range. When one of the
    changes entirely covers the range, the string `"cover"` is
    returned.
    */
    touchesRange(from: number, to?: number): boolean | "cover";
    /**
    Serialize this change desc to a JSON-representable value.
    */
    toJSON(): readonly number[];
    /**
    Create a change desc from its JSON representation (as produced
    by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
    */
    static fromJSON(json: any): ChangeDesc$3;
}
/**
This type is used as argument to
[`EditorState.changes`](https://codemirror.net/6/docs/ref/#state.EditorState.changes) and in the
[`changes` field](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) of transaction
specs to succinctly describe document changes. It may either be a
plain object describing a change (a deletion, insertion, or
replacement, depending on which fields are present), a [change
set](https://codemirror.net/6/docs/ref/#state.ChangeSet), or an array of change specs.
*/
declare type ChangeSpec$3 = {
    from: number;
    to?: number;
    insert?: string | Text$3;
} | ChangeSet$3 | readonly ChangeSpec$3[];
/**
A change set represents a group of modifications to a document. It
stores the document length, and can only be applied to documents
with exactly that length.
*/
declare class ChangeSet$3 extends ChangeDesc$3 {
    private constructor();
    /**
    Apply the changes to a document, returning the modified
    document.
    */
    apply(doc: Text$3): Text$3;
    mapDesc(other: ChangeDesc$3, before?: boolean): ChangeDesc$3;
    /**
    Given the document as it existed _before_ the changes, return a
    change set that represents the inverse of this set, which could
    be used to go from the document created by the changes back to
    the document as it existed before the changes.
    */
    invert(doc: Text$3): ChangeSet$3;
    /**
    Combine two subsequent change sets into a single set. `other`
    must start in the document produced by `this`. If `this` goes
    `docA` → `docB` and `other` represents `docB` → `docC`, the
    returned value will represent the change `docA` → `docC`.
    */
    compose(other: ChangeSet$3): ChangeSet$3;
    /**
    Given another change set starting in the same document, maps this
    change set over the other, producing a new change set that can be
    applied to the document produced by applying `other`. When
    `before` is `true`, order changes as if `this` comes before
    `other`, otherwise (the default) treat `other` as coming first.
    
    Given two changes `A` and `B`, `A.compose(B.map(A))` and
    `B.compose(A.map(B, true))` will produce the same document. This
    provides a basic form of [operational
    transformation](https://en.wikipedia.org/wiki/Operational_transformation),
    and can be used for collaborative editing.
    */
    map(other: ChangeDesc$3, before?: boolean): ChangeSet$3;
    /**
    Iterate over the changed ranges in the document, calling `f` for
    each, with the range in the original document (`fromA`-`toA`)
    and the range that replaces it in the new document
    (`fromB`-`toB`).
    
    When `individual` is true, adjacent changes are reported
    separately.
    */
    iterChanges(f: (fromA: number, toA: number, fromB: number, toB: number, inserted: Text$3) => void, individual?: boolean): void;
    /**
    Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
    set.
    */
    get desc(): ChangeDesc$3;
    /**
    Serialize this change set to a JSON-representable value.
    */
    toJSON(): any;
    /**
    Create a change set for the given changes, for a document of the
    given length, using `lineSep` as line separator.
    */
    static of(changes: ChangeSpec$3, length: number, lineSep?: string): ChangeSet$3;
    /**
    Create an empty changeset of the given length.
    */
    static empty(length: number): ChangeSet$3;
    /**
    Create a changeset from its JSON representation (as produced by
    [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
    */
    static fromJSON(json: any): ChangeSet$3;
}

/**
A single selection range. When
[`allowMultipleSelections`](https://codemirror.net/6/docs/ref/#state.EditorState^allowMultipleSelections)
is enabled, a [selection](https://codemirror.net/6/docs/ref/#state.EditorSelection) may hold
multiple ranges. By default, selections hold exactly one range.
*/
declare class SelectionRange$3 {
    /**
    The lower boundary of the range.
    */
    readonly from: number;
    /**
    The upper boundary of the range.
    */
    readonly to: number;
    private flags;
    private constructor();
    /**
    The anchor of the range—the side that doesn't move when you
    extend it.
    */
    get anchor(): number;
    /**
    The head of the range, which is moved when the range is
    [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
    */
    get head(): number;
    /**
    True when `anchor` and `head` are at the same position.
    */
    get empty(): boolean;
    /**
    If this is a cursor that is explicitly associated with the
    character on one of its sides, this returns the side. -1 means
    the character before its position, 1 the character after, and 0
    means no association.
    */
    get assoc(): -1 | 0 | 1;
    /**
    The bidirectional text level associated with this cursor, if
    any.
    */
    get bidiLevel(): number | null;
    /**
    The goal column (stored vertical offset) associated with a
    cursor. This is used to preserve the vertical position when
    [moving](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) across
    lines of different length.
    */
    get goalColumn(): number | undefined;
    /**
    Map this range through a change, producing a valid range in the
    updated document.
    */
    map(change: ChangeDesc$3, assoc?: number): SelectionRange$3;
    /**
    Extend this range to cover at least `from` to `to`.
    */
    extend(from: number, to?: number): SelectionRange$3;
    /**
    Compare this range to another range.
    */
    eq(other: SelectionRange$3): boolean;
    /**
    Return a JSON-serializable object representing the range.
    */
    toJSON(): any;
    /**
    Convert a JSON representation of a range to a `SelectionRange`
    instance.
    */
    static fromJSON(json: any): SelectionRange$3;
}
/**
An editor selection holds one or more selection ranges.
*/
declare class EditorSelection$3 {
    /**
    The ranges in the selection, sorted by position. Ranges cannot
    overlap (but they may touch, if they aren't empty).
    */
    readonly ranges: readonly SelectionRange$3[];
    /**
    The index of the _main_ range in the selection (which is
    usually the range that was added last).
    */
    readonly mainIndex: number;
    private constructor();
    /**
    Map a selection through a change. Used to adjust the selection
    position for changes.
    */
    map(change: ChangeDesc$3, assoc?: number): EditorSelection$3;
    /**
    Compare this selection to another selection.
    */
    eq(other: EditorSelection$3): boolean;
    /**
    Get the primary selection range. Usually, you should make sure
    your code applies to _all_ ranges, by using methods like
    [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
    */
    get main(): SelectionRange$3;
    /**
    Make sure the selection only has one range. Returns a selection
    holding only the main range from this selection.
    */
    asSingle(): EditorSelection$3;
    /**
    Extend this selection with an extra range.
    */
    addRange(range: SelectionRange$3, main?: boolean): EditorSelection$3;
    /**
    Replace a given range with another range, and then normalize the
    selection to merge and sort ranges if necessary.
    */
    replaceRange(range: SelectionRange$3, which?: number): EditorSelection$3;
    /**
    Convert this selection to an object that can be serialized to
    JSON.
    */
    toJSON(): any;
    /**
    Create a selection from a JSON representation.
    */
    static fromJSON(json: any): EditorSelection$3;
    /**
    Create a selection holding a single range.
    */
    static single(anchor: number, head?: number): EditorSelection$3;
    /**
    Sort and merge the given set of ranges, creating a valid
    selection.
    */
    static create(ranges: readonly SelectionRange$3[], mainIndex?: number): EditorSelection$3;
    /**
    Create a cursor selection range at the given position. You can
    safely ignore the optional arguments in most situations.
    */
    static cursor(pos: number, assoc?: number, bidiLevel?: number, goalColumn?: number): SelectionRange$3;
    /**
    Create a selection range.
    */
    static range(anchor: number, head: number, goalColumn?: number): SelectionRange$3;
}

declare type FacetConfig$3<Input, Output> = {
    /**
    How to combine the input values into a single output value. When
    not given, the array of input values becomes the output. This
    function will immediately be called on creating the facet, with
    an empty array, to compute the facet's default value when no
    inputs are present.
    */
    combine?: (value: readonly Input[]) => Output;
    /**
    How to compare output values to determine whether the value of
    the facet changed. Defaults to comparing by `===` or, if no
    `combine` function was given, comparing each element of the
    array with `===`.
    */
    compare?: (a: Output, b: Output) => boolean;
    /**
    How to compare input values to avoid recomputing the output
    value when no inputs changed. Defaults to comparing with `===`.
    */
    compareInput?: (a: Input, b: Input) => boolean;
    /**
    Forbids dynamic inputs to this facet.
    */
    static?: boolean;
    /**
    If given, these extension(s) (or the result of calling the given
    function with the facet) will be added to any state where this
    facet is provided. (Note that, while a facet's default value can
    be read from a state even if the facet wasn't present in the
    state at all, these extensions won't be added in that
    situation.)
    */
    enables?: Extension$3 | ((self: Facet$3<Input, Output>) => Extension$3);
};
/**
A facet is a labeled value that is associated with an editor
state. It takes inputs from any number of extensions, and combines
those into a single output value.

Examples of uses of facets are the [tab
size](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize), [editor
attributes](https://codemirror.net/6/docs/ref/#view.EditorView^editorAttributes), and [update
listeners](https://codemirror.net/6/docs/ref/#view.EditorView^updateListener).
*/
declare class Facet$3<Input, Output = readonly Input[]> {
    private isStatic;
    private constructor();
    /**
    Define a new facet.
    */
    static define<Input, Output = readonly Input[]>(config?: FacetConfig$3<Input, Output>): Facet$3<Input, Output>;
    /**
    Returns an extension that adds the given value to this facet.
    */
    of(value: Input): Extension$3;
    /**
    Create an extension that computes a value for the facet from a
    state. You must take care to declare the parts of the state that
    this value depends on, since your function is only called again
    for a new state when one of those parts changed.
    
    In cases where your value depends only on a single field, you'll
    want to use the [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method instead.
    */
    compute(deps: readonly Slot$3<any>[], get: (state: EditorState$3) => Input): Extension$3;
    /**
    Create an extension that computes zero or more values for this
    facet from a state.
    */
    computeN(deps: readonly Slot$3<any>[], get: (state: EditorState$3) => readonly Input[]): Extension$3;
    /**
    Shorthand method for registering a facet source with a state
    field as input. If the field's type corresponds to this facet's
    input type, the getter function can be omitted. If given, it
    will be used to retrieve the input from the field value.
    */
    from<T extends Input>(field: StateField$3<T>): Extension$3;
    from<T>(field: StateField$3<T>, get: (value: T) => Input): Extension$3;
}
declare type Slot$3<T> = Facet$3<any, T> | StateField$3<T> | "doc" | "selection";
declare type StateFieldSpec$3<Value> = {
    /**
    Creates the initial value for the field when a state is created.
    */
    create: (state: EditorState$3) => Value;
    /**
    Compute a new value from the field's previous value and a
    [transaction](https://codemirror.net/6/docs/ref/#state.Transaction).
    */
    update: (value: Value, transaction: Transaction$3) => Value;
    /**
    Compare two values of the field, returning `true` when they are
    the same. This is used to avoid recomputing facets that depend
    on the field when its value did not change. Defaults to using
    `===`.
    */
    compare?: (a: Value, b: Value) => boolean;
    /**
    Provide extensions based on this field. The given function will
    be called once with the initialized field. It will usually want
    to call some facet's [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method to
    create facet inputs from this field, but can also return other
    extensions that should be enabled when the field is present in a
    configuration.
    */
    provide?: (field: StateField$3<Value>) => Extension$3;
    /**
    A function used to serialize this field's content to JSON. Only
    necessary when this field is included in the argument to
    [`EditorState.toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON).
    */
    toJSON?: (value: Value, state: EditorState$3) => any;
    /**
    A function that deserializes the JSON representation of this
    field's content.
    */
    fromJSON?: (json: any, state: EditorState$3) => Value;
};
/**
Fields can store additional information in an editor state, and
keep it in sync with the rest of the state.
*/
declare class StateField$3<Value> {
    private createF;
    private updateF;
    private compareF;
    private constructor();
    /**
    Define a state field.
    */
    static define<Value>(config: StateFieldSpec$3<Value>): StateField$3<Value>;
    private create;
    /**
    Returns an extension that enables this field and overrides the
    way it is initialized. Can be useful when you need to provide a
    non-default starting value for the field.
    */
    init(create: (state: EditorState$3) => Value): Extension$3;
    /**
    State field instances can be used as
    [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
    given state.
    */
    get extension(): Extension$3;
}
/**
Extension values can be
[provided](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions) when creating a
state to attach various kinds of configuration and behavior
information. They can either be built-in extension-providing
objects, such as [state fields](https://codemirror.net/6/docs/ref/#state.StateField) or [facet
providers](https://codemirror.net/6/docs/ref/#state.Facet.of), or objects with an extension in its
`extension` property. Extensions can be nested in arrays
arbitrarily deep—they will be flattened when processed.
*/
declare type Extension$3 = {
    extension: Extension$3;
} | readonly Extension$3[];

/**
Annotations are tagged values that are used to add metadata to
transactions in an extensible way. They should be used to model
things that effect the entire transaction (such as its [time
stamp](https://codemirror.net/6/docs/ref/#state.Transaction^time) or information about its
[origin](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent)). For effects that happen
_alongside_ the other changes made by the transaction, [state
effects](https://codemirror.net/6/docs/ref/#state.StateEffect) are more appropriate.
*/
declare class Annotation$3<T> {
    /**
    The annotation type.
    */
    readonly type: AnnotationType$3<T>;
    /**
    The value of this annotation.
    */
    readonly value: T;
    /**
    Define a new type of annotation.
    */
    static define<T>(): AnnotationType$3<T>;
    private _isAnnotation;
}
/**
Marker that identifies a type of [annotation](https://codemirror.net/6/docs/ref/#state.Annotation).
*/
declare class AnnotationType$3<T> {
    /**
    Create an instance of this annotation.
    */
    of(value: T): Annotation$3<T>;
}
interface StateEffectSpec$3<Value> {
    /**
    Provides a way to map an effect like this through a position
    mapping. When not given, the effects will simply not be mapped.
    When the function returns `undefined`, that means the mapping
    deletes the effect.
    */
    map?: (value: Value, mapping: ChangeDesc$3) => Value | undefined;
}
/**
Representation of a type of state effect. Defined with
[`StateEffect.define`](https://codemirror.net/6/docs/ref/#state.StateEffect^define).
*/
declare class StateEffectType$3<Value> {
    /**
    @internal
    */
    readonly map: (value: any, mapping: ChangeDesc$3) => any | undefined;
    /**
    Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
    type.
    */
    of(value: Value): StateEffect$3<Value>;
}
/**
State effects can be used to represent additional effects
associated with a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction.effects). They
are often useful to model changes to custom [state
fields](https://codemirror.net/6/docs/ref/#state.StateField), when those changes aren't implicit in
document or selection changes.
*/
declare class StateEffect$3<Value> {
    /**
    The value of this effect.
    */
    readonly value: Value;
    /**
    Map this effect through a position mapping. Will return
    `undefined` when that ends up deleting the effect.
    */
    map(mapping: ChangeDesc$3): StateEffect$3<Value> | undefined;
    /**
    Tells you whether this effect object is of a given
    [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
    */
    is<T>(type: StateEffectType$3<T>): this is StateEffect$3<T>;
    /**
    Define a new effect type. The type parameter indicates the type
    of values that his effect holds.
    */
    static define<Value = null>(spec?: StateEffectSpec$3<Value>): StateEffectType$3<Value>;
    /**
    Map an array of effects through a change set.
    */
    static mapEffects(effects: readonly StateEffect$3<any>[], mapping: ChangeDesc$3): readonly StateEffect$3<any>[];
    /**
    This effect can be used to reconfigure the root extensions of
    the editor. Doing this will discard any extensions
    [appended](https://codemirror.net/6/docs/ref/#state.StateEffect^appendConfig), but does not reset
    the content of [reconfigured](https://codemirror.net/6/docs/ref/#state.Compartment.reconfigure)
    compartments.
    */
    static reconfigure: StateEffectType$3<Extension$3>;
    /**
    Append extensions to the top-level configuration of the editor.
    */
    static appendConfig: StateEffectType$3<Extension$3>;
}
/**
Describes a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) when calling the
[`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update) method.
*/
interface TransactionSpec$3 {
    /**
    The changes to the document made by this transaction.
    */
    changes?: ChangeSpec$3;
    /**
    When set, this transaction explicitly updates the selection.
    Offsets in this selection should refer to the document as it is
    _after_ the transaction.
    */
    selection?: EditorSelection$3 | {
        anchor: number;
        head?: number;
    };
    /**
    Attach [state effects](https://codemirror.net/6/docs/ref/#state.StateEffect) to this transaction.
    Again, when they contain positions and this same spec makes
    changes, those positions should refer to positions in the
    updated document.
    */
    effects?: StateEffect$3<any> | readonly StateEffect$3<any>[];
    /**
    Set [annotations](https://codemirror.net/6/docs/ref/#state.Annotation) for this transaction.
    */
    annotations?: Annotation$3<any> | readonly Annotation$3<any>[];
    /**
    Shorthand for `annotations:` [`Transaction.userEvent`](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent)`.of(...)`.
    */
    userEvent?: string;
    /**
    When set to `true`, the transaction is marked as needing to
    scroll the current selection into view.
    */
    scrollIntoView?: boolean;
    /**
    By default, transactions can be modified by [change
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^changeFilter) and [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter). You can set this
    to `false` to disable that. This can be necessary for
    transactions that, for example, include annotations that must be
    kept consistent with their changes.
    */
    filter?: boolean;
    /**
    Normally, when multiple specs are combined (for example by
    [`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update)), the
    positions in `changes` are taken to refer to the document
    positions in the initial document. When a spec has `sequental`
    set to true, its positions will be taken to refer to the
    document created by the specs before it instead.
    */
    sequential?: boolean;
}
/**
Changes to the editor state are grouped into transactions.
Typically, a user action creates a single transaction, which may
contain any number of document changes, may change the selection,
or have other effects. Create a transaction by calling
[`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update), or immediately
dispatch one by calling
[`EditorView.dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch).
*/
declare class Transaction$3 {
    /**
    The state from which the transaction starts.
    */
    readonly startState: EditorState$3;
    /**
    The document changes made by this transaction.
    */
    readonly changes: ChangeSet$3;
    /**
    The selection set by this transaction, or undefined if it
    doesn't explicitly set a selection.
    */
    readonly selection: EditorSelection$3 | undefined;
    /**
    The effects added to the transaction.
    */
    readonly effects: readonly StateEffect$3<any>[];
    /**
    Whether the selection should be scrolled into view after this
    transaction is dispatched.
    */
    readonly scrollIntoView: boolean;
    private constructor();
    /**
    The new document produced by the transaction. Contrary to
    [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
    force the entire new state to be computed right away, so it is
    recommended that [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
    when they need to look at the new document.
    */
    get newDoc(): Text$3;
    /**
    The new selection produced by the transaction. If
    [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
    this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
    current selection through the changes made by the transaction.
    */
    get newSelection(): EditorSelection$3;
    /**
    The new state created by the transaction. Computed on demand
    (but retained for subsequent access), so it is recommended not to
    access it in [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
    */
    get state(): EditorState$3;
    /**
    Get the value of the given annotation type, if any.
    */
    annotation<T>(type: AnnotationType$3<T>): T | undefined;
    /**
    Indicates whether the transaction changed the document.
    */
    get docChanged(): boolean;
    /**
    Indicates whether this transaction reconfigures the state
    (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
    with a top-level configuration
    [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
    */
    get reconfigured(): boolean;
    /**
    Returns true if the transaction has a [user
    event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
    or more specific than `event`. For example, if the transaction
    has `"select.pointer"` as user event, `"select"` and
    `"select.pointer"` will match it.
    */
    isUserEvent(event: string): boolean;
    /**
    Annotation used to store transaction timestamps. Automatically
    added to every transaction, holding `Date.now()`.
    */
    static time: AnnotationType$3<number>;
    /**
    Annotation used to associate a transaction with a user interface
    event. Holds a string identifying the event, using a
    dot-separated format to support attaching more specific
    information. The events used by the core libraries are:
    
     - `"input"` when content is entered
       - `"input.type"` for typed input
         - `"input.type.compose"` for composition
       - `"input.paste"` for pasted input
       - `"input.drop"` when adding content with drag-and-drop
       - `"input.complete"` when autocompleting
     - `"delete"` when the user deletes content
       - `"delete.selection"` when deleting the selection
       - `"delete.forward"` when deleting forward from the selection
       - `"delete.backward"` when deleting backward from the selection
       - `"delete.cut"` when cutting to the clipboard
     - `"move"` when content is moved
       - `"move.drop"` when content is moved within the editor through drag-and-drop
     - `"select"` when explicitly changing the selection
       - `"select.pointer"` when selecting with a mouse or other pointing device
     - `"undo"` and `"redo"` for history actions
    
    Use [`isUserEvent`](https://codemirror.net/6/docs/ref/#state.Transaction.isUserEvent) to check
    whether the annotation matches a given event.
    */
    static userEvent: AnnotationType$3<string>;
    /**
    Annotation indicating whether a transaction should be added to
    the undo history or not.
    */
    static addToHistory: AnnotationType$3<boolean>;
    /**
    Annotation indicating (when present and true) that a transaction
    represents a change made by some other actor, not the user. This
    is used, for example, to tag other people's changes in
    collaborative editing.
    */
    static remote: AnnotationType$3<boolean>;
}

/**
The categories produced by a [character
categorizer](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer). These are used
do things like selecting by word.
*/
declare enum CharCategory$3 {
    /**
    Word characters.
    */
    Word = 0,
    /**
    Whitespace.
    */
    Space = 1,
    /**
    Anything else.
    */
    Other = 2
}

/**
Options passed when [creating](https://codemirror.net/6/docs/ref/#state.EditorState^create) an
editor state.
*/
interface EditorStateConfig$3 {
    /**
    The initial document. Defaults to an empty document. Can be
    provided either as a plain string (which will be split into
    lines according to the value of the [`lineSeparator`
    facet](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)), or an instance of
    the [`Text`](https://codemirror.net/6/docs/ref/#state.Text) class (which is what the state will use
    to represent the document).
    */
    doc?: string | Text$3;
    /**
    The starting selection. Defaults to a cursor at the very start
    of the document.
    */
    selection?: EditorSelection$3 | {
        anchor: number;
        head?: number;
    };
    /**
    [Extension(s)](https://codemirror.net/6/docs/ref/#state.Extension) to associate with this state.
    */
    extensions?: Extension$3;
}
/**
The editor state class is a persistent (immutable) data structure.
To update a state, you [create](https://codemirror.net/6/docs/ref/#state.EditorState.update) a
[transaction](https://codemirror.net/6/docs/ref/#state.Transaction), which produces a _new_ state
instance, without modifying the original object.

As such, _never_ mutate properties of a state directly. That'll
just break things.
*/
declare class EditorState$3 {
    /**
    The current document.
    */
    readonly doc: Text$3;
    /**
    The current selection.
    */
    readonly selection: EditorSelection$3;
    private constructor();
    /**
    Retrieve the value of a [state field](https://codemirror.net/6/docs/ref/#state.StateField). Throws
    an error when the state doesn't have that field, unless you pass
    `false` as second parameter.
    */
    field<T>(field: StateField$3<T>): T;
    field<T>(field: StateField$3<T>, require: false): T | undefined;
    /**
    Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
    state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
    can be passed. Unless
    [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
    [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
    are assumed to start in the _current_ document (not the document
    produced by previous specs), and its
    [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
    [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
    to the document created by its _own_ changes. The resulting
    transaction contains the combined effect of all the different
    specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
    specs take precedence over earlier ones.
    */
    update(...specs: readonly TransactionSpec$3[]): Transaction$3;
    /**
    Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
    replaces every selection range with the given content.
    */
    replaceSelection(text: string | Text$3): TransactionSpec$3;
    /**
    Create a set of changes and a new selection by running the given
    function for each range in the active selection. The function
    can return an optional set of changes (in the coordinate space
    of the start document), plus an updated range (in the coordinate
    space of the document produced by the call's own changes). This
    method will merge all the changes and ranges into a single
    changeset and selection, and return it as a [transaction
    spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
    [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
    */
    changeByRange(f: (range: SelectionRange$3) => {
        range: SelectionRange$3;
        changes?: ChangeSpec$3;
        effects?: StateEffect$3<any> | readonly StateEffect$3<any>[];
    }): {
        changes: ChangeSet$3;
        selection: EditorSelection$3;
        effects: readonly StateEffect$3<any>[];
    };
    /**
    Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
    description, taking the state's document length and line
    separator into account.
    */
    changes(spec?: ChangeSpec$3): ChangeSet$3;
    /**
    Using the state's [line
    separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
    [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
    */
    toText(string: string): Text$3;
    /**
    Return the given range of the document as a string.
    */
    sliceDoc(from?: number, to?: number): string;
    /**
    Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
    */
    facet<Output>(facet: Facet$3<any, Output>): Output;
    /**
    Convert this state to a JSON-serializable object. When custom
    fields should be serialized, you can pass them in as an object
    mapping property names (in the resulting object, which should
    not use `doc` or `selection`) to fields.
    */
    toJSON(fields?: {
        [prop: string]: StateField$3<any>;
    }): any;
    /**
    Deserialize a state from its JSON representation. When custom
    fields should be deserialized, pass the same object you passed
    to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
    third argument.
    */
    static fromJSON(json: any, config?: EditorStateConfig$3, fields?: {
        [prop: string]: StateField$3<any>;
    }): EditorState$3;
    /**
    Create a new state. You'll usually only need this when
    initializing an editor—updated states are created by applying
    transactions.
    */
    static create(config?: EditorStateConfig$3): EditorState$3;
    /**
    A facet that, when enabled, causes the editor to allow multiple
    ranges to be selected. Be careful though, because by default the
    editor relies on the native DOM selection, which cannot handle
    multiple selections. An extension like
    [`drawSelection`](https://codemirror.net/6/docs/ref/#view.drawSelection) can be used to make
    secondary selections visible to the user.
    */
    static allowMultipleSelections: Facet$3<boolean, boolean>;
    /**
    Configures the tab size to use in this state. The first
    (highest-precedence) value of the facet is used. If no value is
    given, this defaults to 4.
    */
    static tabSize: Facet$3<number, number>;
    /**
    The size (in columns) of a tab in the document, determined by
    the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
    */
    get tabSize(): number;
    /**
    The line separator to use. By default, any of `"\n"`, `"\r\n"`
    and `"\r"` is treated as a separator when splitting lines, and
    lines are joined with `"\n"`.
    
    When you configure a value here, only that precise separator
    will be used, allowing you to round-trip documents through the
    editor without normalizing line separators.
    */
    static lineSeparator: Facet$3<string, string | undefined>;
    /**
    Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
    string for this state.
    */
    get lineBreak(): string;
    /**
    This facet controls the value of the
    [`readOnly`](https://codemirror.net/6/docs/ref/#state.EditorState.readOnly) getter, which is
    consulted by commands and extensions that implement editing
    functionality to determine whether they should apply. It
    defaults to false, but when its highest-precedence value is
    `true`, such functionality disables itself.
    
    Not to be confused with
    [`EditorView.editable`](https://codemirror.net/6/docs/ref/#view.EditorView^editable), which
    controls whether the editor's DOM is set to be editable (and
    thus focusable).
    */
    static readOnly: Facet$3<boolean, boolean>;
    /**
    Returns true when the editor is
    [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
    */
    get readOnly(): boolean;
    /**
    Registers translation phrases. The
    [`phrase`](https://codemirror.net/6/docs/ref/#state.EditorState.phrase) method will look through
    all objects registered with this facet to find translations for
    its argument.
    */
    static phrases: Facet$3<{
        [key: string]: string;
    }, readonly {
        [key: string]: string;
    }[]>;
    /**
    Look up a translation for the given phrase (via the
    [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
    original string if no translation is found.
    
    If additional arguments are passed, they will be inserted in
    place of markers like `$1` (for the first value) and `$2`, etc.
    A single `$` is equivalent to `$1`, and `$$` will produce a
    literal dollar sign.
    */
    phrase(phrase: string, ...insert: any[]): string;
    /**
    A facet used to register [language
    data](https://codemirror.net/6/docs/ref/#state.EditorState.languageDataAt) providers.
    */
    static languageData: Facet$3<(state: EditorState$3, pos: number, side: 0 | 1 | -1) => readonly {
        [name: string]: any;
    }[], readonly ((state: EditorState$3, pos: number, side: 0 | 1 | -1) => readonly {
        [name: string]: any;
    }[])[]>;
    /**
    Find the values for a given language data field, provided by the
    the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
    
    Examples of language data fields are...
    
    - [`"commentTokens"`](https://codemirror.net/6/docs/ref/#commands.CommentTokens) for specifying
      comment syntax.
    - [`"autocomplete"`](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion^config.override)
      for providing language-specific completion sources.
    - [`"wordChars"`](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) for adding
      characters that should be considered part of words in this
      language.
    - [`"closeBrackets"`](https://codemirror.net/6/docs/ref/#autocomplete.CloseBracketConfig) controls
      bracket closing behavior.
    */
    languageDataAt<T>(name: string, pos: number, side?: -1 | 0 | 1): readonly T[];
    /**
    Return a function that can categorize strings (expected to
    represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak))
    into one of:
    
     - Word (contains an alphanumeric character or a character
       explicitly listed in the local language's `"wordChars"`
       language data, which should be a string)
     - Space (contains only whitespace)
     - Other (anything else)
    */
    charCategorizer(at: number): (char: string) => CharCategory$3;
    /**
    Find the word at the given position, meaning the range
    containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
    around it. If no word characters are adjacent to the position,
    this returns null.
    */
    wordAt(pos: number): SelectionRange$3 | null;
    /**
    Facet used to register change filters, which are called for each
    transaction (unless explicitly
    [disabled](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter)), and can suppress
    part of the transaction's changes.
    
    Such a function can return `true` to indicate that it doesn't
    want to do anything, `false` to completely stop the changes in
    the transaction, or a set of ranges in which changes should be
    suppressed. Such ranges are represented as an array of numbers,
    with each pair of two numbers indicating the start and end of a
    range. So for example `[10, 20, 100, 110]` suppresses changes
    between 10 and 20, and between 100 and 110.
    */
    static changeFilter: Facet$3<(tr: Transaction$3) => boolean | readonly number[], readonly ((tr: Transaction$3) => boolean | readonly number[])[]>;
    /**
    Facet used to register a hook that gets a chance to update or
    replace transaction specs before they are applied. This will
    only be applied for transactions that don't have
    [`filter`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter) set to `false`. You
    can either return a single transaction spec (possibly the input
    transaction), or an array of specs (which will be combined in
    the same way as the arguments to
    [`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update)).
    
    When possible, it is recommended to avoid accessing
    [`Transaction.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state) in a filter,
    since it will force creation of a state that will then be
    discarded again, if the transaction is actually filtered.
    
    (This functionality should be used with care. Indiscriminately
    modifying transaction is likely to break something or degrade
    the user experience.)
    */
    static transactionFilter: Facet$3<(tr: Transaction$3) => TransactionSpec$3 | readonly TransactionSpec$3[], readonly ((tr: Transaction$3) => TransactionSpec$3 | readonly TransactionSpec$3[])[]>;
    /**
    This is a more limited form of
    [`transactionFilter`](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter),
    which can only add
    [annotations](https://codemirror.net/6/docs/ref/#state.TransactionSpec.annotations) and
    [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects). _But_, this type
    of filter runs even if the transaction has disabled regular
    [filtering](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter), making it suitable
    for effects that don't need to touch the changes or selection,
    but do want to process every transaction.
    
    Extenders run _after_ filters, when both are present.
    */
    static transactionExtender: Facet$3<(tr: Transaction$3) => Pick<TransactionSpec$3, "effects" | "annotations"> | null, readonly ((tr: Transaction$3) => Pick<TransactionSpec$3, "effects" | "annotations"> | null)[]>;
}

/**
Subtype of [`Command`](https://codemirror.net/6/docs/ref/#view.Command) that doesn't require access
to the actual editor view. Mostly useful to define commands that
can be run and tested outside of a browser environment.
*/
declare type StateCommand$1 = (target: {
    state: EditorState$3;
    dispatch: (transaction: Transaction$3) => void;
}) => boolean;

/**
Each range is associated with a value, which must inherit from
this class.
*/
declare abstract class RangeValue$2 {
    /**
    Compare this value with another value. Used when comparing
    rangesets. The default implementation compares by identity.
    Unless you are only creating a fixed number of unique instances
    of your value type, it is a good idea to implement this
    properly.
    */
    eq(other: RangeValue$2): boolean;
    /**
    The bias value at the start of the range. Determines how the
    range is positioned relative to other ranges starting at this
    position. Defaults to 0.
    */
    startSide: number;
    /**
    The bias value at the end of the range. Defaults to 0.
    */
    endSide: number;
    /**
    The mode with which the location of the range should be mapped
    when its `from` and `to` are the same, to decide whether a
    change deletes the range. Defaults to `MapMode.TrackDel`.
    */
    mapMode: MapMode$3;
    /**
    Determines whether this value marks a point range. Regular
    ranges affect the part of the document they cover, and are
    meaningless when empty. Point ranges have a meaning on their
    own. When non-empty, a point range is treated as atomic and
    shadows any ranges contained in it.
    */
    point: boolean;
    /**
    Create a [range](https://codemirror.net/6/docs/ref/#state.Range) with this value.
    */
    range(from: number, to?: number): Range$2<this>;
}
/**
A range associates a value with a range of positions.
*/
declare class Range$2<T extends RangeValue$2> {
    /**
    The range's start position.
    */
    readonly from: number;
    /**
    Its end position.
    */
    readonly to: number;
    /**
    The value associated with this range.
    */
    readonly value: T;
    private constructor();
}
/**
Collection of methods used when comparing range sets.
*/
interface RangeComparator$2<T extends RangeValue$2> {
    /**
    Notifies the comparator that a range (in positions in the new
    document) has the given sets of values associated with it, which
    are different in the old (A) and new (B) sets.
    */
    compareRange(from: number, to: number, activeA: T[], activeB: T[]): void;
    /**
    Notification for a changed (or inserted, or deleted) point range.
    */
    comparePoint(from: number, to: number, pointA: T | null, pointB: T | null): void;
}
/**
Methods used when iterating over the spans created by a set of
ranges. The entire iterated range will be covered with either
`span` or `point` calls.
*/
interface SpanIterator$2<T extends RangeValue$2> {
    /**
    Called for any ranges not covered by point decorations. `active`
    holds the values that the range is marked with (and may be
    empty). `openStart` indicates how many of those ranges are open
    (continued) at the start of the span.
    */
    span(from: number, to: number, active: readonly T[], openStart: number): void;
    /**
    Called when going over a point decoration. The active range
    decorations that cover the point and have a higher precedence
    are provided in `active`. The open count in `openStart` counts
    the number of those ranges that started before the point and. If
    the point started before the iterated range, `openStart` will be
    `active.length + 1` to signal this.
    */
    point(from: number, to: number, value: T, active: readonly T[], openStart: number, index: number): void;
}
/**
A range cursor is an object that moves to the next range every
time you call `next` on it. Note that, unlike ES6 iterators, these
start out pointing at the first element, so you should call `next`
only after reading the first range (if any).
*/
interface RangeCursor$2<T> {
    /**
    Move the iterator forward.
    */
    next: () => void;
    /**
    The next range's value. Holds `null` when the cursor has reached
    its end.
    */
    value: T | null;
    /**
    The next range's start position.
    */
    from: number;
    /**
    The next end position.
    */
    to: number;
}
declare type RangeSetUpdate$2<T extends RangeValue$2> = {
    /**
    An array of ranges to add. If given, this should be sorted by
    `from` position and `startSide` unless
    [`sort`](https://codemirror.net/6/docs/ref/#state.RangeSet.update^updateSpec.sort) is given as
    `true`.
    */
    add?: readonly Range$2<T>[];
    /**
    Indicates whether the library should sort the ranges in `add`.
    Defaults to `false`.
    */
    sort?: boolean;
    /**
    Filter the ranges already in the set. Only those for which this
    function returns `true` are kept.
    */
    filter?: (from: number, to: number, value: T) => boolean;
    /**
    Can be used to limit the range on which the filter is
    applied. Filtering only a small range, as opposed to the entire
    set, can make updates cheaper.
    */
    filterFrom?: number;
    /**
    The end position to apply the filter to.
    */
    filterTo?: number;
};
/**
A range set stores a collection of [ranges](https://codemirror.net/6/docs/ref/#state.Range) in a
way that makes them efficient to [map](https://codemirror.net/6/docs/ref/#state.RangeSet.map) and
[update](https://codemirror.net/6/docs/ref/#state.RangeSet.update). This is an immutable data
structure.
*/
declare class RangeSet$2<T extends RangeValue$2> {
    private constructor();
    /**
    The number of ranges in the set.
    */
    get size(): number;
    /**
    Update the range set, optionally adding new ranges or filtering
    out existing ones.
    
    (Note: The type parameter is just there as a kludge to work
    around TypeScript variance issues that prevented `RangeSet<X>`
    from being a subtype of `RangeSet<Y>` when `X` is a subtype of
    `Y`.)
    */
    update<U extends T>(updateSpec: RangeSetUpdate$2<U>): RangeSet$2<T>;
    /**
    Map this range set through a set of changes, return the new set.
    */
    map(changes: ChangeDesc$3): RangeSet$2<T>;
    /**
    Iterate over the ranges that touch the region `from` to `to`,
    calling `f` for each. There is no guarantee that the ranges will
    be reported in any specific order. When the callback returns
    `false`, iteration stops.
    */
    between(from: number, to: number, f: (from: number, to: number, value: T) => void | false): void;
    /**
    Iterate over the ranges in this set, in order, including all
    ranges that end at or after `from`.
    */
    iter(from?: number): RangeCursor$2<T>;
    /**
    Iterate over the ranges in a collection of sets, in order,
    starting from `from`.
    */
    static iter<T extends RangeValue$2>(sets: readonly RangeSet$2<T>[], from?: number): RangeCursor$2<T>;
    /**
    Iterate over two groups of sets, calling methods on `comparator`
    to notify it of possible differences.
    */
    static compare<T extends RangeValue$2>(oldSets: readonly RangeSet$2<T>[], newSets: readonly RangeSet$2<T>[], 
    /**
    This indicates how the underlying data changed between these
    ranges, and is needed to synchronize the iteration. `from` and
    `to` are coordinates in the _new_ space, after these changes.
    */
    textDiff: ChangeDesc$3, comparator: RangeComparator$2<T>, 
    /**
    Can be used to ignore all non-point ranges, and points below
    the given size. When -1, all ranges are compared.
    */
    minPointSize?: number): void;
    /**
    Compare the contents of two groups of range sets, returning true
    if they are equivalent in the given range.
    */
    static eq<T extends RangeValue$2>(oldSets: readonly RangeSet$2<T>[], newSets: readonly RangeSet$2<T>[], from?: number, to?: number): boolean;
    /**
    Iterate over a group of range sets at the same time, notifying
    the iterator about the ranges covering every given piece of
    content. Returns the open count (see
    [`SpanIterator.span`](https://codemirror.net/6/docs/ref/#state.SpanIterator.span)) at the end
    of the iteration.
    */
    static spans<T extends RangeValue$2>(sets: readonly RangeSet$2<T>[], from: number, to: number, iterator: SpanIterator$2<T>, 
    /**
    When given and greater than -1, only points of at least this
    size are taken into account.
    */
    minPointSize?: number): number;
    /**
    Create a range set for the given range or array of ranges. By
    default, this expects the ranges to be _sorted_ (by start
    position and, if two start at the same position,
    `value.startSide`). You can pass `true` as second argument to
    cause the method to sort them.
    */
    static of<T extends RangeValue$2>(ranges: readonly Range$2<T>[] | Range$2<T>, sort?: boolean): RangeSet$2<T>;
    /**
    The empty set of ranges.
    */
    static empty: RangeSet$2<any>;
}

declare type Attrs$2 = {
    [name: string]: string;
};

interface MarkDecorationSpec$2 {
    /**
    Whether the mark covers its start and end position or not. This
    influences whether content inserted at those positions becomes
    part of the mark. Defaults to false.
    */
    inclusive?: boolean;
    /**
    Specify whether the start position of the marked range should be
    inclusive. Overrides `inclusive`, when both are present.
    */
    inclusiveStart?: boolean;
    /**
    Whether the end should be inclusive.
    */
    inclusiveEnd?: boolean;
    /**
    Add attributes to the DOM elements that hold the text in the
    marked range.
    */
    attributes?: {
        [key: string]: string;
    };
    /**
    Shorthand for `{attributes: {class: value}}`.
    */
    class?: string;
    /**
    Add a wrapping element around the text in the marked range. Note
    that there will not necessarily be a single element covering the
    entire range—other decorations with lower precedence might split
    this one if they partially overlap it, and line breaks always
    end decoration elements.
    */
    tagName?: string;
    /**
    Decoration specs allow extra properties, which can be retrieved
    through the decoration's [`spec`](https://codemirror.net/6/docs/ref/#view.Decoration.spec)
    property.
    */
    [other: string]: any;
}
interface WidgetDecorationSpec$2 {
    /**
    The type of widget to draw here.
    */
    widget: WidgetType$2;
    /**
    Which side of the given position the widget is on. When this is
    positive, the widget will be drawn after the cursor if the
    cursor is on the same position. Otherwise, it'll be drawn before
    it. When multiple widgets sit at the same position, their `side`
    values will determine their ordering—those with a lower value
    come first. Defaults to 0.
    */
    side?: number;
    /**
    Determines whether this is a block widgets, which will be drawn
    between lines, or an inline widget (the default) which is drawn
    between the surrounding text.
    
    Note that block-level decorations should not have vertical
    margins, and if you dynamically change their height, you should
    make sure to call
    [`requestMeasure`](https://codemirror.net/6/docs/ref/#view.EditorView.requestMeasure), so that the
    editor can update its information about its vertical layout.
    */
    block?: boolean;
    /**
    Other properties are allowed.
    */
    [other: string]: any;
}
interface ReplaceDecorationSpec$2 {
    /**
    An optional widget to drawn in the place of the replaced
    content.
    */
    widget?: WidgetType$2;
    /**
    Whether this range covers the positions on its sides. This
    influences whether new content becomes part of the range and
    whether the cursor can be drawn on its sides. Defaults to false
    for inline replacements, and true for block replacements.
    */
    inclusive?: boolean;
    /**
    Set inclusivity at the start.
    */
    inclusiveStart?: boolean;
    /**
    Set inclusivity at the end.
    */
    inclusiveEnd?: boolean;
    /**
    Whether this is a block-level decoration. Defaults to false.
    */
    block?: boolean;
    /**
    Other properties are allowed.
    */
    [other: string]: any;
}
interface LineDecorationSpec$2 {
    /**
    DOM attributes to add to the element wrapping the line.
    */
    attributes?: {
        [key: string]: string;
    };
    /**
    Shorthand for `{attributes: {class: value}}`.
    */
    class?: string;
    /**
    Other properties are allowed.
    */
    [other: string]: any;
}
/**
Widgets added to the content are described by subclasses of this
class. Using a description object like that makes it possible to
delay creating of the DOM structure for a widget until it is
needed, and to avoid redrawing widgets even if the decorations
that define them are recreated.
*/
declare abstract class WidgetType$2 {
    /**
    Build the DOM structure for this widget instance.
    */
    abstract toDOM(view: EditorView$2): HTMLElement;
    /**
    Compare this instance to another instance of the same type.
    (TypeScript can't express this, but only instances of the same
    specific class will be passed to this method.) This is used to
    avoid redrawing widgets when they are replaced by a new
    decoration of the same type. The default implementation just
    returns `false`, which will cause new instances of the widget to
    always be redrawn.
    */
    eq(widget: WidgetType$2): boolean;
    /**
    Update a DOM element created by a widget of the same type (but
    different, non-`eq` content) to reflect this widget. May return
    true to indicate that it could update, false to indicate it
    couldn't (in which case the widget will be redrawn). The default
    implementation just returns false.
    */
    updateDOM(dom: HTMLElement): boolean;
    /**
    The estimated height this widget will have, to be used when
    estimating the height of content that hasn't been drawn. May
    return -1 to indicate you don't know. The default implementation
    returns -1.
    */
    get estimatedHeight(): number;
    /**
    Can be used to configure which kinds of events inside the widget
    should be ignored by the editor. The default is to ignore all
    events.
    */
    ignoreEvent(event: Event): boolean;
    /**
    This is called when the an instance of the widget is removed
    from the editor view.
    */
    destroy(dom: HTMLElement): void;
}
/**
A decoration set represents a collection of decorated ranges,
organized for efficient access and mapping. See
[`RangeSet`](https://codemirror.net/6/docs/ref/#state.RangeSet) for its methods.
*/
declare type DecorationSet$2 = RangeSet$2<Decoration$2>;
/**
The different types of blocks that can occur in an editor view.
*/
declare enum BlockType$2 {
    /**
    A line of text.
    */
    Text = 0,
    /**
    A block widget associated with the position after it.
    */
    WidgetBefore = 1,
    /**
    A block widget associated with the position before it.
    */
    WidgetAfter = 2,
    /**
    A block widget [replacing](https://codemirror.net/6/docs/ref/#view.Decoration^replace) a range of content.
    */
    WidgetRange = 3
}
/**
A decoration provides information on how to draw or style a piece
of content. You'll usually use it wrapped in a
[`Range`](https://codemirror.net/6/docs/ref/#state.Range), which adds a start and end position.
@nonabstract
*/
declare abstract class Decoration$2 extends RangeValue$2 {
    /**
    The config object used to create this decoration. You can
    include additional properties in there to store metadata about
    your decoration.
    */
    readonly spec: any;
    protected constructor(
    /**
    @internal
    */
    startSide: number, 
    /**
    @internal
    */
    endSide: number, 
    /**
    @internal
    */
    widget: WidgetType$2 | null, 
    /**
    The config object used to create this decoration. You can
    include additional properties in there to store metadata about
    your decoration.
    */
    spec: any);
    abstract eq(other: Decoration$2): boolean;
    /**
    Create a mark decoration, which influences the styling of the
    content in its range. Nested mark decorations will cause nested
    DOM elements to be created. Nesting order is determined by
    precedence of the [facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations), with
    the higher-precedence decorations creating the inner DOM nodes.
    Such elements are split on line boundaries and on the boundaries
    of lower-precedence decorations.
    */
    static mark(spec: MarkDecorationSpec$2): Decoration$2;
    /**
    Create a widget decoration, which displays a DOM element at the
    given position.
    */
    static widget(spec: WidgetDecorationSpec$2): Decoration$2;
    /**
    Create a replace decoration which replaces the given range with
    a widget, or simply hides it.
    */
    static replace(spec: ReplaceDecorationSpec$2): Decoration$2;
    /**
    Create a line decoration, which can add DOM attributes to the
    line starting at the given position.
    */
    static line(spec: LineDecorationSpec$2): Decoration$2;
    /**
    Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
    decorated range or ranges. If the ranges aren't already sorted,
    pass `true` for `sort` to make the library sort them for you.
    */
    static set(of: Range$2<Decoration$2> | readonly Range$2<Decoration$2>[], sort?: boolean): DecorationSet$2;
    /**
    The empty set of decorations.
    */
    static none: DecorationSet$2;
}

/**
Basic rectangle type.
*/
interface Rect$2 {
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;
}
declare type ScrollStrategy$2 = "nearest" | "start" | "end" | "center";

/**
Command functions are used in key bindings and other types of user
actions. Given an editor view, they check whether their effect can
apply to the editor, and if it can, perform it as a side effect
(which usually means [dispatching](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) a
transaction) and return `true`.
*/
declare type Command$1 = (target: EditorView$2) => boolean;
/**
This is the interface plugin objects conform to.
*/
interface PluginValue$2 extends Object {
    /**
    Notifies the plugin of an update that happened in the view. This
    is called _before_ the view updates its own DOM. It is
    responsible for updating the plugin's internal state (including
    any state that may be read by plugin fields) and _writing_ to
    the DOM for the changes in the update. To avoid unnecessary
    layout recomputations, it should _not_ read the DOM layout—use
    [`requestMeasure`](https://codemirror.net/6/docs/ref/#view.EditorView.requestMeasure) to schedule
    your code in a DOM reading phase if you need to.
    */
    update?(update: ViewUpdate$2): void;
    /**
    Called when the plugin is no longer going to be used. Should
    revert any changes the plugin made to the DOM.
    */
    destroy?(): void;
}
/**
Provides additional information when defining a [view
plugin](https://codemirror.net/6/docs/ref/#view.ViewPlugin).
*/
interface PluginSpec$2<V extends PluginValue$2> {
    /**
    Register the given [event
    handlers](https://codemirror.net/6/docs/ref/#view.EditorView^domEventHandlers) for the plugin.
    When called, these will have their `this` bound to the plugin
    value.
    */
    eventHandlers?: DOMEventHandlers$2<V>;
    /**
    Specify that the plugin provides additional extensions when
    added to an editor configuration.
    */
    provide?: (plugin: ViewPlugin$2<V>) => Extension$3;
    /**
    Allow the plugin to provide decorations. When given, this should
    be a function that take the plugin value and return a
    [decoration set](https://codemirror.net/6/docs/ref/#view.DecorationSet). See also the caveat about
    [layout-changing decorations](https://codemirror.net/6/docs/ref/#view.EditorView^decorations) that
    depend on the view.
    */
    decorations?: (value: V) => DecorationSet$2;
}
/**
View plugins associate stateful values with a view. They can
influence the way the content is drawn, and are notified of things
that happen in the view.
*/
declare class ViewPlugin$2<V extends PluginValue$2> {
    /**
    Instances of this class act as extensions.
    */
    extension: Extension$3;
    private constructor();
    /**
    Define a plugin from a constructor function that creates the
    plugin's value, given an editor view.
    */
    static define<V extends PluginValue$2>(create: (view: EditorView$2) => V, spec?: PluginSpec$2<V>): ViewPlugin$2<V>;
    /**
    Create a plugin for a class whose constructor takes a single
    editor view as argument.
    */
    static fromClass<V extends PluginValue$2>(cls: {
        new (view: EditorView$2): V;
    }, spec?: PluginSpec$2<V>): ViewPlugin$2<V>;
}
interface MeasureRequest$2<T> {
    /**
    Called in a DOM read phase to gather information that requires
    DOM layout. Should _not_ mutate the document.
    */
    read(view: EditorView$2): T;
    /**
    Called in a DOM write phase to update the document. Should _not_
    do anything that triggers DOM layout.
    */
    write?(measure: T, view: EditorView$2): void;
    /**
    When multiple requests with the same key are scheduled, only the
    last one will actually be ran.
    */
    key?: any;
}
declare type AttrSource$2 = Attrs$2 | ((view: EditorView$2) => Attrs$2 | null);
/**
View [plugins](https://codemirror.net/6/docs/ref/#view.ViewPlugin) are given instances of this
class, which describe what happened, whenever the view is updated.
*/
declare class ViewUpdate$2 {
    /**
    The editor view that the update is associated with.
    */
    readonly view: EditorView$2;
    /**
    The new editor state.
    */
    readonly state: EditorState$3;
    /**
    The transactions involved in the update. May be empty.
    */
    readonly transactions: readonly Transaction$3[];
    /**
    The changes made to the document by this update.
    */
    readonly changes: ChangeSet$3;
    /**
    The previous editor state.
    */
    readonly startState: EditorState$3;
    private constructor();
    /**
    Tells you whether the [viewport](https://codemirror.net/6/docs/ref/#view.EditorView.viewport) or
    [visible ranges](https://codemirror.net/6/docs/ref/#view.EditorView.visibleRanges) changed in this
    update.
    */
    get viewportChanged(): boolean;
    /**
    Indicates whether the height of a block element in the editor
    changed in this update.
    */
    get heightChanged(): boolean;
    /**
    Returns true when the document was modified or the size of the
    editor, or elements within the editor, changed.
    */
    get geometryChanged(): boolean;
    /**
    True when this update indicates a focus change.
    */
    get focusChanged(): boolean;
    /**
    Whether the document changed in this update.
    */
    get docChanged(): boolean;
    /**
    Whether the selection was explicitly set in this update.
    */
    get selectionSet(): boolean;
}

/**
Interface that objects registered with
[`EditorView.mouseSelectionStyle`](https://codemirror.net/6/docs/ref/#view.EditorView^mouseSelectionStyle)
must conform to.
*/
interface MouseSelectionStyle$2 {
    /**
    Return a new selection for the mouse gesture that starts with
    the event that was originally given to the constructor, and ends
    with the event passed here. In case of a plain click, those may
    both be the `mousedown` event, in case of a drag gesture, the
    latest `mousemove` event will be passed.
    
    When `extend` is true, that means the new selection should, if
    possible, extend the start selection. If `multiple` is true, the
    new selection should be added to the original selection.
    */
    get: (curEvent: MouseEvent, extend: boolean, multiple: boolean) => EditorSelection$3;
    /**
    Called when the view is updated while the gesture is in
    progress. When the document changes, it may be necessary to map
    some data (like the original selection or start position)
    through the changes.
    
    This may return `true` to indicate that the `get` method should
    get queried again after the update, because something in the
    update could change its result. Be wary of infinite loops when
    using this (where `get` returns a new selection, which will
    trigger `update`, which schedules another `get` in response).
    */
    update: (update: ViewUpdate$2) => boolean | void;
}
declare type MakeSelectionStyle$2 = (view: EditorView$2, event: MouseEvent) => MouseSelectionStyle$2 | null;

/**
Record used to represent information about a block-level element
in the editor view.
*/
declare class BlockInfo$2 {
    /**
    The start of the element in the document.
    */
    readonly from: number;
    /**
    The length of the element.
    */
    readonly length: number;
    /**
    The top position of the element (relative to the top of the
    document).
    */
    readonly top: number;
    /**
    Its height.
    */
    readonly height: number;
    /**
    The type of element this is. When querying lines, this may be
    an array of all the blocks that make up the line.
    */
    readonly type: BlockType$2 | readonly BlockInfo$2[];
    /**
    The end of the element as a document position.
    */
    get to(): number;
    /**
    The bottom position of the element.
    */
    get bottom(): number;
}

/**
Used to indicate [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
*/
declare enum Direction$2 {
    /**
    Left-to-right.
    */
    LTR = 0,
    /**
    Right-to-left.
    */
    RTL = 1
}
/**
Represents a contiguous range of text that has a single direction
(as in left-to-right or right-to-left).
*/
declare class BidiSpan$2 {
    /**
    The start of the span (relative to the start of the line).
    */
    readonly from: number;
    /**
    The end of the span.
    */
    readonly to: number;
    /**
    The ["bidi
    level"](https://unicode.org/reports/tr9/#Basic_Display_Algorithm)
    of the span (in this context, 0 means
    left-to-right, 1 means right-to-left, 2 means left-to-right
    number inside right-to-left text).
    */
    readonly level: number;
    /**
    The direction of this span.
    */
    get dir(): Direction$2;
}

/**
The type of object given to the [`EditorView`](https://codemirror.net/6/docs/ref/#view.EditorView)
constructor.
*/
interface EditorViewConfig$2 extends EditorStateConfig$3 {
    /**
    The view's initial state. If not given, a new state is created
    by passing this configuration object to
    [`EditorState.create`](https://codemirror.net/6/docs/ref/#state.EditorState^create), using its
    `doc`, `selection`, and `extensions` field (if provided).
    */
    state?: EditorState$3;
    /**
    When given, the editor is immediately appended to the given
    element on creation. (Otherwise, you'll have to place the view's
    [`dom`](https://codemirror.net/6/docs/ref/#view.EditorView.dom) element in the document yourself.)
    */
    parent?: Element | DocumentFragment;
    /**
    If the view is going to be mounted in a shadow root or document
    other than the one held by the global variable `document` (the
    default), you should pass it here. If you provide `parent`, but
    not this option, the editor will automatically look up a root
    from the parent.
    */
    root?: Document | ShadowRoot;
    /**
    Override the transaction [dispatch
    function](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) for this editor view, which
    is the way updates get routed to the view. Your implementation,
    if provided, should probably call the view's [`update`
    method](https://codemirror.net/6/docs/ref/#view.EditorView.update).
    */
    dispatch?: (tr: Transaction$3) => void;
}
/**
An editor view represents the editor's user interface. It holds
the editable DOM surface, and possibly other elements such as the
line number gutter. It handles events and dispatches state
transactions for editing actions.
*/
declare class EditorView$2 {
    /**
    The current editor state.
    */
    get state(): EditorState$3;
    /**
    To be able to display large documents without consuming too much
    memory or overloading the browser, CodeMirror only draws the
    code that is visible (plus a margin around it) to the DOM. This
    property tells you the extent of the current drawn viewport, in
    document positions.
    */
    get viewport(): {
        from: number;
        to: number;
    };
    /**
    When there are, for example, large collapsed ranges in the
    viewport, its size can be a lot bigger than the actual visible
    content. Thus, if you are doing something like styling the
    content in the viewport, it is preferable to only do so for
    these ranges, which are the subset of the viewport that is
    actually drawn.
    */
    get visibleRanges(): readonly {
        from: number;
        to: number;
    }[];
    /**
    Returns false when the editor is entirely scrolled out of view
    or otherwise hidden.
    */
    get inView(): boolean;
    /**
    Indicates whether the user is currently composing text via
    [IME](https://en.wikipedia.org/wiki/Input_method), and at least
    one change has been made in the current composition.
    */
    get composing(): boolean;
    /**
    Indicates whether the user is currently in composing state. Note
    that on some platforms, like Android, this will be the case a
    lot, since just putting the cursor on a word starts a
    composition there.
    */
    get compositionStarted(): boolean;
    private _dispatch;
    private _root;
    /**
    The document or shadow root that the view lives in.
    */
    get root(): DocumentOrShadowRoot;
    /**
    The DOM element that wraps the entire editor view.
    */
    readonly dom: HTMLElement;
    /**
    The DOM element that can be styled to scroll. (Note that it may
    not have been, so you can't assume this is scrollable.)
    */
    readonly scrollDOM: HTMLElement;
    /**
    The editable DOM element holding the editor content. You should
    not, usually, interact with this content directly though the
    DOM, since the editor will immediately undo most of the changes
    you make. Instead, [dispatch](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch)
    [transactions](https://codemirror.net/6/docs/ref/#state.Transaction) to modify content, and
    [decorations](https://codemirror.net/6/docs/ref/#view.Decoration) to style it.
    */
    readonly contentDOM: HTMLElement;
    private announceDOM;
    private plugins;
    private pluginMap;
    private editorAttrs;
    private contentAttrs;
    private styleModules;
    private bidiCache;
    private destroyed;
    /**
    Construct a new view. You'll want to either provide a `parent`
    option, or put `view.dom` into your document after creating a
    view, so that the user can see the editor.
    */
    constructor(config?: EditorViewConfig$2);
    /**
    All regular editor state updates should go through this. It
    takes a transaction or transaction spec and updates the view to
    show the new state produced by that transaction. Its
    implementation can be overridden with an
    [option](https://codemirror.net/6/docs/ref/#view.EditorView.constructor^config.dispatch). This
    function is bound to the view instance, so it does not have to
    be called as a method.
    */
    dispatch(tr: Transaction$3): void;
    dispatch(...specs: TransactionSpec$3[]): void;
    /**
    Update the view for the given array of transactions. This will
    update the visible document and selection to match the state
    produced by the transactions, and notify view plugins of the
    change. You should usually call
    [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead, which uses this
    as a primitive.
    */
    update(transactions: readonly Transaction$3[]): void;
    /**
    Reset the view to the given state. (This will cause the entire
    document to be redrawn and all view plugins to be reinitialized,
    so you should probably only use it when the new state isn't
    derived from the old state. Otherwise, use
    [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead.)
    */
    setState(newState: EditorState$3): void;
    private updatePlugins;
    /**
    Get the CSS classes for the currently active editor themes.
    */
    get themeClasses(): string;
    private updateAttrs;
    private showAnnouncements;
    private mountStyles;
    private readMeasured;
    /**
    Schedule a layout measurement, optionally providing callbacks to
    do custom DOM measuring followed by a DOM write phase. Using
    this is preferable reading DOM layout directly from, for
    example, an event handler, because it'll make sure measuring and
    drawing done by other components is synchronized, avoiding
    unnecessary DOM layout computations.
    */
    requestMeasure<T>(request?: MeasureRequest$2<T>): void;
    /**
    Get the value of a specific plugin, if present. Note that
    plugins that crash can be dropped from a view, so even when you
    know you registered a given plugin, it is recommended to check
    the return value of this method.
    */
    plugin<T extends PluginValue$2>(plugin: ViewPlugin$2<T>): T | null;
    /**
    The top position of the document, in screen coordinates. This
    may be negative when the editor is scrolled down. Points
    directly to the top of the first line, not above the padding.
    */
    get documentTop(): number;
    /**
    Reports the padding above and below the document.
    */
    get documentPadding(): {
        top: number;
        bottom: number;
    };
    /**
    Find the text line or block widget at the given vertical
    position (which is interpreted as relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop)).
    */
    elementAtHeight(height: number): BlockInfo$2;
    /**
    Find the line block (see
    [`lineBlockAt`](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) at the given
    height, again interpreted relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop).
    */
    lineBlockAtHeight(height: number): BlockInfo$2;
    /**
    Get the extent and vertical position of all [line
    blocks](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) in the viewport. Positions
    are relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop);
    */
    get viewportLineBlocks(): BlockInfo$2[];
    /**
    Find the line block around the given document position. A line
    block is a range delimited on both sides by either a
    non-[hidden](https://codemirror.net/6/docs/ref/#view.Decoration^replace) line breaks, or the
    start/end of the document. It will usually just hold a line of
    text, but may be broken into multiple textblocks by block
    widgets.
    */
    lineBlockAt(pos: number): BlockInfo$2;
    /**
    The editor's total content height.
    */
    get contentHeight(): number;
    /**
    Move a cursor position by [grapheme
    cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak). `forward` determines whether
    the motion is away from the line start, or towards it. In
    bidirectional text, the line is traversed in visual order, using
    the editor's [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
    When the start position was the last one on the line, the
    returned position will be across the line break. If there is no
    further line, the original position is returned.
    
    By default, this method moves over a single cluster. The
    optional `by` argument can be used to move across more. It will
    be called with the first cluster as argument, and should return
    a predicate that determines, for each subsequent cluster,
    whether it should also be moved over.
    */
    moveByChar(start: SelectionRange$3, forward: boolean, by?: (initial: string) => (next: string) => boolean): SelectionRange$3;
    /**
    Move a cursor position across the next group of either
    [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
    non-whitespace characters.
    */
    moveByGroup(start: SelectionRange$3, forward: boolean): SelectionRange$3;
    /**
    Move to the next line boundary in the given direction. If
    `includeWrap` is true, line wrapping is on, and there is a
    further wrap point on the current line, the wrap point will be
    returned. Otherwise this function will return the start or end
    of the line.
    */
    moveToLineBoundary(start: SelectionRange$3, forward: boolean, includeWrap?: boolean): SelectionRange$3;
    /**
    Move a cursor position vertically. When `distance` isn't given,
    it defaults to moving to the next line (including wrapped
    lines). Otherwise, `distance` should provide a positive distance
    in pixels.
    
    When `start` has a
    [`goalColumn`](https://codemirror.net/6/docs/ref/#state.SelectionRange.goalColumn), the vertical
    motion will use that as a target horizontal position. Otherwise,
    the cursor's own horizontal position is used. The returned
    cursor will have its goal column set to whichever column was
    used.
    */
    moveVertically(start: SelectionRange$3, forward: boolean, distance?: number): SelectionRange$3;
    /**
    Find the DOM parent node and offset (child offset if `node` is
    an element, character offset when it is a text node) at the
    given document position.
    
    Note that for positions that aren't currently in
    `visibleRanges`, the resulting DOM position isn't necessarily
    meaningful (it may just point before or after a placeholder
    element).
    */
    domAtPos(pos: number): {
        node: Node;
        offset: number;
    };
    /**
    Find the document position at the given DOM node. Can be useful
    for associating positions with DOM events. Will raise an error
    when `node` isn't part of the editor content.
    */
    posAtDOM(node: Node, offset?: number): number;
    /**
    Get the document position at the given screen coordinates. For
    positions not covered by the visible viewport's DOM structure,
    this will return null, unless `false` is passed as second
    argument, in which case it'll return an estimated position that
    would be near the coordinates if it were rendered.
    */
    posAtCoords(coords: {
        x: number;
        y: number;
    }, precise: false): number;
    posAtCoords(coords: {
        x: number;
        y: number;
    }): number | null;
    /**
    Get the screen coordinates at the given document position.
    `side` determines whether the coordinates are based on the
    element before (-1) or after (1) the position (if no element is
    available on the given side, the method will transparently use
    another strategy to get reasonable coordinates).
    */
    coordsAtPos(pos: number, side?: -1 | 1): Rect$2 | null;
    /**
    The default width of a character in the editor. May not
    accurately reflect the width of all characters (given variable
    width fonts or styling of invididual ranges).
    */
    get defaultCharacterWidth(): number;
    /**
    The default height of a line in the editor. May not be accurate
    for all lines.
    */
    get defaultLineHeight(): number;
    /**
    The text direction
    ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
    CSS property) of the editor's content element.
    */
    get textDirection(): Direction$2;
    /**
    Find the text direction of the block at the given position, as
    assigned by CSS. If
    [`perLineTextDirection`](https://codemirror.net/6/docs/ref/#view.EditorView^perLineTextDirection)
    isn't enabled, or the given position is outside of the viewport,
    this will always return the same as
    [`textDirection`](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection). Note that
    this may trigger a DOM layout.
    */
    textDirectionAt(pos: number): Direction$2;
    /**
    Whether this editor [wraps lines](https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping)
    (as determined by the
    [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
    CSS property of its content element).
    */
    get lineWrapping(): boolean;
    /**
    Returns the bidirectional text structure of the given line
    (which should be in the current document) as an array of span
    objects. The order of these spans matches the [text
    direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection)—if that is
    left-to-right, the leftmost spans come first, otherwise the
    rightmost spans come first.
    */
    bidiSpans(line: Line$4): readonly BidiSpan$2[];
    /**
    Check whether the editor has focus.
    */
    get hasFocus(): boolean;
    /**
    Put focus on the editor.
    */
    focus(): void;
    /**
    Update the [root](https://codemirror.net/6/docs/ref/##view.EditorViewConfig.root) in which the editor lives. This is only
    necessary when moving the editor's existing DOM to a new window or shadow root.
    */
    setRoot(root: Document | ShadowRoot): void;
    /**
    Clean up this editor view, removing its element from the
    document, unregistering event handlers, and notifying
    plugins. The view instance can no longer be used after
    calling this.
    */
    destroy(): void;
    /**
    Returns an effect that can be
    [added](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) to a transaction to
    cause it to scroll the given position or range into view.
    */
    static scrollIntoView(pos: number | SelectionRange$3, options?: {
        /**
        By default (`"nearest"`) the position will be vertically
        scrolled only the minimal amount required to move the given
        position into view. You can set this to `"start"` to move it
        to the top of the view, `"end"` to move it to the bottom, or
        `"center"` to move it to the center.
        */
        y?: ScrollStrategy$2;
        /**
        Effect similar to
        [`y`](https://codemirror.net/6/docs/ref/#view.EditorView^scrollIntoView^options.y), but for the
        horizontal scroll position.
        */
        x?: ScrollStrategy$2;
        /**
        Extra vertical distance to add when moving something into
        view. Not used with the `"center"` strategy. Defaults to 5.
        */
        yMargin?: number;
        /**
        Extra horizontal distance to add. Not used with the `"center"`
        strategy. Defaults to 5.
        */
        xMargin?: number;
    }): StateEffect$3<unknown>;
    /**
    Facet to add a [style
    module](https://github.com/marijnh/style-mod#documentation) to
    an editor view. The view will ensure that the module is
    mounted in its [document
    root](https://codemirror.net/6/docs/ref/#view.EditorView.constructor^config.root).
    */
    static styleModule: Facet$3<StyleModule, readonly StyleModule[]>;
    /**
    Returns an extension that can be used to add DOM event handlers.
    The value should be an object mapping event names to handler
    functions. For any given event, such functions are ordered by
    extension precedence, and the first handler to return true will
    be assumed to have handled that event, and no other handlers or
    built-in behavior will be activated for it. These are registered
    on the [content element](https://codemirror.net/6/docs/ref/#view.EditorView.contentDOM), except
    for `scroll` handlers, which will be called any time the
    editor's [scroll element](https://codemirror.net/6/docs/ref/#view.EditorView.scrollDOM) or one of
    its parent nodes is scrolled.
    */
    static domEventHandlers(handlers: DOMEventHandlers$2<any>): Extension$3;
    /**
    An input handler can override the way changes to the editable
    DOM content are handled. Handlers are passed the document
    positions between which the change was found, and the new
    content. When one returns true, no further input handlers are
    called and the default behavior is prevented.
    */
    static inputHandler: Facet$3<(view: EditorView$2, from: number, to: number, text: string) => boolean, readonly ((view: EditorView$2, from: number, to: number, text: string) => boolean)[]>;
    /**
    By default, the editor assumes all its content has the same
    [text direction](https://codemirror.net/6/docs/ref/#view.Direction). Configure this with a `true`
    value to make it read the text direction of every (rendered)
    line separately.
    */
    static perLineTextDirection: Facet$3<boolean, boolean>;
    /**
    Allows you to provide a function that should be called when the
    library catches an exception from an extension (mostly from view
    plugins, but may be used by other extensions to route exceptions
    from user-code-provided callbacks). This is mostly useful for
    debugging and logging. See [`logException`](https://codemirror.net/6/docs/ref/#view.logException).
    */
    static exceptionSink: Facet$3<(exception: any) => void, readonly ((exception: any) => void)[]>;
    /**
    A facet that can be used to register a function to be called
    every time the view updates.
    */
    static updateListener: Facet$3<(update: ViewUpdate$2) => void, readonly ((update: ViewUpdate$2) => void)[]>;
    /**
    Facet that controls whether the editor content DOM is editable.
    When its highest-precedence value is `false`, the element will
    not have its `contenteditable` attribute set. (Note that this
    doesn't affect API calls that change the editor content, even
    when those are bound to keys or buttons. See the
    [`readOnly`](https://codemirror.net/6/docs/ref/#state.EditorState.readOnly) facet for that.)
    */
    static editable: Facet$3<boolean, boolean>;
    /**
    Allows you to influence the way mouse selection happens. The
    functions in this facet will be called for a `mousedown` event
    on the editor, and can return an object that overrides the way a
    selection is computed from that mouse click or drag.
    */
    static mouseSelectionStyle: Facet$3<MakeSelectionStyle$2, readonly MakeSelectionStyle$2[]>;
    /**
    Facet used to configure whether a given selection drag event
    should move or copy the selection. The given predicate will be
    called with the `mousedown` event, and can return `true` when
    the drag should move the content.
    */
    static dragMovesSelection: Facet$3<(event: MouseEvent) => boolean, readonly ((event: MouseEvent) => boolean)[]>;
    /**
    Facet used to configure whether a given selecting click adds a
    new range to the existing selection or replaces it entirely. The
    default behavior is to check `event.metaKey` on macOS, and
    `event.ctrlKey` elsewhere.
    */
    static clickAddsSelectionRange: Facet$3<(event: MouseEvent) => boolean, readonly ((event: MouseEvent) => boolean)[]>;
    /**
    A facet that determines which [decorations](https://codemirror.net/6/docs/ref/#view.Decoration)
    are shown in the view. Decorations can be provided in two
    ways—directly, or via a function that takes an editor view.
    
    Only decoration sets provided directly are allowed to influence
    the editor's vertical layout structure. The ones provided as
    functions are called _after_ the new viewport has been computed,
    and thus **must not** introduce block widgets or replacing
    decorations that cover line breaks.
    
    If you want decorated ranges to behave like atomic units for
    cursor motion and deletion purposes, also provide the range set
    containing the decorations to
    [`EditorView.atomicRanges`](https://codemirror.net/6/docs/ref/#view.EditorView^atomicRanges).
    */
    static decorations: Facet$3<DecorationSet$2 | ((view: EditorView$2) => DecorationSet$2), readonly (DecorationSet$2 | ((view: EditorView$2) => DecorationSet$2))[]>;
    /**
    Used to provide ranges that should be treated as atoms as far as
    cursor motion is concerned. This causes methods like
    [`moveByChar`](https://codemirror.net/6/docs/ref/#view.EditorView.moveByChar) and
    [`moveVertically`](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) (and the
    commands built on top of them) to skip across such regions when
    a selection endpoint would enter them. This does _not_ prevent
    direct programmatic [selection
    updates](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) from moving into such
    regions.
    */
    static atomicRanges: Facet$3<(view: EditorView$2) => RangeSet$2<any>, readonly ((view: EditorView$2) => RangeSet$2<any>)[]>;
    /**
    Facet that allows extensions to provide additional scroll
    margins (space around the sides of the scrolling element that
    should be considered invisible). This can be useful when the
    plugin introduces elements that cover part of that element (for
    example a horizontally fixed gutter).
    */
    static scrollMargins: Facet$3<(view: EditorView$2) => Partial<Rect$2> | null, readonly ((view: EditorView$2) => Partial<Rect$2> | null)[]>;
    /**
    Create a theme extension. The first argument can be a
    [`style-mod`](https://github.com/marijnh/style-mod#documentation)
    style spec providing the styles for the theme. These will be
    prefixed with a generated class for the style.
    
    Because the selectors will be prefixed with a scope class, rule
    that directly match the editor's [wrapper
    element](https://codemirror.net/6/docs/ref/#view.EditorView.dom)—to which the scope class will be
    added—need to be explicitly differentiated by adding an `&` to
    the selector for that element—for example
    `&.cm-focused`.
    
    When `dark` is set to true, the theme will be marked as dark,
    which will cause the `&dark` rules from [base
    themes](https://codemirror.net/6/docs/ref/#view.EditorView^baseTheme) to be used (as opposed to
    `&light` when a light theme is active).
    */
    static theme(spec: {
        [selector: string]: StyleSpec;
    }, options?: {
        dark?: boolean;
    }): Extension$3;
    /**
    This facet records whether a dark theme is active. The extension
    returned by [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme) automatically
    includes an instance of this when the `dark` option is set to
    true.
    */
    static darkTheme: Facet$3<boolean, boolean>;
    /**
    Create an extension that adds styles to the base theme. Like
    with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
    place of the editor wrapper element when directly targeting
    that. You can also use `&dark` or `&light` instead to only
    target editors with a dark or light theme.
    */
    static baseTheme(spec: {
        [selector: string]: StyleSpec;
    }): Extension$3;
    /**
    Facet that provides additional DOM attributes for the editor's
    editable DOM element.
    */
    static contentAttributes: Facet$3<AttrSource$2, readonly AttrSource$2[]>;
    /**
    Facet that provides DOM attributes for the editor's outer
    element.
    */
    static editorAttributes: Facet$3<AttrSource$2, readonly AttrSource$2[]>;
    /**
    An extension that enables line wrapping in the editor (by
    setting CSS `white-space` to `pre-wrap` in the content).
    */
    static lineWrapping: Extension$3;
    /**
    State effect used to include screen reader announcements in a
    transaction. These will be added to the DOM in a visually hidden
    element with `aria-live="polite"` set, and should be used to
    describe effects that are visually obvious but may not be
    noticed by screen reader users (such as moving to the next
    search match).
    */
    static announce: StateEffectType$3<string>;
    /**
    Retrieve an editor view instance from the view's DOM
    representation.
    */
    static findFromDOM(dom: HTMLElement): EditorView$2 | null;
}
/**
Helper type that maps event names to event object types, or the
`any` type for unknown events.
*/
interface DOMEventMap$2 extends HTMLElementEventMap {
    [other: string]: any;
}
/**
Event handlers are specified with objects like this. For event
types known by TypeScript, this will infer the event argument type
to hold the appropriate event object type. For unknown events, it
is inferred to `any`, and should be explicitly set if you want type
checking.
*/
declare type DOMEventHandlers$2<This> = {
    [event in keyof DOMEventMap$2]?: (this: This, event: DOMEventMap$2[event], view: EditorView$2) => boolean | void;
};

/**
Key bindings associate key names with
[command](https://codemirror.net/6/docs/ref/#view.Command)-style functions.

Key names may be strings like `"Shift-Ctrl-Enter"`—a key identifier
prefixed with zero or more modifiers. Key identifiers are based on
the strings that can appear in
[`KeyEvent.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).
Use lowercase letters to refer to letter keys (or uppercase letters
if you want shift to be held). You may use `"Space"` as an alias
for the `" "` name.

Modifiers can be given in any order. `Shift-` (or `s-`), `Alt-` (or
`a-`), `Ctrl-` (or `c-` or `Control-`) and `Cmd-` (or `m-` or
`Meta-`) are recognized.

When a key binding contains multiple key names separated by
spaces, it represents a multi-stroke binding, which will fire when
the user presses the given keys after each other.

You can use `Mod-` as a shorthand for `Cmd-` on Mac and `Ctrl-` on
other platforms. So `Mod-b` is `Ctrl-b` on Linux but `Cmd-b` on
macOS.
*/
interface KeyBinding$1 {
    /**
    The key name to use for this binding. If the platform-specific
    property (`mac`, `win`, or `linux`) for the current platform is
    used as well in the binding, that one takes precedence. If `key`
    isn't defined and the platform-specific binding isn't either,
    a binding is ignored.
    */
    key?: string;
    /**
    Key to use specifically on macOS.
    */
    mac?: string;
    /**
    Key to use specifically on Windows.
    */
    win?: string;
    /**
    Key to use specifically on Linux.
    */
    linux?: string;
    /**
    The command to execute when this binding is triggered. When the
    command function returns `false`, further bindings will be tried
    for the key.
    */
    run?: Command$1;
    /**
    When given, this defines a second binding, using the (possibly
    platform-specific) key name prefixed with `Shift-` to activate
    this command.
    */
    shift?: Command$1;
    /**
    When this property is present, the function is called for every
    key that is not a multi-stroke prefix.
    */
    any?: (view: EditorView$2, event: KeyboardEvent) => boolean;
    /**
    By default, key bindings apply when focus is on the editor
    content (the `"editor"` scope). Some extensions, mostly those
    that define their own panels, might want to allow you to
    register bindings local to that panel. Such bindings should use
    a custom scope name. You may also assign multiple scope names to
    a binding, separating them by spaces.
    */
    scope?: string;
    /**
    When set to true (the default is false), this will always
    prevent the further handling for the bound key, even if the
    command(s) return false. This can be useful for cases where the
    native behavior of the key is annoying or irrelevant but the
    command doesn't always apply (such as, Mod-u for undo selection,
    which would cause the browser to view source instead when no
    selection can be undone).
    */
    preventDefault?: boolean;
}

interface HistoryConfig {
    /**
    The minimum depth (amount of events) to store. Defaults to 100.
    */
    minDepth?: number;
    /**
    The maximum time (in milliseconds) that adjacent events can be
    apart and still be grouped together. Defaults to 500.
    */
    newGroupDelay?: number;
}
/**
Create a history extension with the given configuration.
*/
declare function history(config?: HistoryConfig): Extension$3;
/**
Default key bindings for the undo history.

- Mod-z: [`undo`](https://codemirror.net/6/docs/ref/#commands.undo).
- Mod-y (Mod-Shift-z on macOS) + Ctrl-Shift-z on Linux: [`redo`](https://codemirror.net/6/docs/ref/#commands.redo).
- Mod-u: [`undoSelection`](https://codemirror.net/6/docs/ref/#commands.undoSelection).
- Alt-u (Mod-Shift-u on macOS): [`redoSelection`](https://codemirror.net/6/docs/ref/#commands.redoSelection).
*/
declare const historyKeymap: readonly KeyBinding$1[];
/**
Add a [unit](https://codemirror.net/6/docs/ref/#language.indentUnit) of indentation to all selected
lines.
*/
declare const indentMore: StateCommand$1;
/**
Remove a [unit](https://codemirror.net/6/docs/ref/#language.indentUnit) of indentation from all
selected lines.
*/
declare const indentLess: StateCommand$1;
/**
The default keymap. Includes all bindings from
[`standardKeymap`](https://codemirror.net/6/docs/ref/#commands.standardKeymap) plus the following:

- Alt-ArrowLeft (Ctrl-ArrowLeft on macOS): [`cursorSyntaxLeft`](https://codemirror.net/6/docs/ref/#commands.cursorSyntaxLeft) ([`selectSyntaxLeft`](https://codemirror.net/6/docs/ref/#commands.selectSyntaxLeft) with Shift)
- Alt-ArrowRight (Ctrl-ArrowRight on macOS): [`cursorSyntaxRight`](https://codemirror.net/6/docs/ref/#commands.cursorSyntaxRight) ([`selectSyntaxRight`](https://codemirror.net/6/docs/ref/#commands.selectSyntaxRight) with Shift)
- Alt-ArrowUp: [`moveLineUp`](https://codemirror.net/6/docs/ref/#commands.moveLineUp)
- Alt-ArrowDown: [`moveLineDown`](https://codemirror.net/6/docs/ref/#commands.moveLineDown)
- Shift-Alt-ArrowUp: [`copyLineUp`](https://codemirror.net/6/docs/ref/#commands.copyLineUp)
- Shift-Alt-ArrowDown: [`copyLineDown`](https://codemirror.net/6/docs/ref/#commands.copyLineDown)
- Escape: [`simplifySelection`](https://codemirror.net/6/docs/ref/#commands.simplifySelection)
- Ctrl-Enter (Comd-Enter on macOS): [`insertBlankLine`](https://codemirror.net/6/docs/ref/#commands.insertBlankLine)
- Alt-l (Ctrl-l on macOS): [`selectLine`](https://codemirror.net/6/docs/ref/#commands.selectLine)
- Ctrl-i (Cmd-i on macOS): [`selectParentSyntax`](https://codemirror.net/6/docs/ref/#commands.selectParentSyntax)
- Ctrl-[ (Cmd-[ on macOS): [`indentLess`](https://codemirror.net/6/docs/ref/#commands.indentLess)
- Ctrl-] (Cmd-] on macOS): [`indentMore`](https://codemirror.net/6/docs/ref/#commands.indentMore)
- Ctrl-Alt-\\ (Cmd-Alt-\\ on macOS): [`indentSelection`](https://codemirror.net/6/docs/ref/#commands.indentSelection)
- Shift-Ctrl-k (Shift-Cmd-k on macOS): [`deleteLine`](https://codemirror.net/6/docs/ref/#commands.deleteLine)
- Shift-Ctrl-\\ (Shift-Cmd-\\ on macOS): [`cursorMatchingBracket`](https://codemirror.net/6/docs/ref/#commands.cursorMatchingBracket)
- Ctrl-/ (Cmd-/ on macOS): [`toggleComment`](https://codemirror.net/6/docs/ref/#commands.toggleComment).
- Shift-Alt-a: [`toggleBlockComment`](https://codemirror.net/6/docs/ref/#commands.toggleBlockComment).
*/
declare const defaultKeymap: readonly KeyBinding$1[];

declare class Tag$1 {
    readonly set: Tag$1[];
    static define(parent?: Tag$1): Tag$1;
    static defineModifier(): (tag: Tag$1) => Tag$1;
}
declare const tags: {
    comment: Tag$1;
    lineComment: Tag$1;
    blockComment: Tag$1;
    docComment: Tag$1;
    name: Tag$1;
    variableName: Tag$1;
    typeName: Tag$1;
    tagName: Tag$1;
    propertyName: Tag$1;
    attributeName: Tag$1;
    className: Tag$1;
    labelName: Tag$1;
    namespace: Tag$1;
    macroName: Tag$1;
    literal: Tag$1;
    string: Tag$1;
    docString: Tag$1;
    character: Tag$1;
    attributeValue: Tag$1;
    number: Tag$1;
    integer: Tag$1;
    float: Tag$1;
    bool: Tag$1;
    regexp: Tag$1;
    escape: Tag$1;
    color: Tag$1;
    url: Tag$1;
    keyword: Tag$1;
    self: Tag$1;
    null: Tag$1;
    atom: Tag$1;
    unit: Tag$1;
    modifier: Tag$1;
    operatorKeyword: Tag$1;
    controlKeyword: Tag$1;
    definitionKeyword: Tag$1;
    moduleKeyword: Tag$1;
    operator: Tag$1;
    derefOperator: Tag$1;
    arithmeticOperator: Tag$1;
    logicOperator: Tag$1;
    bitwiseOperator: Tag$1;
    compareOperator: Tag$1;
    updateOperator: Tag$1;
    definitionOperator: Tag$1;
    typeOperator: Tag$1;
    controlOperator: Tag$1;
    punctuation: Tag$1;
    separator: Tag$1;
    bracket: Tag$1;
    angleBracket: Tag$1;
    squareBracket: Tag$1;
    paren: Tag$1;
    brace: Tag$1;
    content: Tag$1;
    heading: Tag$1;
    heading1: Tag$1;
    heading2: Tag$1;
    heading3: Tag$1;
    heading4: Tag$1;
    heading5: Tag$1;
    heading6: Tag$1;
    contentSeparator: Tag$1;
    list: Tag$1;
    quote: Tag$1;
    emphasis: Tag$1;
    strong: Tag$1;
    link: Tag$1;
    monospace: Tag$1;
    strikethrough: Tag$1;
    inserted: Tag$1;
    deleted: Tag$1;
    changed: Tag$1;
    invalid: Tag$1;
    meta: Tag$1;
    documentMeta: Tag$1;
    annotation: Tag$1;
    processingInstruction: Tag$1;
    definition: (tag: Tag$1) => Tag$1;
    constant: (tag: Tag$1) => Tag$1;
    function: (tag: Tag$1) => Tag$1;
    standard: (tag: Tag$1) => Tag$1;
    local: (tag: Tag$1) => Tag$1;
    special: (tag: Tag$1) => Tag$1;
};

interface ChangedRange$2 {
    fromA: number;
    toA: number;
    fromB: number;
    toB: number;
}
declare class TreeFragment$2 {
    readonly from: number;
    readonly to: number;
    readonly tree: Tree$2;
    readonly offset: number;
    constructor(from: number, to: number, tree: Tree$2, offset: number, openStart?: boolean, openEnd?: boolean);
    get openStart(): boolean;
    get openEnd(): boolean;
    static addTree(tree: Tree$2, fragments?: readonly TreeFragment$2[], partial?: boolean): TreeFragment$2[];
    static applyChanges(fragments: readonly TreeFragment$2[], changes: readonly ChangedRange$2[], minGap?: number): readonly TreeFragment$2[];
}
interface PartialParse$2 {
    advance(): Tree$2 | null;
    readonly parsedPos: number;
    stopAt(pos: number): void;
    readonly stoppedAt: number | null;
}
declare abstract class Parser$2 {
    abstract createParse(input: Input$2, fragments: readonly TreeFragment$2[], ranges: readonly {
        from: number;
        to: number;
    }[]): PartialParse$2;
    startParse(input: Input$2 | string, fragments?: readonly TreeFragment$2[], ranges?: readonly {
        from: number;
        to: number;
    }[]): PartialParse$2;
    parse(input: Input$2 | string, fragments?: readonly TreeFragment$2[], ranges?: readonly {
        from: number;
        to: number;
    }[]): Tree$2;
}
interface Input$2 {
    readonly length: number;
    chunk(from: number): string;
    readonly lineChunks: boolean;
    read(from: number, to: number): string;
}
type ParseWrapper$1 = (inner: PartialParse$2, input: Input$2, fragments: readonly TreeFragment$2[], ranges: readonly {
    from: number;
    to: number;
}[]) => PartialParse$2;

declare class NodeProp$2<T> {
    perNode: boolean;
    deserialize: (str: string) => T;
    constructor(config?: {
        deserialize?: (str: string) => T;
        perNode?: boolean;
    });
    add(match: {
        [selector: string]: T;
    } | ((type: NodeType$2) => T | undefined)): NodePropSource$2;
    static closedBy: NodeProp$2<readonly string[]>;
    static openedBy: NodeProp$2<readonly string[]>;
    static group: NodeProp$2<readonly string[]>;
    static contextHash: NodeProp$2<number>;
    static lookAhead: NodeProp$2<number>;
    static mounted: NodeProp$2<MountedTree$2>;
}
declare class MountedTree$2 {
    readonly tree: Tree$2;
    readonly overlay: readonly {
        from: number;
        to: number;
    }[] | null;
    readonly parser: Parser$2;
    constructor(tree: Tree$2, overlay: readonly {
        from: number;
        to: number;
    }[] | null, parser: Parser$2);
}
type NodePropSource$2 = (type: NodeType$2) => null | [NodeProp$2<any>, any];
declare class NodeType$2 {
    readonly name: string;
    readonly id: number;
    static define(spec: {
        id: number;
        name?: string;
        props?: readonly ([NodeProp$2<any>, any] | NodePropSource$2)[];
        top?: boolean;
        error?: boolean;
        skipped?: boolean;
    }): NodeType$2;
    prop<T>(prop: NodeProp$2<T>): T | undefined;
    get isTop(): boolean;
    get isSkipped(): boolean;
    get isError(): boolean;
    get isAnonymous(): boolean;
    is(name: string | number): boolean;
    static none: NodeType$2;
    static match<T>(map: {
        [selector: string]: T;
    }): (node: NodeType$2) => T | undefined;
}
declare class NodeSet$2 {
    readonly types: readonly NodeType$2[];
    constructor(types: readonly NodeType$2[]);
    extend(...props: NodePropSource$2[]): NodeSet$2;
}
declare enum IterMode$2 {
    ExcludeBuffers = 1,
    IncludeAnonymous = 2,
    IgnoreMounts = 4,
    IgnoreOverlays = 8
}
declare class Tree$2 {
    readonly type: NodeType$2;
    readonly children: readonly (Tree$2 | TreeBuffer$2)[];
    readonly positions: readonly number[];
    readonly length: number;
    constructor(type: NodeType$2, children: readonly (Tree$2 | TreeBuffer$2)[], positions: readonly number[], length: number, props?: readonly [NodeProp$2<any> | number, any][]);
    static empty: Tree$2;
    cursor(mode?: IterMode$2): TreeCursor$2;
    cursorAt(pos: number, side?: -1 | 0 | 1, mode?: IterMode$2): TreeCursor$2;
    get topNode(): SyntaxNode$2;
    resolve(pos: number, side?: -1 | 0 | 1): SyntaxNode$2;
    resolveInner(pos: number, side?: -1 | 0 | 1): SyntaxNode$2;
    iterate(spec: {
        enter(node: SyntaxNodeRef$2): boolean | void;
        leave?(node: SyntaxNodeRef$2): void;
        from?: number;
        to?: number;
        mode?: IterMode$2;
    }): void;
    prop<T>(prop: NodeProp$2<T>): T | undefined;
    get propValues(): readonly [NodeProp$2<any> | number, any][];
    balance(config?: {
        makeTree?: (children: readonly (Tree$2 | TreeBuffer$2)[], positions: readonly number[], length: number) => Tree$2;
    }): Tree$2;
    static build(data: BuildData$2): Tree$2;
}
type BuildData$2 = {
    buffer: BufferCursor$2 | readonly number[];
    nodeSet: NodeSet$2;
    topID: number;
    start?: number;
    bufferStart?: number;
    length?: number;
    maxBufferLength?: number;
    reused?: readonly Tree$2[];
    minRepeatType?: number;
};
interface BufferCursor$2 {
    pos: number;
    id: number;
    start: number;
    end: number;
    size: number;
    next(): void;
    fork(): BufferCursor$2;
}
declare class TreeBuffer$2 {
    readonly buffer: Uint16Array;
    readonly length: number;
    readonly set: NodeSet$2;
    constructor(buffer: Uint16Array, length: number, set: NodeSet$2);
}
interface SyntaxNodeRef$2 {
    readonly from: number;
    readonly to: number;
    readonly type: NodeType$2;
    readonly name: string;
    readonly tree: Tree$2 | null;
    readonly node: SyntaxNode$2;
    matchContext(context: readonly string[]): boolean;
}
interface SyntaxNode$2 extends SyntaxNodeRef$2 {
    parent: SyntaxNode$2 | null;
    firstChild: SyntaxNode$2 | null;
    lastChild: SyntaxNode$2 | null;
    childAfter(pos: number): SyntaxNode$2 | null;
    childBefore(pos: number): SyntaxNode$2 | null;
    enter(pos: number, side: -1 | 0 | 1, mode?: IterMode$2): SyntaxNode$2 | null;
    nextSibling: SyntaxNode$2 | null;
    prevSibling: SyntaxNode$2 | null;
    cursor(mode?: IterMode$2): TreeCursor$2;
    resolve(pos: number, side?: -1 | 0 | 1): SyntaxNode$2;
    resolveInner(pos: number, side?: -1 | 0 | 1): SyntaxNode$2;
    enterUnfinishedNodesBefore(pos: number): SyntaxNode$2;
    toTree(): Tree$2;
    getChild(type: string | number, before?: string | number | null, after?: string | number | null): SyntaxNode$2 | null;
    getChildren(type: string | number, before?: string | number | null, after?: string | number | null): SyntaxNode$2[];
    matchContext(context: readonly string[]): boolean;
}
declare class TreeCursor$2 implements SyntaxNodeRef$2 {
    type: NodeType$2;
    get name(): string;
    from: number;
    to: number;
    private stack;
    private bufferNode;
    private yieldNode;
    private yieldBuf;
    private yield;
    firstChild(): boolean;
    lastChild(): boolean;
    childAfter(pos: number): boolean;
    childBefore(pos: number): boolean;
    enter(pos: number, side: -1 | 0 | 1, mode?: IterMode$2): boolean;
    parent(): boolean;
    nextSibling(): boolean;
    prevSibling(): boolean;
    private atLastNode;
    private move;
    next(enter?: boolean): boolean;
    prev(enter?: boolean): boolean;
    moveTo(pos: number, side?: -1 | 0 | 1): this;
    get node(): SyntaxNode$2;
    get tree(): Tree$2 | null;
    iterate(enter: (node: SyntaxNodeRef$2) => boolean | void, leave?: (node: SyntaxNodeRef$2) => void): void;
    matchContext(context: readonly string[]): boolean;
}

interface NestedParse {
    parser: Parser$2;
    overlay?: readonly {
        from: number;
        to: number;
    }[] | ((node: SyntaxNodeRef$2) => {
        from: number;
        to: number;
    } | boolean);
}
declare function parseMixed(nest: (node: SyntaxNodeRef$2, input: Input$2) => NestedParse | null): ParseWrapper$1;

interface CompletionConfig {
    /**
    When enabled (defaults to true), autocompletion will start
    whenever the user types something that can be completed.
    */
    activateOnTyping?: boolean;
    /**
    By default, when completion opens, the first option is selected
    and can be confirmed with
    [`acceptCompletion`](https://codemirror.net/6/docs/ref/#autocomplete.acceptCompletion). When this
    is set to false, the completion widget starts with no completion
    selected, and the user has to explicitly move to a completion
    before you can confirm one.
    */
    selectOnOpen?: boolean;
    /**
    Override the completion sources used. By default, they will be
    taken from the `"autocomplete"` [language
    data](https://codemirror.net/6/docs/ref/#state.EditorState.languageDataAt) (which should hold
    [completion sources](https://codemirror.net/6/docs/ref/#autocomplete.CompletionSource) or arrays
    of [completions](https://codemirror.net/6/docs/ref/#autocomplete.Completion)).
    */
    override?: readonly CompletionSource[] | null;
    /**
    Determines whether the completion tooltip is closed when the
    editor loses focus. Defaults to true.
    */
    closeOnBlur?: boolean;
    /**
    The maximum number of options to render to the DOM.
    */
    maxRenderedOptions?: number;
    /**
    Set this to false to disable the [default completion
    keymap](https://codemirror.net/6/docs/ref/#autocomplete.completionKeymap). (This requires you to
    add bindings to control completion yourself. The bindings should
    probably have a higher precedence than other bindings for the
    same keys.)
    */
    defaultKeymap?: boolean;
    /**
    By default, completions are shown below the cursor when there is
    space. Setting this to true will make the extension put the
    completions above the cursor when possible.
    */
    aboveCursor?: boolean;
    /**
    This can be used to add additional CSS classes to completion
    options.
    */
    optionClass?: (completion: Completion$1) => string;
    /**
    By default, the library will render icons based on the
    completion's [type](https://codemirror.net/6/docs/ref/#autocomplete.Completion.type) in front of
    each option. Set this to false to turn that off.
    */
    icons?: boolean;
    /**
    This option can be used to inject additional content into
    options. The `render` function will be called for each visible
    completion, and should produce a DOM node to show. `position`
    determines where in the DOM the result appears, relative to
    other added widgets and the standard content. The default icons
    have position 20, the label position 50, and the detail position
    80.
    */
    addToOptions?: {
        render: (completion: Completion$1, state: EditorState$5) => Node | null;
        position: number;
    }[];
    /**
    The comparison function to use when sorting completions with the same
    match score. Defaults to using
    [`localeCompare`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare).
    */
    compareCompletions?: (a: Completion$1, b: Completion$1) => number;
    /**
    By default, commands relating to an open completion only take
    effect 75 milliseconds after the completion opened, so that key
    presses made before the user is aware of the tooltip don't go to
    the tooltip. This option can be used to configure that delay.
    */
    interactionDelay?: number;
}

/**
Objects type used to represent individual completions.
*/
interface Completion$1 {
    /**
    The label to show in the completion picker. This is what input
    is matched agains to determine whether a completion matches (and
    how well it matches).
    */
    label: string;
    /**
    An optional short piece of information to show (with a different
    style) after the label.
    */
    detail?: string;
    /**
    Additional info to show when the completion is selected. Can be
    a plain string or a function that'll render the DOM structure to
    show when invoked.
    */
    info?: string | ((completion: Completion$1) => (Node | null | Promise<Node | null>));
    /**
    How to apply the completion. The default is to replace it with
    its [label](https://codemirror.net/6/docs/ref/#autocomplete.Completion.label). When this holds a
    string, the completion range is replaced by that string. When it
    is a function, that function is called to perform the
    completion. If it fires a transaction, it is responsible for
    adding the [`pickedCompletion`](https://codemirror.net/6/docs/ref/#autocomplete.pickedCompletion)
    annotation to it.
    */
    apply?: string | ((view: EditorView$3, completion: Completion$1, from: number, to: number) => void);
    /**
    The type of the completion. This is used to pick an icon to show
    for the completion. Icons are styled with a CSS class created by
    appending the type name to `"cm-completionIcon-"`. You can
    define or restyle icons by defining these selectors. The base
    library defines simple icons for `class`, `constant`, `enum`,
    `function`, `interface`, `keyword`, `method`, `namespace`,
    `property`, `text`, `type`, and `variable`.
    
    Multiple types can be provided by separating them with spaces.
    */
    type?: string;
    /**
    When given, should be a number from -99 to 99 that adjusts how
    this completion is ranked compared to other completions that
    match the input as well as this one. A negative number moves it
    down the list, a positive number moves it up.
    */
    boost?: number;
}
/**
An instance of this is passed to completion source functions.
*/
declare class CompletionContext {
    /**
    The editor state that the completion happens in.
    */
    readonly state: EditorState$5;
    /**
    The position at which the completion is happening.
    */
    readonly pos: number;
    /**
    Indicates whether completion was activated explicitly, or
    implicitly by typing. The usual way to respond to this is to
    only return completions when either there is part of a
    completable entity before the cursor, or `explicit` is true.
    */
    readonly explicit: boolean;
    /**
    Create a new completion context. (Mostly useful for testing
    completion sources—in the editor, the extension will create
    these for you.)
    */
    constructor(
    /**
    The editor state that the completion happens in.
    */
    state: EditorState$5, 
    /**
    The position at which the completion is happening.
    */
    pos: number, 
    /**
    Indicates whether completion was activated explicitly, or
    implicitly by typing. The usual way to respond to this is to
    only return completions when either there is part of a
    completable entity before the cursor, or `explicit` is true.
    */
    explicit: boolean);
    /**
    Get the extent, content, and (if there is a token) type of the
    token before `this.pos`.
    */
    tokenBefore(types: readonly string[]): {
        from: number;
        to: number;
        text: string;
        type: NodeType$2;
    } | null;
    /**
    Get the match of the given expression directly before the
    cursor.
    */
    matchBefore(expr: RegExp): {
        from: number;
        to: number;
        text: string;
    } | null;
    /**
    Yields true when the query has been aborted. Can be useful in
    asynchronous queries to avoid doing work that will be ignored.
    */
    get aborted(): boolean;
    /**
    Allows you to register abort handlers, which will be called when
    the query is
    [aborted](https://codemirror.net/6/docs/ref/#autocomplete.CompletionContext.aborted).
    */
    addEventListener(type: "abort", listener: () => void): void;
}
/**
Given a a fixed array of options, return an autocompleter that
completes them.
*/
declare function completeFromList(list: readonly (string | Completion$1)[]): CompletionSource;
/**
Wrap the given completion source so that it will only fire when the
cursor is in a syntax node with one of the given names.
*/
declare function ifIn(nodes: readonly string[], source: CompletionSource): CompletionSource;
/**
Wrap the given completion source so that it will not fire when the
cursor is in a syntax node with one of the given names.
*/
declare function ifNotIn(nodes: readonly string[], source: CompletionSource): CompletionSource;
/**
The function signature for a completion source. Such a function
may return its [result](https://codemirror.net/6/docs/ref/#autocomplete.CompletionResult)
synchronously or as a promise. Returning null indicates no
completions are available.
*/
declare type CompletionSource = (context: CompletionContext) => CompletionResult | null | Promise<CompletionResult | null>;
/**
Interface for objects returned by completion sources.
*/
interface CompletionResult {
    /**
    The start of the range that is being completed.
    */
    from: number;
    /**
    The end of the range that is being completed. Defaults to the
    main cursor position.
    */
    to?: number;
    /**
    The completions returned. These don't have to be compared with
    the input by the source—the autocompletion system will do its
    own matching (against the text between `from` and `to`) and
    sorting.
    */
    options: readonly Completion$1[];
    /**
    When given, further typing or deletion that causes the part of
    the document between ([mapped](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) `from`
    and `to` to match this regular expression or predicate function
    will not query the completion source again, but continue with
    this list of options. This can help a lot with responsiveness,
    since it allows the completion list to be updated synchronously.
    */
    validFor?: RegExp | ((text: string, from: number, to: number, state: EditorState$5) => boolean);
    /**
    By default, the library filters and scores completions. Set
    `filter` to `false` to disable this, and cause your completions
    to all be included, in the order they were given. When there are
    other sources, unfiltered completions appear at the top of the
    list of completions. `validFor` must not be given when `filter`
    is `false`, because it only works when filtering.
    */
    filter?: boolean;
    /**
    When [`filter`](https://codemirror.net/6/docs/ref/#autocomplete.CompletionResult.filter) is set to
    `false`, this may be provided to compute the ranges on the label
    that match the input. Should return an array of numbers where
    each pair of adjacent numbers provide the start and end of a
    range.
    */
    getMatch?: (completion: Completion$1) => readonly number[];
    /**
    Synchronously update the completion result after typing or
    deletion. If given, this should not do any expensive work, since
    it will be called during editor state updates. The function
    should make sure (similar to
    [`validFor`](https://codemirror.net/6/docs/ref/#autocomplete.CompletionResult.validFor)) that the
    completion still applies in the new state.
    */
    update?: (current: CompletionResult, from: number, to: number, context: CompletionContext) => CompletionResult | null;
}
/**
This annotation is added to transactions that are produced by
picking a completion.
*/
declare const pickedCompletion: AnnotationType$5<Completion$1>;
/**
Helper function that returns a transaction spec which inserts a
completion's text in the main selection range, and any other
selection range that has the same text in front of it.
*/
declare function insertCompletionText(state: EditorState$5, text: string, from: number, to: number): TransactionSpec$5;

/**
Convert a snippet template to a function that can
[apply](https://codemirror.net/6/docs/ref/#autocomplete.Completion.apply) it. Snippets are written
using syntax like this:

    "for (let ${index} = 0; ${index} < ${end}; ${index}++) {\n\t${}\n}"

Each `${}` placeholder (you may also use `#{}`) indicates a field
that the user can fill in. Its name, if any, will be the default
content for the field.

When the snippet is activated by calling the returned function,
the code is inserted at the given position. Newlines in the
template are indented by the indentation of the start line, plus
one [indent unit](https://codemirror.net/6/docs/ref/#language.indentUnit) per tab character after
the newline.

On activation, (all instances of) the first field are selected.
The user can move between fields with Tab and Shift-Tab as long as
the fields are active. Moving to the last field or moving the
cursor out of the current field deactivates the fields.

The order of fields defaults to textual order, but you can add
numbers to placeholders (`${1}` or `${1:defaultText}`) to provide
a custom order.

To include a literal `{` or `}` in your template, put a backslash
in front of it. This will be removed and the brace will not be
interpreted as indicating a placeholder.
*/
declare function snippet(template: string): (editor: {
    state: EditorState$5;
    dispatch: (tr: Transaction$5) => void;
}, _completion: Completion$1, from: number, to: number) => void;
/**
A command that clears the active snippet, if any.
*/
declare const clearSnippet: StateCommand$2;
/**
Move to the next snippet field, if available.
*/
declare const nextSnippetField: StateCommand$2;
/**
Move to the previous snippet field, if available.
*/
declare const prevSnippetField: StateCommand$2;
/**
A facet that can be used to configure the key bindings used by
snippets. The default binds Tab to
[`nextSnippetField`](https://codemirror.net/6/docs/ref/#autocomplete.nextSnippetField), Shift-Tab to
[`prevSnippetField`](https://codemirror.net/6/docs/ref/#autocomplete.prevSnippetField), and Escape
to [`clearSnippet`](https://codemirror.net/6/docs/ref/#autocomplete.clearSnippet).
*/
declare const snippetKeymap: Facet$5<readonly KeyBinding$2[], readonly KeyBinding$2[]>;
/**
Create a completion from a snippet. Returns an object with the
properties from `completion`, plus an `apply` function that
applies the snippet.
*/
declare function snippetCompletion(template: string, completion: Completion$1): Completion$1;

/**
Returns a command that moves the completion selection forward or
backward by the given amount.
*/
declare function moveCompletionSelection(forward: boolean, by?: "option" | "page"): Command$2;
/**
Accept the current completion.
*/
declare const acceptCompletion: Command$2;
/**
Explicitly start autocompletion.
*/
declare const startCompletion: Command$2;
/**
Close the currently active completion.
*/
declare const closeCompletion: Command$2;

/**
A completion source that will scan the document for words (using a
[character categorizer](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer)), and
return those as completions.
*/
declare const completeAnyWord: CompletionSource;

/**
Configures bracket closing behavior for a syntax (via
[language data](https://codemirror.net/6/docs/ref/#state.EditorState.languageDataAt)) using the `"closeBrackets"`
identifier.
*/
interface CloseBracketConfig {
    /**
    The opening brackets to close. Defaults to `["(", "[", "{", "'",
    '"']`. Brackets may be single characters or a triple of quotes
    (as in `"''''"`).
    */
    brackets?: string[];
    /**
    Characters in front of which newly opened brackets are
    automatically closed. Closing always happens in front of
    whitespace. Defaults to `")]}:;>"`.
    */
    before?: string;
    /**
    When determining whether a given node may be a string, recognize
    these prefixes before the opening quote.
    */
    stringPrefixes?: string[];
}
/**
Extension to enable bracket-closing behavior. When a closeable
bracket is typed, its closing bracket is immediately inserted
after the cursor. When closing a bracket directly in front of a
closing bracket inserted by the extension, the cursor moves over
that bracket.
*/
declare function closeBrackets(): Extension$5;
/**
Command that implements deleting a pair of matching brackets when
the cursor is between them.
*/
declare const deleteBracketPair: StateCommand$2;
/**
Close-brackets related key bindings. Binds Backspace to
[`deleteBracketPair`](https://codemirror.net/6/docs/ref/#autocomplete.deleteBracketPair).
*/
declare const closeBracketsKeymap: readonly KeyBinding$2[];
/**
Implements the extension's behavior on text insertion. If the
given string counts as a bracket in the language around the
selection, and replacing the selection with it requires custom
behavior (inserting a closing version or skipping past a
previously-closed bracket), this function returns a transaction
representing that custom behavior. (You only need this if you want
to programmatically insert brackets—the
[`closeBrackets`](https://codemirror.net/6/docs/ref/#autocomplete.closeBrackets) extension will
take care of running this for user input.)
*/
declare function insertBracket(state: EditorState$5, bracket: string): Transaction$5 | null;

/**
Returns an extension that enables autocompletion.
*/
declare function autocompletion(config?: CompletionConfig): Extension$5;
/**
Basic keybindings for autocompletion.

 - Ctrl-Space: [`startCompletion`](https://codemirror.net/6/docs/ref/#autocomplete.startCompletion)
 - Escape: [`closeCompletion`](https://codemirror.net/6/docs/ref/#autocomplete.closeCompletion)
 - ArrowDown: [`moveCompletionSelection`](https://codemirror.net/6/docs/ref/#autocomplete.moveCompletionSelection)`(true)`
 - ArrowUp: [`moveCompletionSelection`](https://codemirror.net/6/docs/ref/#autocomplete.moveCompletionSelection)`(false)`
 - PageDown: [`moveCompletionSelection`](https://codemirror.net/6/docs/ref/#autocomplete.moveCompletionSelection)`(true, "page")`
 - PageDown: [`moveCompletionSelection`](https://codemirror.net/6/docs/ref/#autocomplete.moveCompletionSelection)`(true, "page")`
 - Enter: [`acceptCompletion`](https://codemirror.net/6/docs/ref/#autocomplete.acceptCompletion)
*/
declare const completionKeymap: readonly KeyBinding$2[];
/**
Get the current completion status. When completions are available,
this will return `"active"`. When completions are pending (in the
process of being queried), this returns `"pending"`. Otherwise, it
returns `null`.
*/
declare function completionStatus(state: EditorState$5): null | "active" | "pending";
/**
Returns the available completions as an array.
*/
declare function currentCompletions(state: EditorState$5): readonly Completion$1[];
/**
Return the currently selected completion, if any.
*/
declare function selectedCompletion(state: EditorState$5): Completion$1 | null;
/**
Returns the currently selected position in the active completion
list, or null if no completions are active.
*/
declare function selectedCompletionIndex(state: EditorState$5): number | null;
/**
Create an effect that can be attached to a transaction to change
the currently selected completion.
*/
declare function setSelectedCompletion(index: number): StateEffect$5<unknown>;

type index_d_CloseBracketConfig = CloseBracketConfig;
type index_d_CompletionContext = CompletionContext;
declare const index_d_CompletionContext: typeof CompletionContext;
type index_d_CompletionResult = CompletionResult;
type index_d_CompletionSource = CompletionSource;
declare const index_d_acceptCompletion: typeof acceptCompletion;
declare const index_d_autocompletion: typeof autocompletion;
declare const index_d_clearSnippet: typeof clearSnippet;
declare const index_d_closeBrackets: typeof closeBrackets;
declare const index_d_closeBracketsKeymap: typeof closeBracketsKeymap;
declare const index_d_closeCompletion: typeof closeCompletion;
declare const index_d_completeAnyWord: typeof completeAnyWord;
declare const index_d_completeFromList: typeof completeFromList;
declare const index_d_completionKeymap: typeof completionKeymap;
declare const index_d_completionStatus: typeof completionStatus;
declare const index_d_currentCompletions: typeof currentCompletions;
declare const index_d_deleteBracketPair: typeof deleteBracketPair;
declare const index_d_ifIn: typeof ifIn;
declare const index_d_ifNotIn: typeof ifNotIn;
declare const index_d_insertBracket: typeof insertBracket;
declare const index_d_insertCompletionText: typeof insertCompletionText;
declare const index_d_moveCompletionSelection: typeof moveCompletionSelection;
declare const index_d_nextSnippetField: typeof nextSnippetField;
declare const index_d_pickedCompletion: typeof pickedCompletion;
declare const index_d_prevSnippetField: typeof prevSnippetField;
declare const index_d_selectedCompletion: typeof selectedCompletion;
declare const index_d_selectedCompletionIndex: typeof selectedCompletionIndex;
declare const index_d_setSelectedCompletion: typeof setSelectedCompletion;
declare const index_d_snippet: typeof snippet;
declare const index_d_snippetCompletion: typeof snippetCompletion;
declare const index_d_snippetKeymap: typeof snippetKeymap;
declare const index_d_startCompletion: typeof startCompletion;
declare namespace index_d {
  export {
    index_d_CloseBracketConfig as CloseBracketConfig,
    Completion$1 as Completion,
    index_d_CompletionContext as CompletionContext,
    index_d_CompletionResult as CompletionResult,
    index_d_CompletionSource as CompletionSource,
    index_d_acceptCompletion as acceptCompletion,
    index_d_autocompletion as autocompletion,
    index_d_clearSnippet as clearSnippet,
    index_d_closeBrackets as closeBrackets,
    index_d_closeBracketsKeymap as closeBracketsKeymap,
    index_d_closeCompletion as closeCompletion,
    index_d_completeAnyWord as completeAnyWord,
    index_d_completeFromList as completeFromList,
    index_d_completionKeymap as completionKeymap,
    index_d_completionStatus as completionStatus,
    index_d_currentCompletions as currentCompletions,
    index_d_deleteBracketPair as deleteBracketPair,
    index_d_ifIn as ifIn,
    index_d_ifNotIn as ifNotIn,
    index_d_insertBracket as insertBracket,
    index_d_insertCompletionText as insertCompletionText,
    index_d_moveCompletionSelection as moveCompletionSelection,
    index_d_nextSnippetField as nextSnippetField,
    index_d_pickedCompletion as pickedCompletion,
    index_d_prevSnippetField as prevSnippetField,
    index_d_selectedCompletion as selectedCompletion,
    index_d_selectedCompletionIndex as selectedCompletionIndex,
    index_d_setSelectedCompletion as setSelectedCompletion,
    index_d_snippet as snippet,
    index_d_snippetCompletion as snippetCompletion,
    index_d_snippetKeymap as snippetKeymap,
    index_d_startCompletion as startCompletion,
  };
}

/**
A text iterator iterates over a sequence of strings. When
iterating over a [`Text`](https://codemirror.net/6/docs/ref/#state.Text) document, result values will
either be lines or line breaks.
*/
interface TextIterator$2 extends Iterator<string>, Iterable<string> {
    /**
    Retrieve the next string. Optionally skip a given number of
    positions after the current position. Always returns the object
    itself.
    */
    next(skip?: number): this;
    /**
    The current string. Will be the empty string when the cursor is
    at its end or `next` hasn't been called on it yet.
    */
    value: string;
    /**
    Whether the end of the iteration has been reached. You should
    probably check this right after calling `next`.
    */
    done: boolean;
    /**
    Whether the current string represents a line break.
    */
    lineBreak: boolean;
}
/**
The data structure for documents. @nonabstract
*/
declare abstract class Text$2 implements Iterable<string> {
    /**
    The length of the string.
    */
    abstract readonly length: number;
    /**
    The number of lines in the string (always >= 1).
    */
    abstract readonly lines: number;
    /**
    Get the line description around the given position.
    */
    lineAt(pos: number): Line$3;
    /**
    Get the description for the given (1-based) line number.
    */
    line(n: number): Line$3;
    /**
    Replace a range of the text with the given content.
    */
    replace(from: number, to: number, text: Text$2): Text$2;
    /**
    Append another document to this one.
    */
    append(other: Text$2): Text$2;
    /**
    Retrieve the text between the given points.
    */
    slice(from: number, to?: number): Text$2;
    /**
    Retrieve a part of the document as a string
    */
    abstract sliceString(from: number, to?: number, lineSep?: string): string;
    /**
    Test whether this text is equal to another instance.
    */
    eq(other: Text$2): boolean;
    /**
    Iterate over the text. When `dir` is `-1`, iteration happens
    from end to start. This will return lines and the breaks between
    them as separate strings.
    */
    iter(dir?: 1 | -1): TextIterator$2;
    /**
    Iterate over a range of the text. When `from` > `to`, the
    iterator will run in reverse.
    */
    iterRange(from: number, to?: number): TextIterator$2;
    /**
    Return a cursor that iterates over the given range of lines,
    _without_ returning the line breaks between, and yielding empty
    strings for empty lines.
    
    When `from` and `to` are given, they should be 1-based line numbers.
    */
    iterLines(from?: number, to?: number): TextIterator$2;
    /**
    Convert the document to an array of lines (which can be
    deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#state.Text^of)).
    */
    toJSON(): string[];
    /**
    If this is a branch node, `children` will hold the `Text`
    objects that it is made up of. For leaf nodes, this holds null.
    */
    abstract readonly children: readonly Text$2[] | null;
    [Symbol.iterator]: () => Iterator<string>;
    /**
    Create a `Text` instance for the given array of lines.
    */
    static of(text: readonly string[]): Text$2;
    /**
    The empty document.
    */
    static empty: Text$2;
}
/**
This type describes a line in the document. It is created
on-demand when lines are [queried](https://codemirror.net/6/docs/ref/#state.Text.lineAt).
*/
declare class Line$3 {
    /**
    The position of the start of the line.
    */
    readonly from: number;
    /**
    The position at the end of the line (_before_ the line break,
    or at the end of document for the last line).
    */
    readonly to: number;
    /**
    This line's line number (1-based).
    */
    readonly number: number;
    /**
    The line's content.
    */
    readonly text: string;
    /**
    The length of the line (not including any line break after it).
    */
    get length(): number;
}

/**
Distinguishes different ways in which positions can be mapped.
*/
declare enum MapMode$2 {
    /**
    Map a position to a valid new position, even when its context
    was deleted.
    */
    Simple = 0,
    /**
    Return null if deletion happens across the position.
    */
    TrackDel = 1,
    /**
    Return null if the character _before_ the position is deleted.
    */
    TrackBefore = 2,
    /**
    Return null if the character _after_ the position is deleted.
    */
    TrackAfter = 3
}
/**
A change description is a variant of [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet)
that doesn't store the inserted text. As such, it can't be
applied, but is cheaper to store and manipulate.
*/
declare class ChangeDesc$2 {
    /**
    The length of the document before the change.
    */
    get length(): number;
    /**
    The length of the document after the change.
    */
    get newLength(): number;
    /**
    False when there are actual changes in this set.
    */
    get empty(): boolean;
    /**
    Iterate over the unchanged parts left by these changes. `posA`
    provides the position of the range in the old document, `posB`
    the new position in the changed document.
    */
    iterGaps(f: (posA: number, posB: number, length: number) => void): void;
    /**
    Iterate over the ranges changed by these changes. (See
    [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
    variant that also provides you with the inserted text.)
    `fromA`/`toA` provides the extent of the change in the starting
    document, `fromB`/`toB` the extent of the replacement in the
    changed document.
    
    When `individual` is true, adjacent changes (which are kept
    separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
    reported separately.
    */
    iterChangedRanges(f: (fromA: number, toA: number, fromB: number, toB: number) => void, individual?: boolean): void;
    /**
    Get a description of the inverted form of these changes.
    */
    get invertedDesc(): ChangeDesc$2;
    /**
    Compute the combined effect of applying another set of changes
    after this one. The length of the document after this set should
    match the length before `other`.
    */
    composeDesc(other: ChangeDesc$2): ChangeDesc$2;
    /**
    Map this description, which should start with the same document
    as `other`, over another set of changes, so that it can be
    applied after it. When `before` is true, map as if the changes
    in `other` happened before the ones in `this`.
    */
    mapDesc(other: ChangeDesc$2, before?: boolean): ChangeDesc$2;
    /**
    Map a given position through these changes, to produce a
    position pointing into the new document.
    
    `assoc` indicates which side the position should be associated
    with. When it is negative or zero, the mapping will try to keep
    the position close to the character before it (if any), and will
    move it before insertions at that point or replacements across
    that point. When it is positive, the position is associated with
    the character after it, and will be moved forward for insertions
    at or replacements across the position. Defaults to -1.
    
    `mode` determines whether deletions should be
    [reported](https://codemirror.net/6/docs/ref/#state.MapMode). It defaults to
    [`MapMode.Simple`](https://codemirror.net/6/docs/ref/#state.MapMode.Simple) (don't report
    deletions).
    */
    mapPos(pos: number, assoc?: number): number;
    mapPos(pos: number, assoc: number, mode: MapMode$2): number | null;
    /**
    Check whether these changes touch a given range. When one of the
    changes entirely covers the range, the string `"cover"` is
    returned.
    */
    touchesRange(from: number, to?: number): boolean | "cover";
    /**
    Serialize this change desc to a JSON-representable value.
    */
    toJSON(): readonly number[];
    /**
    Create a change desc from its JSON representation (as produced
    by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
    */
    static fromJSON(json: any): ChangeDesc$2;
}
/**
This type is used as argument to
[`EditorState.changes`](https://codemirror.net/6/docs/ref/#state.EditorState.changes) and in the
[`changes` field](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) of transaction
specs to succinctly describe document changes. It may either be a
plain object describing a change (a deletion, insertion, or
replacement, depending on which fields are present), a [change
set](https://codemirror.net/6/docs/ref/#state.ChangeSet), or an array of change specs.
*/
declare type ChangeSpec$2 = {
    from: number;
    to?: number;
    insert?: string | Text$2;
} | ChangeSet$2 | readonly ChangeSpec$2[];
/**
A change set represents a group of modifications to a document. It
stores the document length, and can only be applied to documents
with exactly that length.
*/
declare class ChangeSet$2 extends ChangeDesc$2 {
    private constructor();
    /**
    Apply the changes to a document, returning the modified
    document.
    */
    apply(doc: Text$2): Text$2;
    mapDesc(other: ChangeDesc$2, before?: boolean): ChangeDesc$2;
    /**
    Given the document as it existed _before_ the changes, return a
    change set that represents the inverse of this set, which could
    be used to go from the document created by the changes back to
    the document as it existed before the changes.
    */
    invert(doc: Text$2): ChangeSet$2;
    /**
    Combine two subsequent change sets into a single set. `other`
    must start in the document produced by `this`. If `this` goes
    `docA` → `docB` and `other` represents `docB` → `docC`, the
    returned value will represent the change `docA` → `docC`.
    */
    compose(other: ChangeSet$2): ChangeSet$2;
    /**
    Given another change set starting in the same document, maps this
    change set over the other, producing a new change set that can be
    applied to the document produced by applying `other`. When
    `before` is `true`, order changes as if `this` comes before
    `other`, otherwise (the default) treat `other` as coming first.
    
    Given two changes `A` and `B`, `A.compose(B.map(A))` and
    `B.compose(A.map(B, true))` will produce the same document. This
    provides a basic form of [operational
    transformation](https://en.wikipedia.org/wiki/Operational_transformation),
    and can be used for collaborative editing.
    */
    map(other: ChangeDesc$2, before?: boolean): ChangeSet$2;
    /**
    Iterate over the changed ranges in the document, calling `f` for
    each, with the range in the original document (`fromA`-`toA`)
    and the range that replaces it in the new document
    (`fromB`-`toB`).
    
    When `individual` is true, adjacent changes are reported
    separately.
    */
    iterChanges(f: (fromA: number, toA: number, fromB: number, toB: number, inserted: Text$2) => void, individual?: boolean): void;
    /**
    Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
    set.
    */
    get desc(): ChangeDesc$2;
    /**
    Serialize this change set to a JSON-representable value.
    */
    toJSON(): any;
    /**
    Create a change set for the given changes, for a document of the
    given length, using `lineSep` as line separator.
    */
    static of(changes: ChangeSpec$2, length: number, lineSep?: string): ChangeSet$2;
    /**
    Create an empty changeset of the given length.
    */
    static empty(length: number): ChangeSet$2;
    /**
    Create a changeset from its JSON representation (as produced by
    [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
    */
    static fromJSON(json: any): ChangeSet$2;
}

/**
A single selection range. When
[`allowMultipleSelections`](https://codemirror.net/6/docs/ref/#state.EditorState^allowMultipleSelections)
is enabled, a [selection](https://codemirror.net/6/docs/ref/#state.EditorSelection) may hold
multiple ranges. By default, selections hold exactly one range.
*/
declare class SelectionRange$2 {
    /**
    The lower boundary of the range.
    */
    readonly from: number;
    /**
    The upper boundary of the range.
    */
    readonly to: number;
    private flags;
    private constructor();
    /**
    The anchor of the range—the side that doesn't move when you
    extend it.
    */
    get anchor(): number;
    /**
    The head of the range, which is moved when the range is
    [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
    */
    get head(): number;
    /**
    True when `anchor` and `head` are at the same position.
    */
    get empty(): boolean;
    /**
    If this is a cursor that is explicitly associated with the
    character on one of its sides, this returns the side. -1 means
    the character before its position, 1 the character after, and 0
    means no association.
    */
    get assoc(): -1 | 0 | 1;
    /**
    The bidirectional text level associated with this cursor, if
    any.
    */
    get bidiLevel(): number | null;
    /**
    The goal column (stored vertical offset) associated with a
    cursor. This is used to preserve the vertical position when
    [moving](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) across
    lines of different length.
    */
    get goalColumn(): number | undefined;
    /**
    Map this range through a change, producing a valid range in the
    updated document.
    */
    map(change: ChangeDesc$2, assoc?: number): SelectionRange$2;
    /**
    Extend this range to cover at least `from` to `to`.
    */
    extend(from: number, to?: number): SelectionRange$2;
    /**
    Compare this range to another range.
    */
    eq(other: SelectionRange$2): boolean;
    /**
    Return a JSON-serializable object representing the range.
    */
    toJSON(): any;
    /**
    Convert a JSON representation of a range to a `SelectionRange`
    instance.
    */
    static fromJSON(json: any): SelectionRange$2;
}
/**
An editor selection holds one or more selection ranges.
*/
declare class EditorSelection$2 {
    /**
    The ranges in the selection, sorted by position. Ranges cannot
    overlap (but they may touch, if they aren't empty).
    */
    readonly ranges: readonly SelectionRange$2[];
    /**
    The index of the _main_ range in the selection (which is
    usually the range that was added last).
    */
    readonly mainIndex: number;
    private constructor();
    /**
    Map a selection through a change. Used to adjust the selection
    position for changes.
    */
    map(change: ChangeDesc$2, assoc?: number): EditorSelection$2;
    /**
    Compare this selection to another selection.
    */
    eq(other: EditorSelection$2): boolean;
    /**
    Get the primary selection range. Usually, you should make sure
    your code applies to _all_ ranges, by using methods like
    [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
    */
    get main(): SelectionRange$2;
    /**
    Make sure the selection only has one range. Returns a selection
    holding only the main range from this selection.
    */
    asSingle(): EditorSelection$2;
    /**
    Extend this selection with an extra range.
    */
    addRange(range: SelectionRange$2, main?: boolean): EditorSelection$2;
    /**
    Replace a given range with another range, and then normalize the
    selection to merge and sort ranges if necessary.
    */
    replaceRange(range: SelectionRange$2, which?: number): EditorSelection$2;
    /**
    Convert this selection to an object that can be serialized to
    JSON.
    */
    toJSON(): any;
    /**
    Create a selection from a JSON representation.
    */
    static fromJSON(json: any): EditorSelection$2;
    /**
    Create a selection holding a single range.
    */
    static single(anchor: number, head?: number): EditorSelection$2;
    /**
    Sort and merge the given set of ranges, creating a valid
    selection.
    */
    static create(ranges: readonly SelectionRange$2[], mainIndex?: number): EditorSelection$2;
    /**
    Create a cursor selection range at the given position. You can
    safely ignore the optional arguments in most situations.
    */
    static cursor(pos: number, assoc?: number, bidiLevel?: number, goalColumn?: number): SelectionRange$2;
    /**
    Create a selection range.
    */
    static range(anchor: number, head: number, goalColumn?: number): SelectionRange$2;
}

declare type FacetConfig$2<Input, Output> = {
    /**
    How to combine the input values into a single output value. When
    not given, the array of input values becomes the output. This
    function will immediately be called on creating the facet, with
    an empty array, to compute the facet's default value when no
    inputs are present.
    */
    combine?: (value: readonly Input[]) => Output;
    /**
    How to compare output values to determine whether the value of
    the facet changed. Defaults to comparing by `===` or, if no
    `combine` function was given, comparing each element of the
    array with `===`.
    */
    compare?: (a: Output, b: Output) => boolean;
    /**
    How to compare input values to avoid recomputing the output
    value when no inputs changed. Defaults to comparing with `===`.
    */
    compareInput?: (a: Input, b: Input) => boolean;
    /**
    Forbids dynamic inputs to this facet.
    */
    static?: boolean;
    /**
    If given, these extension(s) (or the result of calling the given
    function with the facet) will be added to any state where this
    facet is provided. (Note that, while a facet's default value can
    be read from a state even if the facet wasn't present in the
    state at all, these extensions won't be added in that
    situation.)
    */
    enables?: Extension$2 | ((self: Facet$2<Input, Output>) => Extension$2);
};
/**
A facet is a labeled value that is associated with an editor
state. It takes inputs from any number of extensions, and combines
those into a single output value.

Examples of uses of facets are the [tab
size](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize), [editor
attributes](https://codemirror.net/6/docs/ref/#view.EditorView^editorAttributes), and [update
listeners](https://codemirror.net/6/docs/ref/#view.EditorView^updateListener).
*/
declare class Facet$2<Input, Output = readonly Input[]> {
    private isStatic;
    private constructor();
    /**
    Define a new facet.
    */
    static define<Input, Output = readonly Input[]>(config?: FacetConfig$2<Input, Output>): Facet$2<Input, Output>;
    /**
    Returns an extension that adds the given value to this facet.
    */
    of(value: Input): Extension$2;
    /**
    Create an extension that computes a value for the facet from a
    state. You must take care to declare the parts of the state that
    this value depends on, since your function is only called again
    for a new state when one of those parts changed.
    
    In cases where your value depends only on a single field, you'll
    want to use the [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method instead.
    */
    compute(deps: readonly Slot$2<any>[], get: (state: EditorState$2) => Input): Extension$2;
    /**
    Create an extension that computes zero or more values for this
    facet from a state.
    */
    computeN(deps: readonly Slot$2<any>[], get: (state: EditorState$2) => readonly Input[]): Extension$2;
    /**
    Shorthand method for registering a facet source with a state
    field as input. If the field's type corresponds to this facet's
    input type, the getter function can be omitted. If given, it
    will be used to retrieve the input from the field value.
    */
    from<T extends Input>(field: StateField$2<T>): Extension$2;
    from<T>(field: StateField$2<T>, get: (value: T) => Input): Extension$2;
}
declare type Slot$2<T> = Facet$2<any, T> | StateField$2<T> | "doc" | "selection";
declare type StateFieldSpec$2<Value> = {
    /**
    Creates the initial value for the field when a state is created.
    */
    create: (state: EditorState$2) => Value;
    /**
    Compute a new value from the field's previous value and a
    [transaction](https://codemirror.net/6/docs/ref/#state.Transaction).
    */
    update: (value: Value, transaction: Transaction$2) => Value;
    /**
    Compare two values of the field, returning `true` when they are
    the same. This is used to avoid recomputing facets that depend
    on the field when its value did not change. Defaults to using
    `===`.
    */
    compare?: (a: Value, b: Value) => boolean;
    /**
    Provide extensions based on this field. The given function will
    be called once with the initialized field. It will usually want
    to call some facet's [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method to
    create facet inputs from this field, but can also return other
    extensions that should be enabled when the field is present in a
    configuration.
    */
    provide?: (field: StateField$2<Value>) => Extension$2;
    /**
    A function used to serialize this field's content to JSON. Only
    necessary when this field is included in the argument to
    [`EditorState.toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON).
    */
    toJSON?: (value: Value, state: EditorState$2) => any;
    /**
    A function that deserializes the JSON representation of this
    field's content.
    */
    fromJSON?: (json: any, state: EditorState$2) => Value;
};
/**
Fields can store additional information in an editor state, and
keep it in sync with the rest of the state.
*/
declare class StateField$2<Value> {
    private createF;
    private updateF;
    private compareF;
    private constructor();
    /**
    Define a state field.
    */
    static define<Value>(config: StateFieldSpec$2<Value>): StateField$2<Value>;
    private create;
    /**
    Returns an extension that enables this field and overrides the
    way it is initialized. Can be useful when you need to provide a
    non-default starting value for the field.
    */
    init(create: (state: EditorState$2) => Value): Extension$2;
    /**
    State field instances can be used as
    [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
    given state.
    */
    get extension(): Extension$2;
}
/**
Extension values can be
[provided](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions) when creating a
state to attach various kinds of configuration and behavior
information. They can either be built-in extension-providing
objects, such as [state fields](https://codemirror.net/6/docs/ref/#state.StateField) or [facet
providers](https://codemirror.net/6/docs/ref/#state.Facet.of), or objects with an extension in its
`extension` property. Extensions can be nested in arrays
arbitrarily deep—they will be flattened when processed.
*/
declare type Extension$2 = {
    extension: Extension$2;
} | readonly Extension$2[];

/**
Annotations are tagged values that are used to add metadata to
transactions in an extensible way. They should be used to model
things that effect the entire transaction (such as its [time
stamp](https://codemirror.net/6/docs/ref/#state.Transaction^time) or information about its
[origin](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent)). For effects that happen
_alongside_ the other changes made by the transaction, [state
effects](https://codemirror.net/6/docs/ref/#state.StateEffect) are more appropriate.
*/
declare class Annotation$2<T> {
    /**
    The annotation type.
    */
    readonly type: AnnotationType$2<T>;
    /**
    The value of this annotation.
    */
    readonly value: T;
    /**
    Define a new type of annotation.
    */
    static define<T>(): AnnotationType$2<T>;
    private _isAnnotation;
}
/**
Marker that identifies a type of [annotation](https://codemirror.net/6/docs/ref/#state.Annotation).
*/
declare class AnnotationType$2<T> {
    /**
    Create an instance of this annotation.
    */
    of(value: T): Annotation$2<T>;
}
interface StateEffectSpec$2<Value> {
    /**
    Provides a way to map an effect like this through a position
    mapping. When not given, the effects will simply not be mapped.
    When the function returns `undefined`, that means the mapping
    deletes the effect.
    */
    map?: (value: Value, mapping: ChangeDesc$2) => Value | undefined;
}
/**
Representation of a type of state effect. Defined with
[`StateEffect.define`](https://codemirror.net/6/docs/ref/#state.StateEffect^define).
*/
declare class StateEffectType$2<Value> {
    /**
    @internal
    */
    readonly map: (value: any, mapping: ChangeDesc$2) => any | undefined;
    /**
    Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
    type.
    */
    of(value: Value): StateEffect$2<Value>;
}
/**
State effects can be used to represent additional effects
associated with a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction.effects). They
are often useful to model changes to custom [state
fields](https://codemirror.net/6/docs/ref/#state.StateField), when those changes aren't implicit in
document or selection changes.
*/
declare class StateEffect$2<Value> {
    /**
    The value of this effect.
    */
    readonly value: Value;
    /**
    Map this effect through a position mapping. Will return
    `undefined` when that ends up deleting the effect.
    */
    map(mapping: ChangeDesc$2): StateEffect$2<Value> | undefined;
    /**
    Tells you whether this effect object is of a given
    [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
    */
    is<T>(type: StateEffectType$2<T>): this is StateEffect$2<T>;
    /**
    Define a new effect type. The type parameter indicates the type
    of values that his effect holds.
    */
    static define<Value = null>(spec?: StateEffectSpec$2<Value>): StateEffectType$2<Value>;
    /**
    Map an array of effects through a change set.
    */
    static mapEffects(effects: readonly StateEffect$2<any>[], mapping: ChangeDesc$2): readonly StateEffect$2<any>[];
    /**
    This effect can be used to reconfigure the root extensions of
    the editor. Doing this will discard any extensions
    [appended](https://codemirror.net/6/docs/ref/#state.StateEffect^appendConfig), but does not reset
    the content of [reconfigured](https://codemirror.net/6/docs/ref/#state.Compartment.reconfigure)
    compartments.
    */
    static reconfigure: StateEffectType$2<Extension$2>;
    /**
    Append extensions to the top-level configuration of the editor.
    */
    static appendConfig: StateEffectType$2<Extension$2>;
}
/**
Describes a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) when calling the
[`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update) method.
*/
interface TransactionSpec$2 {
    /**
    The changes to the document made by this transaction.
    */
    changes?: ChangeSpec$2;
    /**
    When set, this transaction explicitly updates the selection.
    Offsets in this selection should refer to the document as it is
    _after_ the transaction.
    */
    selection?: EditorSelection$2 | {
        anchor: number;
        head?: number;
    };
    /**
    Attach [state effects](https://codemirror.net/6/docs/ref/#state.StateEffect) to this transaction.
    Again, when they contain positions and this same spec makes
    changes, those positions should refer to positions in the
    updated document.
    */
    effects?: StateEffect$2<any> | readonly StateEffect$2<any>[];
    /**
    Set [annotations](https://codemirror.net/6/docs/ref/#state.Annotation) for this transaction.
    */
    annotations?: Annotation$2<any> | readonly Annotation$2<any>[];
    /**
    Shorthand for `annotations:` [`Transaction.userEvent`](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent)`.of(...)`.
    */
    userEvent?: string;
    /**
    When set to `true`, the transaction is marked as needing to
    scroll the current selection into view.
    */
    scrollIntoView?: boolean;
    /**
    By default, transactions can be modified by [change
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^changeFilter) and [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter). You can set this
    to `false` to disable that. This can be necessary for
    transactions that, for example, include annotations that must be
    kept consistent with their changes.
    */
    filter?: boolean;
    /**
    Normally, when multiple specs are combined (for example by
    [`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update)), the
    positions in `changes` are taken to refer to the document
    positions in the initial document. When a spec has `sequental`
    set to true, its positions will be taken to refer to the
    document created by the specs before it instead.
    */
    sequential?: boolean;
}
/**
Changes to the editor state are grouped into transactions.
Typically, a user action creates a single transaction, which may
contain any number of document changes, may change the selection,
or have other effects. Create a transaction by calling
[`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update), or immediately
dispatch one by calling
[`EditorView.dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch).
*/
declare class Transaction$2 {
    /**
    The state from which the transaction starts.
    */
    readonly startState: EditorState$2;
    /**
    The document changes made by this transaction.
    */
    readonly changes: ChangeSet$2;
    /**
    The selection set by this transaction, or undefined if it
    doesn't explicitly set a selection.
    */
    readonly selection: EditorSelection$2 | undefined;
    /**
    The effects added to the transaction.
    */
    readonly effects: readonly StateEffect$2<any>[];
    /**
    Whether the selection should be scrolled into view after this
    transaction is dispatched.
    */
    readonly scrollIntoView: boolean;
    private constructor();
    /**
    The new document produced by the transaction. Contrary to
    [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
    force the entire new state to be computed right away, so it is
    recommended that [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
    when they need to look at the new document.
    */
    get newDoc(): Text$2;
    /**
    The new selection produced by the transaction. If
    [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
    this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
    current selection through the changes made by the transaction.
    */
    get newSelection(): EditorSelection$2;
    /**
    The new state created by the transaction. Computed on demand
    (but retained for subsequent access), so it is recommended not to
    access it in [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
    */
    get state(): EditorState$2;
    /**
    Get the value of the given annotation type, if any.
    */
    annotation<T>(type: AnnotationType$2<T>): T | undefined;
    /**
    Indicates whether the transaction changed the document.
    */
    get docChanged(): boolean;
    /**
    Indicates whether this transaction reconfigures the state
    (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
    with a top-level configuration
    [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
    */
    get reconfigured(): boolean;
    /**
    Returns true if the transaction has a [user
    event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
    or more specific than `event`. For example, if the transaction
    has `"select.pointer"` as user event, `"select"` and
    `"select.pointer"` will match it.
    */
    isUserEvent(event: string): boolean;
    /**
    Annotation used to store transaction timestamps. Automatically
    added to every transaction, holding `Date.now()`.
    */
    static time: AnnotationType$2<number>;
    /**
    Annotation used to associate a transaction with a user interface
    event. Holds a string identifying the event, using a
    dot-separated format to support attaching more specific
    information. The events used by the core libraries are:
    
     - `"input"` when content is entered
       - `"input.type"` for typed input
         - `"input.type.compose"` for composition
       - `"input.paste"` for pasted input
       - `"input.drop"` when adding content with drag-and-drop
       - `"input.complete"` when autocompleting
     - `"delete"` when the user deletes content
       - `"delete.selection"` when deleting the selection
       - `"delete.forward"` when deleting forward from the selection
       - `"delete.backward"` when deleting backward from the selection
       - `"delete.cut"` when cutting to the clipboard
     - `"move"` when content is moved
       - `"move.drop"` when content is moved within the editor through drag-and-drop
     - `"select"` when explicitly changing the selection
       - `"select.pointer"` when selecting with a mouse or other pointing device
     - `"undo"` and `"redo"` for history actions
    
    Use [`isUserEvent`](https://codemirror.net/6/docs/ref/#state.Transaction.isUserEvent) to check
    whether the annotation matches a given event.
    */
    static userEvent: AnnotationType$2<string>;
    /**
    Annotation indicating whether a transaction should be added to
    the undo history or not.
    */
    static addToHistory: AnnotationType$2<boolean>;
    /**
    Annotation indicating (when present and true) that a transaction
    represents a change made by some other actor, not the user. This
    is used, for example, to tag other people's changes in
    collaborative editing.
    */
    static remote: AnnotationType$2<boolean>;
}

/**
The categories produced by a [character
categorizer](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer). These are used
do things like selecting by word.
*/
declare enum CharCategory$2 {
    /**
    Word characters.
    */
    Word = 0,
    /**
    Whitespace.
    */
    Space = 1,
    /**
    Anything else.
    */
    Other = 2
}

/**
Options passed when [creating](https://codemirror.net/6/docs/ref/#state.EditorState^create) an
editor state.
*/
interface EditorStateConfig$2 {
    /**
    The initial document. Defaults to an empty document. Can be
    provided either as a plain string (which will be split into
    lines according to the value of the [`lineSeparator`
    facet](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)), or an instance of
    the [`Text`](https://codemirror.net/6/docs/ref/#state.Text) class (which is what the state will use
    to represent the document).
    */
    doc?: string | Text$2;
    /**
    The starting selection. Defaults to a cursor at the very start
    of the document.
    */
    selection?: EditorSelection$2 | {
        anchor: number;
        head?: number;
    };
    /**
    [Extension(s)](https://codemirror.net/6/docs/ref/#state.Extension) to associate with this state.
    */
    extensions?: Extension$2;
}
/**
The editor state class is a persistent (immutable) data structure.
To update a state, you [create](https://codemirror.net/6/docs/ref/#state.EditorState.update) a
[transaction](https://codemirror.net/6/docs/ref/#state.Transaction), which produces a _new_ state
instance, without modifying the original object.

As such, _never_ mutate properties of a state directly. That'll
just break things.
*/
declare class EditorState$2 {
    /**
    The current document.
    */
    readonly doc: Text$2;
    /**
    The current selection.
    */
    readonly selection: EditorSelection$2;
    private constructor();
    /**
    Retrieve the value of a [state field](https://codemirror.net/6/docs/ref/#state.StateField). Throws
    an error when the state doesn't have that field, unless you pass
    `false` as second parameter.
    */
    field<T>(field: StateField$2<T>): T;
    field<T>(field: StateField$2<T>, require: false): T | undefined;
    /**
    Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
    state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
    can be passed. Unless
    [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
    [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
    are assumed to start in the _current_ document (not the document
    produced by previous specs), and its
    [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
    [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
    to the document created by its _own_ changes. The resulting
    transaction contains the combined effect of all the different
    specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
    specs take precedence over earlier ones.
    */
    update(...specs: readonly TransactionSpec$2[]): Transaction$2;
    /**
    Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
    replaces every selection range with the given content.
    */
    replaceSelection(text: string | Text$2): TransactionSpec$2;
    /**
    Create a set of changes and a new selection by running the given
    function for each range in the active selection. The function
    can return an optional set of changes (in the coordinate space
    of the start document), plus an updated range (in the coordinate
    space of the document produced by the call's own changes). This
    method will merge all the changes and ranges into a single
    changeset and selection, and return it as a [transaction
    spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
    [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
    */
    changeByRange(f: (range: SelectionRange$2) => {
        range: SelectionRange$2;
        changes?: ChangeSpec$2;
        effects?: StateEffect$2<any> | readonly StateEffect$2<any>[];
    }): {
        changes: ChangeSet$2;
        selection: EditorSelection$2;
        effects: readonly StateEffect$2<any>[];
    };
    /**
    Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
    description, taking the state's document length and line
    separator into account.
    */
    changes(spec?: ChangeSpec$2): ChangeSet$2;
    /**
    Using the state's [line
    separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
    [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
    */
    toText(string: string): Text$2;
    /**
    Return the given range of the document as a string.
    */
    sliceDoc(from?: number, to?: number): string;
    /**
    Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
    */
    facet<Output>(facet: Facet$2<any, Output>): Output;
    /**
    Convert this state to a JSON-serializable object. When custom
    fields should be serialized, you can pass them in as an object
    mapping property names (in the resulting object, which should
    not use `doc` or `selection`) to fields.
    */
    toJSON(fields?: {
        [prop: string]: StateField$2<any>;
    }): any;
    /**
    Deserialize a state from its JSON representation. When custom
    fields should be deserialized, pass the same object you passed
    to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
    third argument.
    */
    static fromJSON(json: any, config?: EditorStateConfig$2, fields?: {
        [prop: string]: StateField$2<any>;
    }): EditorState$2;
    /**
    Create a new state. You'll usually only need this when
    initializing an editor—updated states are created by applying
    transactions.
    */
    static create(config?: EditorStateConfig$2): EditorState$2;
    /**
    A facet that, when enabled, causes the editor to allow multiple
    ranges to be selected. Be careful though, because by default the
    editor relies on the native DOM selection, which cannot handle
    multiple selections. An extension like
    [`drawSelection`](https://codemirror.net/6/docs/ref/#view.drawSelection) can be used to make
    secondary selections visible to the user.
    */
    static allowMultipleSelections: Facet$2<boolean, boolean>;
    /**
    Configures the tab size to use in this state. The first
    (highest-precedence) value of the facet is used. If no value is
    given, this defaults to 4.
    */
    static tabSize: Facet$2<number, number>;
    /**
    The size (in columns) of a tab in the document, determined by
    the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
    */
    get tabSize(): number;
    /**
    The line separator to use. By default, any of `"\n"`, `"\r\n"`
    and `"\r"` is treated as a separator when splitting lines, and
    lines are joined with `"\n"`.
    
    When you configure a value here, only that precise separator
    will be used, allowing you to round-trip documents through the
    editor without normalizing line separators.
    */
    static lineSeparator: Facet$2<string, string | undefined>;
    /**
    Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
    string for this state.
    */
    get lineBreak(): string;
    /**
    This facet controls the value of the
    [`readOnly`](https://codemirror.net/6/docs/ref/#state.EditorState.readOnly) getter, which is
    consulted by commands and extensions that implement editing
    functionality to determine whether they should apply. It
    defaults to false, but when its highest-precedence value is
    `true`, such functionality disables itself.
    
    Not to be confused with
    [`EditorView.editable`](https://codemirror.net/6/docs/ref/#view.EditorView^editable), which
    controls whether the editor's DOM is set to be editable (and
    thus focusable).
    */
    static readOnly: Facet$2<boolean, boolean>;
    /**
    Returns true when the editor is
    [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
    */
    get readOnly(): boolean;
    /**
    Registers translation phrases. The
    [`phrase`](https://codemirror.net/6/docs/ref/#state.EditorState.phrase) method will look through
    all objects registered with this facet to find translations for
    its argument.
    */
    static phrases: Facet$2<{
        [key: string]: string;
    }, readonly {
        [key: string]: string;
    }[]>;
    /**
    Look up a translation for the given phrase (via the
    [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
    original string if no translation is found.
    
    If additional arguments are passed, they will be inserted in
    place of markers like `$1` (for the first value) and `$2`, etc.
    A single `$` is equivalent to `$1`, and `$$` will produce a
    literal dollar sign.
    */
    phrase(phrase: string, ...insert: any[]): string;
    /**
    A facet used to register [language
    data](https://codemirror.net/6/docs/ref/#state.EditorState.languageDataAt) providers.
    */
    static languageData: Facet$2<(state: EditorState$2, pos: number, side: 0 | 1 | -1) => readonly {
        [name: string]: any;
    }[], readonly ((state: EditorState$2, pos: number, side: 0 | 1 | -1) => readonly {
        [name: string]: any;
    }[])[]>;
    /**
    Find the values for a given language data field, provided by the
    the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
    
    Examples of language data fields are...
    
    - [`"commentTokens"`](https://codemirror.net/6/docs/ref/#commands.CommentTokens) for specifying
      comment syntax.
    - [`"autocomplete"`](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion^config.override)
      for providing language-specific completion sources.
    - [`"wordChars"`](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) for adding
      characters that should be considered part of words in this
      language.
    - [`"closeBrackets"`](https://codemirror.net/6/docs/ref/#autocomplete.CloseBracketConfig) controls
      bracket closing behavior.
    */
    languageDataAt<T>(name: string, pos: number, side?: -1 | 0 | 1): readonly T[];
    /**
    Return a function that can categorize strings (expected to
    represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak))
    into one of:
    
     - Word (contains an alphanumeric character or a character
       explicitly listed in the local language's `"wordChars"`
       language data, which should be a string)
     - Space (contains only whitespace)
     - Other (anything else)
    */
    charCategorizer(at: number): (char: string) => CharCategory$2;
    /**
    Find the word at the given position, meaning the range
    containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
    around it. If no word characters are adjacent to the position,
    this returns null.
    */
    wordAt(pos: number): SelectionRange$2 | null;
    /**
    Facet used to register change filters, which are called for each
    transaction (unless explicitly
    [disabled](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter)), and can suppress
    part of the transaction's changes.
    
    Such a function can return `true` to indicate that it doesn't
    want to do anything, `false` to completely stop the changes in
    the transaction, or a set of ranges in which changes should be
    suppressed. Such ranges are represented as an array of numbers,
    with each pair of two numbers indicating the start and end of a
    range. So for example `[10, 20, 100, 110]` suppresses changes
    between 10 and 20, and between 100 and 110.
    */
    static changeFilter: Facet$2<(tr: Transaction$2) => boolean | readonly number[], readonly ((tr: Transaction$2) => boolean | readonly number[])[]>;
    /**
    Facet used to register a hook that gets a chance to update or
    replace transaction specs before they are applied. This will
    only be applied for transactions that don't have
    [`filter`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter) set to `false`. You
    can either return a single transaction spec (possibly the input
    transaction), or an array of specs (which will be combined in
    the same way as the arguments to
    [`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update)).
    
    When possible, it is recommended to avoid accessing
    [`Transaction.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state) in a filter,
    since it will force creation of a state that will then be
    discarded again, if the transaction is actually filtered.
    
    (This functionality should be used with care. Indiscriminately
    modifying transaction is likely to break something or degrade
    the user experience.)
    */
    static transactionFilter: Facet$2<(tr: Transaction$2) => TransactionSpec$2 | readonly TransactionSpec$2[], readonly ((tr: Transaction$2) => TransactionSpec$2 | readonly TransactionSpec$2[])[]>;
    /**
    This is a more limited form of
    [`transactionFilter`](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter),
    which can only add
    [annotations](https://codemirror.net/6/docs/ref/#state.TransactionSpec.annotations) and
    [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects). _But_, this type
    of filter runs even if the transaction has disabled regular
    [filtering](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter), making it suitable
    for effects that don't need to touch the changes or selection,
    but do want to process every transaction.
    
    Extenders run _after_ filters, when both are present.
    */
    static transactionExtender: Facet$2<(tr: Transaction$2) => Pick<TransactionSpec$2, "effects" | "annotations"> | null, readonly ((tr: Transaction$2) => Pick<TransactionSpec$2, "effects" | "annotations"> | null)[]>;
}

/**
Subtype of [`Command`](https://codemirror.net/6/docs/ref/#view.Command) that doesn't require access
to the actual editor view. Mostly useful to define commands that
can be run and tested outside of a browser environment.
*/
declare type StateCommand = (target: {
    state: EditorState$2;
    dispatch: (transaction: Transaction$2) => void;
}) => boolean;

/**
Each range is associated with a value, which must inherit from
this class.
*/
declare abstract class RangeValue$1 {
    /**
    Compare this value with another value. Used when comparing
    rangesets. The default implementation compares by identity.
    Unless you are only creating a fixed number of unique instances
    of your value type, it is a good idea to implement this
    properly.
    */
    eq(other: RangeValue$1): boolean;
    /**
    The bias value at the start of the range. Determines how the
    range is positioned relative to other ranges starting at this
    position. Defaults to 0.
    */
    startSide: number;
    /**
    The bias value at the end of the range. Defaults to 0.
    */
    endSide: number;
    /**
    The mode with which the location of the range should be mapped
    when its `from` and `to` are the same, to decide whether a
    change deletes the range. Defaults to `MapMode.TrackDel`.
    */
    mapMode: MapMode$2;
    /**
    Determines whether this value marks a point range. Regular
    ranges affect the part of the document they cover, and are
    meaningless when empty. Point ranges have a meaning on their
    own. When non-empty, a point range is treated as atomic and
    shadows any ranges contained in it.
    */
    point: boolean;
    /**
    Create a [range](https://codemirror.net/6/docs/ref/#state.Range) with this value.
    */
    range(from: number, to?: number): Range$1<this>;
}
/**
A range associates a value with a range of positions.
*/
declare class Range$1<T extends RangeValue$1> {
    /**
    The range's start position.
    */
    readonly from: number;
    /**
    Its end position.
    */
    readonly to: number;
    /**
    The value associated with this range.
    */
    readonly value: T;
    private constructor();
}
/**
Collection of methods used when comparing range sets.
*/
interface RangeComparator$1<T extends RangeValue$1> {
    /**
    Notifies the comparator that a range (in positions in the new
    document) has the given sets of values associated with it, which
    are different in the old (A) and new (B) sets.
    */
    compareRange(from: number, to: number, activeA: T[], activeB: T[]): void;
    /**
    Notification for a changed (or inserted, or deleted) point range.
    */
    comparePoint(from: number, to: number, pointA: T | null, pointB: T | null): void;
}
/**
Methods used when iterating over the spans created by a set of
ranges. The entire iterated range will be covered with either
`span` or `point` calls.
*/
interface SpanIterator$1<T extends RangeValue$1> {
    /**
    Called for any ranges not covered by point decorations. `active`
    holds the values that the range is marked with (and may be
    empty). `openStart` indicates how many of those ranges are open
    (continued) at the start of the span.
    */
    span(from: number, to: number, active: readonly T[], openStart: number): void;
    /**
    Called when going over a point decoration. The active range
    decorations that cover the point and have a higher precedence
    are provided in `active`. The open count in `openStart` counts
    the number of those ranges that started before the point and. If
    the point started before the iterated range, `openStart` will be
    `active.length + 1` to signal this.
    */
    point(from: number, to: number, value: T, active: readonly T[], openStart: number, index: number): void;
}
/**
A range cursor is an object that moves to the next range every
time you call `next` on it. Note that, unlike ES6 iterators, these
start out pointing at the first element, so you should call `next`
only after reading the first range (if any).
*/
interface RangeCursor$1<T> {
    /**
    Move the iterator forward.
    */
    next: () => void;
    /**
    The next range's value. Holds `null` when the cursor has reached
    its end.
    */
    value: T | null;
    /**
    The next range's start position.
    */
    from: number;
    /**
    The next end position.
    */
    to: number;
}
declare type RangeSetUpdate$1<T extends RangeValue$1> = {
    /**
    An array of ranges to add. If given, this should be sorted by
    `from` position and `startSide` unless
    [`sort`](https://codemirror.net/6/docs/ref/#state.RangeSet.update^updateSpec.sort) is given as
    `true`.
    */
    add?: readonly Range$1<T>[];
    /**
    Indicates whether the library should sort the ranges in `add`.
    Defaults to `false`.
    */
    sort?: boolean;
    /**
    Filter the ranges already in the set. Only those for which this
    function returns `true` are kept.
    */
    filter?: (from: number, to: number, value: T) => boolean;
    /**
    Can be used to limit the range on which the filter is
    applied. Filtering only a small range, as opposed to the entire
    set, can make updates cheaper.
    */
    filterFrom?: number;
    /**
    The end position to apply the filter to.
    */
    filterTo?: number;
};
/**
A range set stores a collection of [ranges](https://codemirror.net/6/docs/ref/#state.Range) in a
way that makes them efficient to [map](https://codemirror.net/6/docs/ref/#state.RangeSet.map) and
[update](https://codemirror.net/6/docs/ref/#state.RangeSet.update). This is an immutable data
structure.
*/
declare class RangeSet$1<T extends RangeValue$1> {
    private constructor();
    /**
    The number of ranges in the set.
    */
    get size(): number;
    /**
    Update the range set, optionally adding new ranges or filtering
    out existing ones.
    
    (Note: The type parameter is just there as a kludge to work
    around TypeScript variance issues that prevented `RangeSet<X>`
    from being a subtype of `RangeSet<Y>` when `X` is a subtype of
    `Y`.)
    */
    update<U extends T>(updateSpec: RangeSetUpdate$1<U>): RangeSet$1<T>;
    /**
    Map this range set through a set of changes, return the new set.
    */
    map(changes: ChangeDesc$2): RangeSet$1<T>;
    /**
    Iterate over the ranges that touch the region `from` to `to`,
    calling `f` for each. There is no guarantee that the ranges will
    be reported in any specific order. When the callback returns
    `false`, iteration stops.
    */
    between(from: number, to: number, f: (from: number, to: number, value: T) => void | false): void;
    /**
    Iterate over the ranges in this set, in order, including all
    ranges that end at or after `from`.
    */
    iter(from?: number): RangeCursor$1<T>;
    /**
    Iterate over the ranges in a collection of sets, in order,
    starting from `from`.
    */
    static iter<T extends RangeValue$1>(sets: readonly RangeSet$1<T>[], from?: number): RangeCursor$1<T>;
    /**
    Iterate over two groups of sets, calling methods on `comparator`
    to notify it of possible differences.
    */
    static compare<T extends RangeValue$1>(oldSets: readonly RangeSet$1<T>[], newSets: readonly RangeSet$1<T>[], 
    /**
    This indicates how the underlying data changed between these
    ranges, and is needed to synchronize the iteration. `from` and
    `to` are coordinates in the _new_ space, after these changes.
    */
    textDiff: ChangeDesc$2, comparator: RangeComparator$1<T>, 
    /**
    Can be used to ignore all non-point ranges, and points below
    the given size. When -1, all ranges are compared.
    */
    minPointSize?: number): void;
    /**
    Compare the contents of two groups of range sets, returning true
    if they are equivalent in the given range.
    */
    static eq<T extends RangeValue$1>(oldSets: readonly RangeSet$1<T>[], newSets: readonly RangeSet$1<T>[], from?: number, to?: number): boolean;
    /**
    Iterate over a group of range sets at the same time, notifying
    the iterator about the ranges covering every given piece of
    content. Returns the open count (see
    [`SpanIterator.span`](https://codemirror.net/6/docs/ref/#state.SpanIterator.span)) at the end
    of the iteration.
    */
    static spans<T extends RangeValue$1>(sets: readonly RangeSet$1<T>[], from: number, to: number, iterator: SpanIterator$1<T>, 
    /**
    When given and greater than -1, only points of at least this
    size are taken into account.
    */
    minPointSize?: number): number;
    /**
    Create a range set for the given range or array of ranges. By
    default, this expects the ranges to be _sorted_ (by start
    position and, if two start at the same position,
    `value.startSide`). You can pass `true` as second argument to
    cause the method to sort them.
    */
    static of<T extends RangeValue$1>(ranges: readonly Range$1<T>[] | Range$1<T>, sort?: boolean): RangeSet$1<T>;
    /**
    The empty set of ranges.
    */
    static empty: RangeSet$1<any>;
}

declare type Attrs$1 = {
    [name: string]: string;
};

interface MarkDecorationSpec$1 {
    /**
    Whether the mark covers its start and end position or not. This
    influences whether content inserted at those positions becomes
    part of the mark. Defaults to false.
    */
    inclusive?: boolean;
    /**
    Specify whether the start position of the marked range should be
    inclusive. Overrides `inclusive`, when both are present.
    */
    inclusiveStart?: boolean;
    /**
    Whether the end should be inclusive.
    */
    inclusiveEnd?: boolean;
    /**
    Add attributes to the DOM elements that hold the text in the
    marked range.
    */
    attributes?: {
        [key: string]: string;
    };
    /**
    Shorthand for `{attributes: {class: value}}`.
    */
    class?: string;
    /**
    Add a wrapping element around the text in the marked range. Note
    that there will not necessarily be a single element covering the
    entire range—other decorations with lower precedence might split
    this one if they partially overlap it, and line breaks always
    end decoration elements.
    */
    tagName?: string;
    /**
    Decoration specs allow extra properties, which can be retrieved
    through the decoration's [`spec`](https://codemirror.net/6/docs/ref/#view.Decoration.spec)
    property.
    */
    [other: string]: any;
}
interface WidgetDecorationSpec$1 {
    /**
    The type of widget to draw here.
    */
    widget: WidgetType$1;
    /**
    Which side of the given position the widget is on. When this is
    positive, the widget will be drawn after the cursor if the
    cursor is on the same position. Otherwise, it'll be drawn before
    it. When multiple widgets sit at the same position, their `side`
    values will determine their ordering—those with a lower value
    come first. Defaults to 0.
    */
    side?: number;
    /**
    Determines whether this is a block widgets, which will be drawn
    between lines, or an inline widget (the default) which is drawn
    between the surrounding text.
    
    Note that block-level decorations should not have vertical
    margins, and if you dynamically change their height, you should
    make sure to call
    [`requestMeasure`](https://codemirror.net/6/docs/ref/#view.EditorView.requestMeasure), so that the
    editor can update its information about its vertical layout.
    */
    block?: boolean;
    /**
    Other properties are allowed.
    */
    [other: string]: any;
}
interface ReplaceDecorationSpec$1 {
    /**
    An optional widget to drawn in the place of the replaced
    content.
    */
    widget?: WidgetType$1;
    /**
    Whether this range covers the positions on its sides. This
    influences whether new content becomes part of the range and
    whether the cursor can be drawn on its sides. Defaults to false
    for inline replacements, and true for block replacements.
    */
    inclusive?: boolean;
    /**
    Set inclusivity at the start.
    */
    inclusiveStart?: boolean;
    /**
    Set inclusivity at the end.
    */
    inclusiveEnd?: boolean;
    /**
    Whether this is a block-level decoration. Defaults to false.
    */
    block?: boolean;
    /**
    Other properties are allowed.
    */
    [other: string]: any;
}
interface LineDecorationSpec$1 {
    /**
    DOM attributes to add to the element wrapping the line.
    */
    attributes?: {
        [key: string]: string;
    };
    /**
    Shorthand for `{attributes: {class: value}}`.
    */
    class?: string;
    /**
    Other properties are allowed.
    */
    [other: string]: any;
}
/**
Widgets added to the content are described by subclasses of this
class. Using a description object like that makes it possible to
delay creating of the DOM structure for a widget until it is
needed, and to avoid redrawing widgets even if the decorations
that define them are recreated.
*/
declare abstract class WidgetType$1 {
    /**
    Build the DOM structure for this widget instance.
    */
    abstract toDOM(view: EditorView$1): HTMLElement;
    /**
    Compare this instance to another instance of the same type.
    (TypeScript can't express this, but only instances of the same
    specific class will be passed to this method.) This is used to
    avoid redrawing widgets when they are replaced by a new
    decoration of the same type. The default implementation just
    returns `false`, which will cause new instances of the widget to
    always be redrawn.
    */
    eq(widget: WidgetType$1): boolean;
    /**
    Update a DOM element created by a widget of the same type (but
    different, non-`eq` content) to reflect this widget. May return
    true to indicate that it could update, false to indicate it
    couldn't (in which case the widget will be redrawn). The default
    implementation just returns false.
    */
    updateDOM(dom: HTMLElement): boolean;
    /**
    The estimated height this widget will have, to be used when
    estimating the height of content that hasn't been drawn. May
    return -1 to indicate you don't know. The default implementation
    returns -1.
    */
    get estimatedHeight(): number;
    /**
    Can be used to configure which kinds of events inside the widget
    should be ignored by the editor. The default is to ignore all
    events.
    */
    ignoreEvent(event: Event): boolean;
    /**
    This is called when the an instance of the widget is removed
    from the editor view.
    */
    destroy(dom: HTMLElement): void;
}
/**
A decoration set represents a collection of decorated ranges,
organized for efficient access and mapping. See
[`RangeSet`](https://codemirror.net/6/docs/ref/#state.RangeSet) for its methods.
*/
declare type DecorationSet$1 = RangeSet$1<Decoration$1>;
/**
The different types of blocks that can occur in an editor view.
*/
declare enum BlockType$1 {
    /**
    A line of text.
    */
    Text = 0,
    /**
    A block widget associated with the position after it.
    */
    WidgetBefore = 1,
    /**
    A block widget associated with the position before it.
    */
    WidgetAfter = 2,
    /**
    A block widget [replacing](https://codemirror.net/6/docs/ref/#view.Decoration^replace) a range of content.
    */
    WidgetRange = 3
}
/**
A decoration provides information on how to draw or style a piece
of content. You'll usually use it wrapped in a
[`Range`](https://codemirror.net/6/docs/ref/#state.Range), which adds a start and end position.
@nonabstract
*/
declare abstract class Decoration$1 extends RangeValue$1 {
    /**
    The config object used to create this decoration. You can
    include additional properties in there to store metadata about
    your decoration.
    */
    readonly spec: any;
    protected constructor(
    /**
    @internal
    */
    startSide: number, 
    /**
    @internal
    */
    endSide: number, 
    /**
    @internal
    */
    widget: WidgetType$1 | null, 
    /**
    The config object used to create this decoration. You can
    include additional properties in there to store metadata about
    your decoration.
    */
    spec: any);
    abstract eq(other: Decoration$1): boolean;
    /**
    Create a mark decoration, which influences the styling of the
    content in its range. Nested mark decorations will cause nested
    DOM elements to be created. Nesting order is determined by
    precedence of the [facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations), with
    the higher-precedence decorations creating the inner DOM nodes.
    Such elements are split on line boundaries and on the boundaries
    of lower-precedence decorations.
    */
    static mark(spec: MarkDecorationSpec$1): Decoration$1;
    /**
    Create a widget decoration, which displays a DOM element at the
    given position.
    */
    static widget(spec: WidgetDecorationSpec$1): Decoration$1;
    /**
    Create a replace decoration which replaces the given range with
    a widget, or simply hides it.
    */
    static replace(spec: ReplaceDecorationSpec$1): Decoration$1;
    /**
    Create a line decoration, which can add DOM attributes to the
    line starting at the given position.
    */
    static line(spec: LineDecorationSpec$1): Decoration$1;
    /**
    Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
    decorated range or ranges. If the ranges aren't already sorted,
    pass `true` for `sort` to make the library sort them for you.
    */
    static set(of: Range$1<Decoration$1> | readonly Range$1<Decoration$1>[], sort?: boolean): DecorationSet$1;
    /**
    The empty set of decorations.
    */
    static none: DecorationSet$1;
}

/**
Basic rectangle type.
*/
interface Rect$1 {
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;
}
declare type ScrollStrategy$1 = "nearest" | "start" | "end" | "center";

/**
Command functions are used in key bindings and other types of user
actions. Given an editor view, they check whether their effect can
apply to the editor, and if it can, perform it as a side effect
(which usually means [dispatching](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) a
transaction) and return `true`.
*/
declare type Command = (target: EditorView$1) => boolean;
/**
This is the interface plugin objects conform to.
*/
interface PluginValue$1 extends Object {
    /**
    Notifies the plugin of an update that happened in the view. This
    is called _before_ the view updates its own DOM. It is
    responsible for updating the plugin's internal state (including
    any state that may be read by plugin fields) and _writing_ to
    the DOM for the changes in the update. To avoid unnecessary
    layout recomputations, it should _not_ read the DOM layout—use
    [`requestMeasure`](https://codemirror.net/6/docs/ref/#view.EditorView.requestMeasure) to schedule
    your code in a DOM reading phase if you need to.
    */
    update?(update: ViewUpdate$1): void;
    /**
    Called when the plugin is no longer going to be used. Should
    revert any changes the plugin made to the DOM.
    */
    destroy?(): void;
}
/**
Provides additional information when defining a [view
plugin](https://codemirror.net/6/docs/ref/#view.ViewPlugin).
*/
interface PluginSpec$1<V extends PluginValue$1> {
    /**
    Register the given [event
    handlers](https://codemirror.net/6/docs/ref/#view.EditorView^domEventHandlers) for the plugin.
    When called, these will have their `this` bound to the plugin
    value.
    */
    eventHandlers?: DOMEventHandlers$1<V>;
    /**
    Specify that the plugin provides additional extensions when
    added to an editor configuration.
    */
    provide?: (plugin: ViewPlugin$1<V>) => Extension$2;
    /**
    Allow the plugin to provide decorations. When given, this should
    be a function that take the plugin value and return a
    [decoration set](https://codemirror.net/6/docs/ref/#view.DecorationSet). See also the caveat about
    [layout-changing decorations](https://codemirror.net/6/docs/ref/#view.EditorView^decorations) that
    depend on the view.
    */
    decorations?: (value: V) => DecorationSet$1;
}
/**
View plugins associate stateful values with a view. They can
influence the way the content is drawn, and are notified of things
that happen in the view.
*/
declare class ViewPlugin$1<V extends PluginValue$1> {
    /**
    Instances of this class act as extensions.
    */
    extension: Extension$2;
    private constructor();
    /**
    Define a plugin from a constructor function that creates the
    plugin's value, given an editor view.
    */
    static define<V extends PluginValue$1>(create: (view: EditorView$1) => V, spec?: PluginSpec$1<V>): ViewPlugin$1<V>;
    /**
    Create a plugin for a class whose constructor takes a single
    editor view as argument.
    */
    static fromClass<V extends PluginValue$1>(cls: {
        new (view: EditorView$1): V;
    }, spec?: PluginSpec$1<V>): ViewPlugin$1<V>;
}
interface MeasureRequest$1<T> {
    /**
    Called in a DOM read phase to gather information that requires
    DOM layout. Should _not_ mutate the document.
    */
    read(view: EditorView$1): T;
    /**
    Called in a DOM write phase to update the document. Should _not_
    do anything that triggers DOM layout.
    */
    write?(measure: T, view: EditorView$1): void;
    /**
    When multiple requests with the same key are scheduled, only the
    last one will actually be ran.
    */
    key?: any;
}
declare type AttrSource$1 = Attrs$1 | ((view: EditorView$1) => Attrs$1 | null);
/**
View [plugins](https://codemirror.net/6/docs/ref/#view.ViewPlugin) are given instances of this
class, which describe what happened, whenever the view is updated.
*/
declare class ViewUpdate$1 {
    /**
    The editor view that the update is associated with.
    */
    readonly view: EditorView$1;
    /**
    The new editor state.
    */
    readonly state: EditorState$2;
    /**
    The transactions involved in the update. May be empty.
    */
    readonly transactions: readonly Transaction$2[];
    /**
    The changes made to the document by this update.
    */
    readonly changes: ChangeSet$2;
    /**
    The previous editor state.
    */
    readonly startState: EditorState$2;
    private constructor();
    /**
    Tells you whether the [viewport](https://codemirror.net/6/docs/ref/#view.EditorView.viewport) or
    [visible ranges](https://codemirror.net/6/docs/ref/#view.EditorView.visibleRanges) changed in this
    update.
    */
    get viewportChanged(): boolean;
    /**
    Indicates whether the height of a block element in the editor
    changed in this update.
    */
    get heightChanged(): boolean;
    /**
    Returns true when the document was modified or the size of the
    editor, or elements within the editor, changed.
    */
    get geometryChanged(): boolean;
    /**
    True when this update indicates a focus change.
    */
    get focusChanged(): boolean;
    /**
    Whether the document changed in this update.
    */
    get docChanged(): boolean;
    /**
    Whether the selection was explicitly set in this update.
    */
    get selectionSet(): boolean;
}

/**
Interface that objects registered with
[`EditorView.mouseSelectionStyle`](https://codemirror.net/6/docs/ref/#view.EditorView^mouseSelectionStyle)
must conform to.
*/
interface MouseSelectionStyle$1 {
    /**
    Return a new selection for the mouse gesture that starts with
    the event that was originally given to the constructor, and ends
    with the event passed here. In case of a plain click, those may
    both be the `mousedown` event, in case of a drag gesture, the
    latest `mousemove` event will be passed.
    
    When `extend` is true, that means the new selection should, if
    possible, extend the start selection. If `multiple` is true, the
    new selection should be added to the original selection.
    */
    get: (curEvent: MouseEvent, extend: boolean, multiple: boolean) => EditorSelection$2;
    /**
    Called when the view is updated while the gesture is in
    progress. When the document changes, it may be necessary to map
    some data (like the original selection or start position)
    through the changes.
    
    This may return `true` to indicate that the `get` method should
    get queried again after the update, because something in the
    update could change its result. Be wary of infinite loops when
    using this (where `get` returns a new selection, which will
    trigger `update`, which schedules another `get` in response).
    */
    update: (update: ViewUpdate$1) => boolean | void;
}
declare type MakeSelectionStyle$1 = (view: EditorView$1, event: MouseEvent) => MouseSelectionStyle$1 | null;

/**
Record used to represent information about a block-level element
in the editor view.
*/
declare class BlockInfo$1 {
    /**
    The start of the element in the document.
    */
    readonly from: number;
    /**
    The length of the element.
    */
    readonly length: number;
    /**
    The top position of the element (relative to the top of the
    document).
    */
    readonly top: number;
    /**
    Its height.
    */
    readonly height: number;
    /**
    The type of element this is. When querying lines, this may be
    an array of all the blocks that make up the line.
    */
    readonly type: BlockType$1 | readonly BlockInfo$1[];
    /**
    The end of the element as a document position.
    */
    get to(): number;
    /**
    The bottom position of the element.
    */
    get bottom(): number;
}

/**
Used to indicate [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
*/
declare enum Direction$1 {
    /**
    Left-to-right.
    */
    LTR = 0,
    /**
    Right-to-left.
    */
    RTL = 1
}
/**
Represents a contiguous range of text that has a single direction
(as in left-to-right or right-to-left).
*/
declare class BidiSpan$1 {
    /**
    The start of the span (relative to the start of the line).
    */
    readonly from: number;
    /**
    The end of the span.
    */
    readonly to: number;
    /**
    The ["bidi
    level"](https://unicode.org/reports/tr9/#Basic_Display_Algorithm)
    of the span (in this context, 0 means
    left-to-right, 1 means right-to-left, 2 means left-to-right
    number inside right-to-left text).
    */
    readonly level: number;
    /**
    The direction of this span.
    */
    get dir(): Direction$1;
}

/**
The type of object given to the [`EditorView`](https://codemirror.net/6/docs/ref/#view.EditorView)
constructor.
*/
interface EditorViewConfig$1 extends EditorStateConfig$2 {
    /**
    The view's initial state. If not given, a new state is created
    by passing this configuration object to
    [`EditorState.create`](https://codemirror.net/6/docs/ref/#state.EditorState^create), using its
    `doc`, `selection`, and `extensions` field (if provided).
    */
    state?: EditorState$2;
    /**
    When given, the editor is immediately appended to the given
    element on creation. (Otherwise, you'll have to place the view's
    [`dom`](https://codemirror.net/6/docs/ref/#view.EditorView.dom) element in the document yourself.)
    */
    parent?: Element | DocumentFragment;
    /**
    If the view is going to be mounted in a shadow root or document
    other than the one held by the global variable `document` (the
    default), you should pass it here. If you provide `parent`, but
    not this option, the editor will automatically look up a root
    from the parent.
    */
    root?: Document | ShadowRoot;
    /**
    Override the transaction [dispatch
    function](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) for this editor view, which
    is the way updates get routed to the view. Your implementation,
    if provided, should probably call the view's [`update`
    method](https://codemirror.net/6/docs/ref/#view.EditorView.update).
    */
    dispatch?: (tr: Transaction$2) => void;
}
/**
An editor view represents the editor's user interface. It holds
the editable DOM surface, and possibly other elements such as the
line number gutter. It handles events and dispatches state
transactions for editing actions.
*/
declare class EditorView$1 {
    /**
    The current editor state.
    */
    get state(): EditorState$2;
    /**
    To be able to display large documents without consuming too much
    memory or overloading the browser, CodeMirror only draws the
    code that is visible (plus a margin around it) to the DOM. This
    property tells you the extent of the current drawn viewport, in
    document positions.
    */
    get viewport(): {
        from: number;
        to: number;
    };
    /**
    When there are, for example, large collapsed ranges in the
    viewport, its size can be a lot bigger than the actual visible
    content. Thus, if you are doing something like styling the
    content in the viewport, it is preferable to only do so for
    these ranges, which are the subset of the viewport that is
    actually drawn.
    */
    get visibleRanges(): readonly {
        from: number;
        to: number;
    }[];
    /**
    Returns false when the editor is entirely scrolled out of view
    or otherwise hidden.
    */
    get inView(): boolean;
    /**
    Indicates whether the user is currently composing text via
    [IME](https://en.wikipedia.org/wiki/Input_method), and at least
    one change has been made in the current composition.
    */
    get composing(): boolean;
    /**
    Indicates whether the user is currently in composing state. Note
    that on some platforms, like Android, this will be the case a
    lot, since just putting the cursor on a word starts a
    composition there.
    */
    get compositionStarted(): boolean;
    private _dispatch;
    private _root;
    /**
    The document or shadow root that the view lives in.
    */
    get root(): DocumentOrShadowRoot;
    /**
    The DOM element that wraps the entire editor view.
    */
    readonly dom: HTMLElement;
    /**
    The DOM element that can be styled to scroll. (Note that it may
    not have been, so you can't assume this is scrollable.)
    */
    readonly scrollDOM: HTMLElement;
    /**
    The editable DOM element holding the editor content. You should
    not, usually, interact with this content directly though the
    DOM, since the editor will immediately undo most of the changes
    you make. Instead, [dispatch](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch)
    [transactions](https://codemirror.net/6/docs/ref/#state.Transaction) to modify content, and
    [decorations](https://codemirror.net/6/docs/ref/#view.Decoration) to style it.
    */
    readonly contentDOM: HTMLElement;
    private announceDOM;
    private plugins;
    private pluginMap;
    private editorAttrs;
    private contentAttrs;
    private styleModules;
    private bidiCache;
    private destroyed;
    /**
    Construct a new view. You'll want to either provide a `parent`
    option, or put `view.dom` into your document after creating a
    view, so that the user can see the editor.
    */
    constructor(config?: EditorViewConfig$1);
    /**
    All regular editor state updates should go through this. It
    takes a transaction or transaction spec and updates the view to
    show the new state produced by that transaction. Its
    implementation can be overridden with an
    [option](https://codemirror.net/6/docs/ref/#view.EditorView.constructor^config.dispatch). This
    function is bound to the view instance, so it does not have to
    be called as a method.
    */
    dispatch(tr: Transaction$2): void;
    dispatch(...specs: TransactionSpec$2[]): void;
    /**
    Update the view for the given array of transactions. This will
    update the visible document and selection to match the state
    produced by the transactions, and notify view plugins of the
    change. You should usually call
    [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead, which uses this
    as a primitive.
    */
    update(transactions: readonly Transaction$2[]): void;
    /**
    Reset the view to the given state. (This will cause the entire
    document to be redrawn and all view plugins to be reinitialized,
    so you should probably only use it when the new state isn't
    derived from the old state. Otherwise, use
    [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead.)
    */
    setState(newState: EditorState$2): void;
    private updatePlugins;
    /**
    Get the CSS classes for the currently active editor themes.
    */
    get themeClasses(): string;
    private updateAttrs;
    private showAnnouncements;
    private mountStyles;
    private readMeasured;
    /**
    Schedule a layout measurement, optionally providing callbacks to
    do custom DOM measuring followed by a DOM write phase. Using
    this is preferable reading DOM layout directly from, for
    example, an event handler, because it'll make sure measuring and
    drawing done by other components is synchronized, avoiding
    unnecessary DOM layout computations.
    */
    requestMeasure<T>(request?: MeasureRequest$1<T>): void;
    /**
    Get the value of a specific plugin, if present. Note that
    plugins that crash can be dropped from a view, so even when you
    know you registered a given plugin, it is recommended to check
    the return value of this method.
    */
    plugin<T extends PluginValue$1>(plugin: ViewPlugin$1<T>): T | null;
    /**
    The top position of the document, in screen coordinates. This
    may be negative when the editor is scrolled down. Points
    directly to the top of the first line, not above the padding.
    */
    get documentTop(): number;
    /**
    Reports the padding above and below the document.
    */
    get documentPadding(): {
        top: number;
        bottom: number;
    };
    /**
    Find the text line or block widget at the given vertical
    position (which is interpreted as relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop)).
    */
    elementAtHeight(height: number): BlockInfo$1;
    /**
    Find the line block (see
    [`lineBlockAt`](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) at the given
    height, again interpreted relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop).
    */
    lineBlockAtHeight(height: number): BlockInfo$1;
    /**
    Get the extent and vertical position of all [line
    blocks](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) in the viewport. Positions
    are relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop);
    */
    get viewportLineBlocks(): BlockInfo$1[];
    /**
    Find the line block around the given document position. A line
    block is a range delimited on both sides by either a
    non-[hidden](https://codemirror.net/6/docs/ref/#view.Decoration^replace) line breaks, or the
    start/end of the document. It will usually just hold a line of
    text, but may be broken into multiple textblocks by block
    widgets.
    */
    lineBlockAt(pos: number): BlockInfo$1;
    /**
    The editor's total content height.
    */
    get contentHeight(): number;
    /**
    Move a cursor position by [grapheme
    cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak). `forward` determines whether
    the motion is away from the line start, or towards it. In
    bidirectional text, the line is traversed in visual order, using
    the editor's [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
    When the start position was the last one on the line, the
    returned position will be across the line break. If there is no
    further line, the original position is returned.
    
    By default, this method moves over a single cluster. The
    optional `by` argument can be used to move across more. It will
    be called with the first cluster as argument, and should return
    a predicate that determines, for each subsequent cluster,
    whether it should also be moved over.
    */
    moveByChar(start: SelectionRange$2, forward: boolean, by?: (initial: string) => (next: string) => boolean): SelectionRange$2;
    /**
    Move a cursor position across the next group of either
    [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
    non-whitespace characters.
    */
    moveByGroup(start: SelectionRange$2, forward: boolean): SelectionRange$2;
    /**
    Move to the next line boundary in the given direction. If
    `includeWrap` is true, line wrapping is on, and there is a
    further wrap point on the current line, the wrap point will be
    returned. Otherwise this function will return the start or end
    of the line.
    */
    moveToLineBoundary(start: SelectionRange$2, forward: boolean, includeWrap?: boolean): SelectionRange$2;
    /**
    Move a cursor position vertically. When `distance` isn't given,
    it defaults to moving to the next line (including wrapped
    lines). Otherwise, `distance` should provide a positive distance
    in pixels.
    
    When `start` has a
    [`goalColumn`](https://codemirror.net/6/docs/ref/#state.SelectionRange.goalColumn), the vertical
    motion will use that as a target horizontal position. Otherwise,
    the cursor's own horizontal position is used. The returned
    cursor will have its goal column set to whichever column was
    used.
    */
    moveVertically(start: SelectionRange$2, forward: boolean, distance?: number): SelectionRange$2;
    /**
    Find the DOM parent node and offset (child offset if `node` is
    an element, character offset when it is a text node) at the
    given document position.
    
    Note that for positions that aren't currently in
    `visibleRanges`, the resulting DOM position isn't necessarily
    meaningful (it may just point before or after a placeholder
    element).
    */
    domAtPos(pos: number): {
        node: Node;
        offset: number;
    };
    /**
    Find the document position at the given DOM node. Can be useful
    for associating positions with DOM events. Will raise an error
    when `node` isn't part of the editor content.
    */
    posAtDOM(node: Node, offset?: number): number;
    /**
    Get the document position at the given screen coordinates. For
    positions not covered by the visible viewport's DOM structure,
    this will return null, unless `false` is passed as second
    argument, in which case it'll return an estimated position that
    would be near the coordinates if it were rendered.
    */
    posAtCoords(coords: {
        x: number;
        y: number;
    }, precise: false): number;
    posAtCoords(coords: {
        x: number;
        y: number;
    }): number | null;
    /**
    Get the screen coordinates at the given document position.
    `side` determines whether the coordinates are based on the
    element before (-1) or after (1) the position (if no element is
    available on the given side, the method will transparently use
    another strategy to get reasonable coordinates).
    */
    coordsAtPos(pos: number, side?: -1 | 1): Rect$1 | null;
    /**
    The default width of a character in the editor. May not
    accurately reflect the width of all characters (given variable
    width fonts or styling of invididual ranges).
    */
    get defaultCharacterWidth(): number;
    /**
    The default height of a line in the editor. May not be accurate
    for all lines.
    */
    get defaultLineHeight(): number;
    /**
    The text direction
    ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
    CSS property) of the editor's content element.
    */
    get textDirection(): Direction$1;
    /**
    Find the text direction of the block at the given position, as
    assigned by CSS. If
    [`perLineTextDirection`](https://codemirror.net/6/docs/ref/#view.EditorView^perLineTextDirection)
    isn't enabled, or the given position is outside of the viewport,
    this will always return the same as
    [`textDirection`](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection). Note that
    this may trigger a DOM layout.
    */
    textDirectionAt(pos: number): Direction$1;
    /**
    Whether this editor [wraps lines](https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping)
    (as determined by the
    [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
    CSS property of its content element).
    */
    get lineWrapping(): boolean;
    /**
    Returns the bidirectional text structure of the given line
    (which should be in the current document) as an array of span
    objects. The order of these spans matches the [text
    direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection)—if that is
    left-to-right, the leftmost spans come first, otherwise the
    rightmost spans come first.
    */
    bidiSpans(line: Line$3): readonly BidiSpan$1[];
    /**
    Check whether the editor has focus.
    */
    get hasFocus(): boolean;
    /**
    Put focus on the editor.
    */
    focus(): void;
    /**
    Update the [root](https://codemirror.net/6/docs/ref/##view.EditorViewConfig.root) in which the editor lives. This is only
    necessary when moving the editor's existing DOM to a new window or shadow root.
    */
    setRoot(root: Document | ShadowRoot): void;
    /**
    Clean up this editor view, removing its element from the
    document, unregistering event handlers, and notifying
    plugins. The view instance can no longer be used after
    calling this.
    */
    destroy(): void;
    /**
    Returns an effect that can be
    [added](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) to a transaction to
    cause it to scroll the given position or range into view.
    */
    static scrollIntoView(pos: number | SelectionRange$2, options?: {
        /**
        By default (`"nearest"`) the position will be vertically
        scrolled only the minimal amount required to move the given
        position into view. You can set this to `"start"` to move it
        to the top of the view, `"end"` to move it to the bottom, or
        `"center"` to move it to the center.
        */
        y?: ScrollStrategy$1;
        /**
        Effect similar to
        [`y`](https://codemirror.net/6/docs/ref/#view.EditorView^scrollIntoView^options.y), but for the
        horizontal scroll position.
        */
        x?: ScrollStrategy$1;
        /**
        Extra vertical distance to add when moving something into
        view. Not used with the `"center"` strategy. Defaults to 5.
        */
        yMargin?: number;
        /**
        Extra horizontal distance to add. Not used with the `"center"`
        strategy. Defaults to 5.
        */
        xMargin?: number;
    }): StateEffect$2<unknown>;
    /**
    Facet to add a [style
    module](https://github.com/marijnh/style-mod#documentation) to
    an editor view. The view will ensure that the module is
    mounted in its [document
    root](https://codemirror.net/6/docs/ref/#view.EditorView.constructor^config.root).
    */
    static styleModule: Facet$2<StyleModule, readonly StyleModule[]>;
    /**
    Returns an extension that can be used to add DOM event handlers.
    The value should be an object mapping event names to handler
    functions. For any given event, such functions are ordered by
    extension precedence, and the first handler to return true will
    be assumed to have handled that event, and no other handlers or
    built-in behavior will be activated for it. These are registered
    on the [content element](https://codemirror.net/6/docs/ref/#view.EditorView.contentDOM), except
    for `scroll` handlers, which will be called any time the
    editor's [scroll element](https://codemirror.net/6/docs/ref/#view.EditorView.scrollDOM) or one of
    its parent nodes is scrolled.
    */
    static domEventHandlers(handlers: DOMEventHandlers$1<any>): Extension$2;
    /**
    An input handler can override the way changes to the editable
    DOM content are handled. Handlers are passed the document
    positions between which the change was found, and the new
    content. When one returns true, no further input handlers are
    called and the default behavior is prevented.
    */
    static inputHandler: Facet$2<(view: EditorView$1, from: number, to: number, text: string) => boolean, readonly ((view: EditorView$1, from: number, to: number, text: string) => boolean)[]>;
    /**
    By default, the editor assumes all its content has the same
    [text direction](https://codemirror.net/6/docs/ref/#view.Direction). Configure this with a `true`
    value to make it read the text direction of every (rendered)
    line separately.
    */
    static perLineTextDirection: Facet$2<boolean, boolean>;
    /**
    Allows you to provide a function that should be called when the
    library catches an exception from an extension (mostly from view
    plugins, but may be used by other extensions to route exceptions
    from user-code-provided callbacks). This is mostly useful for
    debugging and logging. See [`logException`](https://codemirror.net/6/docs/ref/#view.logException).
    */
    static exceptionSink: Facet$2<(exception: any) => void, readonly ((exception: any) => void)[]>;
    /**
    A facet that can be used to register a function to be called
    every time the view updates.
    */
    static updateListener: Facet$2<(update: ViewUpdate$1) => void, readonly ((update: ViewUpdate$1) => void)[]>;
    /**
    Facet that controls whether the editor content DOM is editable.
    When its highest-precedence value is `false`, the element will
    not have its `contenteditable` attribute set. (Note that this
    doesn't affect API calls that change the editor content, even
    when those are bound to keys or buttons. See the
    [`readOnly`](https://codemirror.net/6/docs/ref/#state.EditorState.readOnly) facet for that.)
    */
    static editable: Facet$2<boolean, boolean>;
    /**
    Allows you to influence the way mouse selection happens. The
    functions in this facet will be called for a `mousedown` event
    on the editor, and can return an object that overrides the way a
    selection is computed from that mouse click or drag.
    */
    static mouseSelectionStyle: Facet$2<MakeSelectionStyle$1, readonly MakeSelectionStyle$1[]>;
    /**
    Facet used to configure whether a given selection drag event
    should move or copy the selection. The given predicate will be
    called with the `mousedown` event, and can return `true` when
    the drag should move the content.
    */
    static dragMovesSelection: Facet$2<(event: MouseEvent) => boolean, readonly ((event: MouseEvent) => boolean)[]>;
    /**
    Facet used to configure whether a given selecting click adds a
    new range to the existing selection or replaces it entirely. The
    default behavior is to check `event.metaKey` on macOS, and
    `event.ctrlKey` elsewhere.
    */
    static clickAddsSelectionRange: Facet$2<(event: MouseEvent) => boolean, readonly ((event: MouseEvent) => boolean)[]>;
    /**
    A facet that determines which [decorations](https://codemirror.net/6/docs/ref/#view.Decoration)
    are shown in the view. Decorations can be provided in two
    ways—directly, or via a function that takes an editor view.
    
    Only decoration sets provided directly are allowed to influence
    the editor's vertical layout structure. The ones provided as
    functions are called _after_ the new viewport has been computed,
    and thus **must not** introduce block widgets or replacing
    decorations that cover line breaks.
    
    If you want decorated ranges to behave like atomic units for
    cursor motion and deletion purposes, also provide the range set
    containing the decorations to
    [`EditorView.atomicRanges`](https://codemirror.net/6/docs/ref/#view.EditorView^atomicRanges).
    */
    static decorations: Facet$2<DecorationSet$1 | ((view: EditorView$1) => DecorationSet$1), readonly (DecorationSet$1 | ((view: EditorView$1) => DecorationSet$1))[]>;
    /**
    Used to provide ranges that should be treated as atoms as far as
    cursor motion is concerned. This causes methods like
    [`moveByChar`](https://codemirror.net/6/docs/ref/#view.EditorView.moveByChar) and
    [`moveVertically`](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) (and the
    commands built on top of them) to skip across such regions when
    a selection endpoint would enter them. This does _not_ prevent
    direct programmatic [selection
    updates](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) from moving into such
    regions.
    */
    static atomicRanges: Facet$2<(view: EditorView$1) => RangeSet$1<any>, readonly ((view: EditorView$1) => RangeSet$1<any>)[]>;
    /**
    Facet that allows extensions to provide additional scroll
    margins (space around the sides of the scrolling element that
    should be considered invisible). This can be useful when the
    plugin introduces elements that cover part of that element (for
    example a horizontally fixed gutter).
    */
    static scrollMargins: Facet$2<(view: EditorView$1) => Partial<Rect$1> | null, readonly ((view: EditorView$1) => Partial<Rect$1> | null)[]>;
    /**
    Create a theme extension. The first argument can be a
    [`style-mod`](https://github.com/marijnh/style-mod#documentation)
    style spec providing the styles for the theme. These will be
    prefixed with a generated class for the style.
    
    Because the selectors will be prefixed with a scope class, rule
    that directly match the editor's [wrapper
    element](https://codemirror.net/6/docs/ref/#view.EditorView.dom)—to which the scope class will be
    added—need to be explicitly differentiated by adding an `&` to
    the selector for that element—for example
    `&.cm-focused`.
    
    When `dark` is set to true, the theme will be marked as dark,
    which will cause the `&dark` rules from [base
    themes](https://codemirror.net/6/docs/ref/#view.EditorView^baseTheme) to be used (as opposed to
    `&light` when a light theme is active).
    */
    static theme(spec: {
        [selector: string]: StyleSpec;
    }, options?: {
        dark?: boolean;
    }): Extension$2;
    /**
    This facet records whether a dark theme is active. The extension
    returned by [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme) automatically
    includes an instance of this when the `dark` option is set to
    true.
    */
    static darkTheme: Facet$2<boolean, boolean>;
    /**
    Create an extension that adds styles to the base theme. Like
    with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
    place of the editor wrapper element when directly targeting
    that. You can also use `&dark` or `&light` instead to only
    target editors with a dark or light theme.
    */
    static baseTheme(spec: {
        [selector: string]: StyleSpec;
    }): Extension$2;
    /**
    Facet that provides additional DOM attributes for the editor's
    editable DOM element.
    */
    static contentAttributes: Facet$2<AttrSource$1, readonly AttrSource$1[]>;
    /**
    Facet that provides DOM attributes for the editor's outer
    element.
    */
    static editorAttributes: Facet$2<AttrSource$1, readonly AttrSource$1[]>;
    /**
    An extension that enables line wrapping in the editor (by
    setting CSS `white-space` to `pre-wrap` in the content).
    */
    static lineWrapping: Extension$2;
    /**
    State effect used to include screen reader announcements in a
    transaction. These will be added to the DOM in a visually hidden
    element with `aria-live="polite"` set, and should be used to
    describe effects that are visually obvious but may not be
    noticed by screen reader users (such as moving to the next
    search match).
    */
    static announce: StateEffectType$2<string>;
    /**
    Retrieve an editor view instance from the view's DOM
    representation.
    */
    static findFromDOM(dom: HTMLElement): EditorView$1 | null;
}
/**
Helper type that maps event names to event object types, or the
`any` type for unknown events.
*/
interface DOMEventMap$1 extends HTMLElementEventMap {
    [other: string]: any;
}
/**
Event handlers are specified with objects like this. For event
types known by TypeScript, this will infer the event argument type
to hold the appropriate event object type. For unknown events, it
is inferred to `any`, and should be explicitly set if you want type
checking.
*/
declare type DOMEventHandlers$1<This> = {
    [event in keyof DOMEventMap$1]?: (this: This, event: DOMEventMap$1[event], view: EditorView$1) => boolean | void;
};

/**
Key bindings associate key names with
[command](https://codemirror.net/6/docs/ref/#view.Command)-style functions.

Key names may be strings like `"Shift-Ctrl-Enter"`—a key identifier
prefixed with zero or more modifiers. Key identifiers are based on
the strings that can appear in
[`KeyEvent.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).
Use lowercase letters to refer to letter keys (or uppercase letters
if you want shift to be held). You may use `"Space"` as an alias
for the `" "` name.

Modifiers can be given in any order. `Shift-` (or `s-`), `Alt-` (or
`a-`), `Ctrl-` (or `c-` or `Control-`) and `Cmd-` (or `m-` or
`Meta-`) are recognized.

When a key binding contains multiple key names separated by
spaces, it represents a multi-stroke binding, which will fire when
the user presses the given keys after each other.

You can use `Mod-` as a shorthand for `Cmd-` on Mac and `Ctrl-` on
other platforms. So `Mod-b` is `Ctrl-b` on Linux but `Cmd-b` on
macOS.
*/
interface KeyBinding {
    /**
    The key name to use for this binding. If the platform-specific
    property (`mac`, `win`, or `linux`) for the current platform is
    used as well in the binding, that one takes precedence. If `key`
    isn't defined and the platform-specific binding isn't either,
    a binding is ignored.
    */
    key?: string;
    /**
    Key to use specifically on macOS.
    */
    mac?: string;
    /**
    Key to use specifically on Windows.
    */
    win?: string;
    /**
    Key to use specifically on Linux.
    */
    linux?: string;
    /**
    The command to execute when this binding is triggered. When the
    command function returns `false`, further bindings will be tried
    for the key.
    */
    run?: Command;
    /**
    When given, this defines a second binding, using the (possibly
    platform-specific) key name prefixed with `Shift-` to activate
    this command.
    */
    shift?: Command;
    /**
    When this property is present, the function is called for every
    key that is not a multi-stroke prefix.
    */
    any?: (view: EditorView$1, event: KeyboardEvent) => boolean;
    /**
    By default, key bindings apply when focus is on the editor
    content (the `"editor"` scope). Some extensions, mostly those
    that define their own panels, might want to allow you to
    register bindings local to that panel. Such bindings should use
    a custom scope name. You may also assign multiple scope names to
    a binding, separating them by spaces.
    */
    scope?: string;
    /**
    When set to true (the default is false), this will always
    prevent the further handling for the bound key, even if the
    command(s) return false. This can be useful for cases where the
    native behavior of the key is annoying or irrelevant but the
    command doesn't always apply (such as, Mod-u for undo selection,
    which would cause the browser to view source instead when no
    selection can be undone).
    */
    preventDefault?: boolean;
}

declare type HighlightOptions = {
    /**
    Determines whether, when nothing is selected, the word around
    the cursor is matched instead. Defaults to false.
    */
    highlightWordAroundCursor?: boolean;
    /**
    The minimum length of the selection before it is highlighted.
    Defaults to 1 (always highlight non-cursor selections).
    */
    minSelectionLength?: number;
    /**
    The amount of matches (in the viewport) at which to disable
    highlighting. Defaults to 100.
    */
    maxMatches?: number;
    /**
    Whether to only highlight whole words.
    */
    wholeWords?: boolean;
};
/**
This extension highlights text that matches the selection. It uses
the `"cm-selectionMatch"` class for the highlighting. When
`highlightWordAroundCursor` is enabled, the word at the cursor
itself will be highlighted with `"cm-selectionMatch-main"`.
*/
declare function highlightSelectionMatches(options?: HighlightOptions): Extension$2;
/**
Select next occurrence of the current selection. Expand selection
to the surrounding word when the selection is empty.
*/
declare const selectNextOccurrence: StateCommand;
/**
Default search-related key bindings.

 - Mod-f: [`openSearchPanel`](https://codemirror.net/6/docs/ref/#search.openSearchPanel)
 - F3, Mod-g: [`findNext`](https://codemirror.net/6/docs/ref/#search.findNext)
 - Shift-F3, Shift-Mod-g: [`findPrevious`](https://codemirror.net/6/docs/ref/#search.findPrevious)
 - Alt-g: [`gotoLine`](https://codemirror.net/6/docs/ref/#search.gotoLine)
 - Mod-d: [`selectNextOccurrence`](https://codemirror.net/6/docs/ref/#search.selectNextOccurrence)
*/
declare const searchKeymap: readonly KeyBinding[];

interface ChangedRange$1 {
    fromA: number;
    toA: number;
    fromB: number;
    toB: number;
}
declare class TreeFragment$1 {
    readonly from: number;
    readonly to: number;
    readonly tree: Tree$1;
    readonly offset: number;
    constructor(from: number, to: number, tree: Tree$1, offset: number, openStart?: boolean, openEnd?: boolean);
    get openStart(): boolean;
    get openEnd(): boolean;
    static addTree(tree: Tree$1, fragments?: readonly TreeFragment$1[], partial?: boolean): TreeFragment$1[];
    static applyChanges(fragments: readonly TreeFragment$1[], changes: readonly ChangedRange$1[], minGap?: number): readonly TreeFragment$1[];
}
interface PartialParse$1 {
    advance(): Tree$1 | null;
    readonly parsedPos: number;
    stopAt(pos: number): void;
    readonly stoppedAt: number | null;
}
declare abstract class Parser$1 {
    abstract createParse(input: Input$1, fragments: readonly TreeFragment$1[], ranges: readonly {
        from: number;
        to: number;
    }[]): PartialParse$1;
    startParse(input: Input$1 | string, fragments?: readonly TreeFragment$1[], ranges?: readonly {
        from: number;
        to: number;
    }[]): PartialParse$1;
    parse(input: Input$1 | string, fragments?: readonly TreeFragment$1[], ranges?: readonly {
        from: number;
        to: number;
    }[]): Tree$1;
}
interface Input$1 {
    readonly length: number;
    chunk(from: number): string;
    readonly lineChunks: boolean;
    read(from: number, to: number): string;
}
declare type ParseWrapper = (inner: PartialParse$1, input: Input$1, fragments: readonly TreeFragment$1[], ranges: readonly {
    from: number;
    to: number;
}[]) => PartialParse$1;

declare class NodeProp$1<T> {
    perNode: boolean;
    deserialize: (str: string) => T;
    constructor(config?: {
        deserialize?: (str: string) => T;
        perNode?: boolean;
    });
    add(match: {
        [selector: string]: T;
    } | ((type: NodeType$1) => T | undefined)): NodePropSource$1;
    static closedBy: NodeProp$1<readonly string[]>;
    static openedBy: NodeProp$1<readonly string[]>;
    static group: NodeProp$1<readonly string[]>;
    static contextHash: NodeProp$1<number>;
    static lookAhead: NodeProp$1<number>;
    static mounted: NodeProp$1<MountedTree$1>;
}
declare class MountedTree$1 {
    readonly tree: Tree$1;
    readonly overlay: readonly {
        from: number;
        to: number;
    }[] | null;
    readonly parser: Parser$1;
    constructor(tree: Tree$1, overlay: readonly {
        from: number;
        to: number;
    }[] | null, parser: Parser$1);
}
declare type NodePropSource$1 = (type: NodeType$1) => null | [NodeProp$1<any>, any];
declare class NodeType$1 {
    readonly name: string;
    readonly id: number;
    static define(spec: {
        id: number;
        name?: string;
        props?: readonly ([NodeProp$1<any>, any] | NodePropSource$1)[];
        top?: boolean;
        error?: boolean;
        skipped?: boolean;
    }): NodeType$1;
    prop<T>(prop: NodeProp$1<T>): T | undefined;
    get isTop(): boolean;
    get isSkipped(): boolean;
    get isError(): boolean;
    get isAnonymous(): boolean;
    is(name: string | number): boolean;
    static none: NodeType$1;
    static match<T>(map: {
        [selector: string]: T;
    }): (node: NodeType$1) => T | undefined;
}
declare class NodeSet$1 {
    readonly types: readonly NodeType$1[];
    constructor(types: readonly NodeType$1[]);
    extend(...props: NodePropSource$1[]): NodeSet$1;
}
declare enum IterMode$1 {
    ExcludeBuffers = 1,
    IncludeAnonymous = 2,
    IgnoreMounts = 4,
    IgnoreOverlays = 8
}
declare class Tree$1 {
    readonly type: NodeType$1;
    readonly children: readonly (Tree$1 | TreeBuffer$1)[];
    readonly positions: readonly number[];
    readonly length: number;
    constructor(type: NodeType$1, children: readonly (Tree$1 | TreeBuffer$1)[], positions: readonly number[], length: number, props?: readonly [NodeProp$1<any> | number, any][]);
    static empty: Tree$1;
    cursor(mode?: IterMode$1): TreeCursor$1;
    cursorAt(pos: number, side?: -1 | 0 | 1, mode?: IterMode$1): TreeCursor$1;
    get topNode(): SyntaxNode$1;
    resolve(pos: number, side?: -1 | 0 | 1): SyntaxNode$1;
    resolveInner(pos: number, side?: -1 | 0 | 1): SyntaxNode$1;
    iterate(spec: {
        enter(node: SyntaxNodeRef$1): boolean | void;
        leave?(node: SyntaxNodeRef$1): void;
        from?: number;
        to?: number;
        mode?: IterMode$1;
    }): void;
    prop<T>(prop: NodeProp$1<T>): T | undefined;
    get propValues(): readonly [NodeProp$1<any> | number, any][];
    balance(config?: {
        makeTree?: (children: readonly (Tree$1 | TreeBuffer$1)[], positions: readonly number[], length: number) => Tree$1;
    }): Tree$1;
    static build(data: BuildData$1): Tree$1;
}
declare type BuildData$1 = {
    buffer: BufferCursor$1 | readonly number[];
    nodeSet: NodeSet$1;
    topID: number;
    start?: number;
    bufferStart?: number;
    length?: number;
    maxBufferLength?: number;
    reused?: readonly Tree$1[];
    minRepeatType?: number;
};
interface BufferCursor$1 {
    pos: number;
    id: number;
    start: number;
    end: number;
    size: number;
    next(): void;
    fork(): BufferCursor$1;
}
declare class TreeBuffer$1 {
    readonly buffer: Uint16Array;
    readonly length: number;
    readonly set: NodeSet$1;
    constructor(buffer: Uint16Array, length: number, set: NodeSet$1);
}
interface SyntaxNodeRef$1 {
    readonly from: number;
    readonly to: number;
    readonly type: NodeType$1;
    readonly name: string;
    readonly tree: Tree$1 | null;
    readonly node: SyntaxNode$1;
    matchContext(context: readonly string[]): boolean;
}
interface SyntaxNode$1 extends SyntaxNodeRef$1 {
    parent: SyntaxNode$1 | null;
    firstChild: SyntaxNode$1 | null;
    lastChild: SyntaxNode$1 | null;
    childAfter(pos: number): SyntaxNode$1 | null;
    childBefore(pos: number): SyntaxNode$1 | null;
    enter(pos: number, side: -1 | 0 | 1, mode?: IterMode$1): SyntaxNode$1 | null;
    nextSibling: SyntaxNode$1 | null;
    prevSibling: SyntaxNode$1 | null;
    cursor(mode?: IterMode$1): TreeCursor$1;
    resolve(pos: number, side?: -1 | 0 | 1): SyntaxNode$1;
    resolveInner(pos: number, side?: -1 | 0 | 1): SyntaxNode$1;
    enterUnfinishedNodesBefore(pos: number): SyntaxNode$1;
    toTree(): Tree$1;
    getChild(type: string | number, before?: string | number | null, after?: string | number | null): SyntaxNode$1 | null;
    getChildren(type: string | number, before?: string | number | null, after?: string | number | null): SyntaxNode$1[];
    matchContext(context: readonly string[]): boolean;
}
declare class TreeCursor$1 implements SyntaxNodeRef$1 {
    type: NodeType$1;
    get name(): string;
    from: number;
    to: number;
    private stack;
    private bufferNode;
    private yieldNode;
    private yieldBuf;
    private yield;
    firstChild(): boolean;
    lastChild(): boolean;
    childAfter(pos: number): boolean;
    childBefore(pos: number): boolean;
    enter(pos: number, side: -1 | 0 | 1, mode?: IterMode$1): boolean;
    parent(): boolean;
    nextSibling(): boolean;
    prevSibling(): boolean;
    private atLastNode;
    private move;
    next(enter?: boolean): boolean;
    prev(enter?: boolean): boolean;
    moveTo(pos: number, side?: -1 | 0 | 1): this;
    get node(): SyntaxNode$1;
    get tree(): Tree$1 | null;
    iterate(enter: (node: SyntaxNodeRef$1) => boolean | void, leave?: (node: SyntaxNodeRef$1) => void): void;
    matchContext(context: readonly string[]): boolean;
}

declare class Tag {
    readonly set: Tag[];
    static define(parent?: Tag): Tag;
    static defineModifier(): (tag: Tag) => Tag;
}

declare class LeafBlock {
    readonly start: number;
    content: string;
    parsers: LeafBlockParser[];
}
declare class Line$2 {
    text: string;
    baseIndent: number;
    basePos: number;
    pos: number;
    indent: number;
    next: number;
    skipSpace(from: number): number;
    moveBase(to: number): void;
    moveBaseColumn(indent: number): void;
    addMarker(elt: Element$1): void;
    countIndent(to: number, from?: number, indent?: number): number;
    findColumn(goal: number): number;
}
declare type BlockResult = boolean | null;
declare class BlockContext implements PartialParse$1 {
    readonly parser: MarkdownParser;
    private line;
    private atEnd;
    private fragments;
    private to;
    stoppedAt: number | null;
    lineStart: number;
    get parsedPos(): number;
    advance(): Tree$1;
    stopAt(pos: number): void;
    private reuseFragment;
    get depth(): number;
    parentType(depth?: number): NodeType$1;
    nextLine(): boolean;
    private moveRangeI;
    private lineChunkAt;
    prevLineEnd(): number;
    startComposite(type: string, start: number, value?: number): void;
    addElement(elt: Element$1): void;
    addLeafElement(leaf: LeafBlock, elt: Element$1): void;
    private finish;
    private addGaps;
    elt(type: string, from: number, to: number, children?: readonly Element$1[]): Element$1;
    elt(tree: Tree$1, at: number): Element$1;
}
interface NodeSpec {
    name: string;
    block?: boolean;
    composite?(cx: BlockContext, line: Line$2, value: number): boolean;
    style?: Tag | readonly Tag[] | {
        [selector: string]: Tag | readonly Tag[];
    };
}
interface InlineParser {
    name: string;
    parse(cx: InlineContext, next: number, pos: number): number;
    before?: string;
    after?: string;
}
interface BlockParser {
    name: string;
    parse?(cx: BlockContext, line: Line$2): BlockResult;
    leaf?(cx: BlockContext, leaf: LeafBlock): LeafBlockParser | null;
    endLeaf?(cx: BlockContext, line: Line$2, leaf: LeafBlock): boolean;
    before?: string;
    after?: string;
}
interface LeafBlockParser {
    nextLine(cx: BlockContext, line: Line$2, leaf: LeafBlock): boolean;
    finish(cx: BlockContext, leaf: LeafBlock): boolean;
}
interface MarkdownConfig {
    props?: readonly NodePropSource$1[];
    defineNodes?: readonly (string | NodeSpec)[];
    parseBlock?: readonly BlockParser[];
    parseInline?: readonly InlineParser[];
    remove?: readonly string[];
    wrap?: ParseWrapper;
}
declare type MarkdownExtension = MarkdownConfig | readonly MarkdownExtension[];
declare class MarkdownParser extends Parser$1 {
    readonly nodeSet: NodeSet$1;
    createParse(input: Input$1, fragments: readonly TreeFragment$1[], ranges: readonly {
        from: number;
        to: number;
    }[]): PartialParse$1;
    configure(spec: MarkdownExtension): MarkdownParser;
    parseInline(text: string, offset: number): any[];
}
declare class Element$1 {
    readonly type: number;
    readonly from: number;
    readonly to: number;
}
interface DelimiterType {
    resolve?: string;
    mark?: string;
}
declare class InlineContext {
    readonly parser: MarkdownParser;
    readonly text: string;
    readonly offset: number;
    char(pos: number): number;
    get end(): number;
    slice(from: number, to: number): string;
    addDelimiter(type: DelimiterType, from: number, to: number, open: boolean, close: boolean): number;
    addElement(elt: Element$1): number;
    findOpeningDelimiter(type: DelimiterType): number;
    takeContent(startIndex: number): any[];
    skipSpace(from: number): number;
    elt(type: string, from: number, to: number, children?: readonly Element$1[]): Element$1;
    elt(tree: Tree$1, at: number): Element$1;
}

declare function parseCode(config: {
    codeParser?: (info: string) => null | Parser$1;
    htmlParser?: Parser$1;
}): MarkdownExtension;

/**
Language support for [GFM](https://github.github.com/gfm/) plus
subscript, superscript, and emoji syntax.
*/
declare const markdownLanguage: Language;
/**
Markdown language support.
*/
declare function markdown(config?: {
    /**
    When given, this language will be used by default to parse code
    blocks.
    */
    defaultCodeLanguage?: Language | LanguageSupport;
    /**
    A source of language support for highlighting fenced code
    blocks. When it is an array, the parser will use
    [`LanguageDescription.matchLanguageName`](https://codemirror.net/6/docs/ref/#language.LanguageDescription^matchLanguageName)
    with the fenced code info to find a matching language. When it
    is a function, will be called with the info string and may
    return a language or `LanguageDescription` object.
    */
    codeLanguages?: readonly LanguageDescription[] | ((info: string) => Language | LanguageDescription | null);
    /**
    Set this to false to disable installation of the Markdown
    [keymap](https://codemirror.net/6/docs/ref/#lang-markdown.markdownKeymap).
    */
    addKeymap?: boolean;
    /**
    Markdown parser
    [extensions](https://github.com/lezer-parser/markdown#user-content-markdownextension)
    to add to the parser.
    */
    extensions?: MarkdownExtension;
    /**
    The base language to use. Defaults to
    [`commonmarkLanguage`](https://codemirror.net/6/docs/ref/#lang-markdown.commonmarkLanguage).
    */
    base?: Language;
}): LanguageSupport;

interface ChangedRange {
    fromA: number;
    toA: number;
    fromB: number;
    toB: number;
}
declare class TreeFragment {
    readonly from: number;
    readonly to: number;
    readonly tree: Tree;
    readonly offset: number;
    constructor(from: number, to: number, tree: Tree, offset: number, openStart?: boolean, openEnd?: boolean);
    get openStart(): boolean;
    get openEnd(): boolean;
    static addTree(tree: Tree, fragments?: readonly TreeFragment[], partial?: boolean): TreeFragment[];
    static applyChanges(fragments: readonly TreeFragment[], changes: readonly ChangedRange[], minGap?: number): readonly TreeFragment[];
}
interface PartialParse {
    advance(): Tree | null;
    readonly parsedPos: number;
    stopAt(pos: number): void;
    readonly stoppedAt: number | null;
}
declare abstract class Parser {
    abstract createParse(input: Input, fragments: readonly TreeFragment[], ranges: readonly {
        from: number;
        to: number;
    }[]): PartialParse;
    startParse(input: Input | string, fragments?: readonly TreeFragment[], ranges?: readonly {
        from: number;
        to: number;
    }[]): PartialParse;
    parse(input: Input | string, fragments?: readonly TreeFragment[], ranges?: readonly {
        from: number;
        to: number;
    }[]): Tree;
}
interface Input {
    readonly length: number;
    chunk(from: number): string;
    readonly lineChunks: boolean;
    read(from: number, to: number): string;
}

declare class NodeProp<T> {
    perNode: boolean;
    deserialize: (str: string) => T;
    constructor(config?: {
        deserialize?: (str: string) => T;
        perNode?: boolean;
    });
    add(match: {
        [selector: string]: T;
    } | ((type: NodeType) => T | undefined)): NodePropSource;
    static closedBy: NodeProp<readonly string[]>;
    static openedBy: NodeProp<readonly string[]>;
    static group: NodeProp<readonly string[]>;
    static contextHash: NodeProp<number>;
    static lookAhead: NodeProp<number>;
    static mounted: NodeProp<MountedTree>;
}
declare class MountedTree {
    readonly tree: Tree;
    readonly overlay: readonly {
        from: number;
        to: number;
    }[] | null;
    readonly parser: Parser;
    constructor(tree: Tree, overlay: readonly {
        from: number;
        to: number;
    }[] | null, parser: Parser);
}
declare type NodePropSource = (type: NodeType) => null | [NodeProp<any>, any];
declare class NodeType {
    readonly name: string;
    readonly id: number;
    static define(spec: {
        id: number;
        name?: string;
        props?: readonly ([NodeProp<any>, any] | NodePropSource)[];
        top?: boolean;
        error?: boolean;
        skipped?: boolean;
    }): NodeType;
    prop<T>(prop: NodeProp<T>): T | undefined;
    get isTop(): boolean;
    get isSkipped(): boolean;
    get isError(): boolean;
    get isAnonymous(): boolean;
    is(name: string | number): boolean;
    static none: NodeType;
    static match<T>(map: {
        [selector: string]: T;
    }): (node: NodeType) => T | undefined;
}
declare class NodeSet {
    readonly types: readonly NodeType[];
    constructor(types: readonly NodeType[]);
    extend(...props: NodePropSource[]): NodeSet;
}
declare enum IterMode {
    ExcludeBuffers = 1,
    IncludeAnonymous = 2,
    IgnoreMounts = 4,
    IgnoreOverlays = 8
}
declare class Tree {
    readonly type: NodeType;
    readonly children: readonly (Tree | TreeBuffer)[];
    readonly positions: readonly number[];
    readonly length: number;
    constructor(type: NodeType, children: readonly (Tree | TreeBuffer)[], positions: readonly number[], length: number, props?: readonly [NodeProp<any> | number, any][]);
    static empty: Tree;
    cursor(mode?: IterMode): TreeCursor;
    cursorAt(pos: number, side?: -1 | 0 | 1, mode?: IterMode): TreeCursor;
    get topNode(): SyntaxNode;
    resolve(pos: number, side?: -1 | 0 | 1): SyntaxNode;
    resolveInner(pos: number, side?: -1 | 0 | 1): SyntaxNode;
    iterate(spec: {
        enter(node: SyntaxNodeRef): boolean | void;
        leave?(node: SyntaxNodeRef): void;
        from?: number;
        to?: number;
        mode?: IterMode;
    }): void;
    prop<T>(prop: NodeProp<T>): T | undefined;
    get propValues(): readonly [NodeProp<any> | number, any][];
    balance(config?: {
        makeTree?: (children: readonly (Tree | TreeBuffer)[], positions: readonly number[], length: number) => Tree;
    }): Tree;
    static build(data: BuildData): Tree;
}
declare type BuildData = {
    buffer: BufferCursor | readonly number[];
    nodeSet: NodeSet;
    topID: number;
    start?: number;
    bufferStart?: number;
    length?: number;
    maxBufferLength?: number;
    reused?: readonly Tree[];
    minRepeatType?: number;
};
interface BufferCursor {
    pos: number;
    id: number;
    start: number;
    end: number;
    size: number;
    next(): void;
    fork(): BufferCursor;
}
declare class TreeBuffer {
    readonly buffer: Uint16Array;
    readonly length: number;
    readonly set: NodeSet;
    constructor(buffer: Uint16Array, length: number, set: NodeSet);
}
interface SyntaxNodeRef {
    readonly from: number;
    readonly to: number;
    readonly type: NodeType;
    readonly name: string;
    readonly tree: Tree | null;
    readonly node: SyntaxNode;
    matchContext(context: readonly string[]): boolean;
}
interface SyntaxNode extends SyntaxNodeRef {
    parent: SyntaxNode | null;
    firstChild: SyntaxNode | null;
    lastChild: SyntaxNode | null;
    childAfter(pos: number): SyntaxNode | null;
    childBefore(pos: number): SyntaxNode | null;
    enter(pos: number, side: -1 | 0 | 1, mode?: IterMode): SyntaxNode | null;
    nextSibling: SyntaxNode | null;
    prevSibling: SyntaxNode | null;
    cursor(mode?: IterMode): TreeCursor;
    resolve(pos: number, side?: -1 | 0 | 1): SyntaxNode;
    resolveInner(pos: number, side?: -1 | 0 | 1): SyntaxNode;
    enterUnfinishedNodesBefore(pos: number): SyntaxNode;
    toTree(): Tree;
    getChild(type: string | number, before?: string | number | null, after?: string | number | null): SyntaxNode | null;
    getChildren(type: string | number, before?: string | number | null, after?: string | number | null): SyntaxNode[];
    matchContext(context: readonly string[]): boolean;
}
declare class TreeCursor implements SyntaxNodeRef {
    type: NodeType;
    get name(): string;
    from: number;
    to: number;
    private stack;
    private bufferNode;
    private yieldNode;
    private yieldBuf;
    private yield;
    firstChild(): boolean;
    lastChild(): boolean;
    childAfter(pos: number): boolean;
    childBefore(pos: number): boolean;
    enter(pos: number, side: -1 | 0 | 1, mode?: IterMode): boolean;
    parent(): boolean;
    nextSibling(): boolean;
    prevSibling(): boolean;
    private atLastNode;
    private move;
    next(enter?: boolean): boolean;
    prev(enter?: boolean): boolean;
    moveTo(pos: number, side?: -1 | 0 | 1): this;
    get node(): SyntaxNode;
    get tree(): Tree | null;
    iterate(enter: (node: SyntaxNodeRef) => boolean | void, leave?: (node: SyntaxNodeRef) => void): void;
    matchContext(context: readonly string[]): boolean;
}

/**
Type used to specify tags to complete.
*/
interface TagSpec {
    /**
    Define tag-specific attributes. Property names are attribute
    names, and property values can be null to indicate free-form
    attributes, or a list of strings for suggested attribute values.
    */
    attrs?: Record<string, null | readonly string[]>;
    /**
    When set to false, don't complete global attributes on this tag.
    */
    globalAttrs?: boolean;
    /**
    Can be used to specify a list of child tags that are valid
    inside this tag. The default is to allow any tag.
    */
    children?: readonly string[];
}

declare type NestedLang = {
    tag: "script" | "style" | "textarea";
    attrs?: (attrs: {
        [attr: string]: string;
    }) => boolean;
    parser: Parser;
};
declare type NestedAttr = {
    name: string;
    tagName?: string;
    parser: Parser;
};
/**
A language provider based on the [Lezer HTML
parser](https://github.com/lezer-parser/html), extended with the
JavaScript and CSS parsers to parse the content of `<script>` and
`<style>` tags.
*/
declare const htmlLanguage: LRLanguage;
/**
Language support for HTML, including
[`htmlCompletion`](https://codemirror.net/6/docs/ref/#lang-html.htmlCompletion) and JavaScript and
CSS support extensions.
*/
declare function html(config?: {
    /**
    By default, the syntax tree will highlight mismatched closing
    tags. Set this to `false` to turn that off (for example when you
    expect to only be parsing a fragment of HTML text, not a full
    document).
    */
    matchClosingTags?: boolean;
    selfClosingTags?: boolean;
    /**
    Determines whether [`autoCloseTags`](https://codemirror.net/6/docs/ref/#lang-html.autoCloseTags)
    is included in the support extensions. Defaults to true.
    */
    autoCloseTags?: boolean;
    /**
    Add additional tags that can be completed.
    */
    extraTags?: Record<string, TagSpec>;
    /**
    Add additional completable attributes to all tags.
    */
    extraGlobalAttributes?: Record<string, null | readonly string[]>;
    /**
    Register additional languages to parse the content of script,
    style, or textarea tags. If given, `attrs` should be a function
    that, given an object representing the tag's attributes, returns
    `true` if this language applies.
    */
    nestedLanguages?: NestedLang[];
    /**
    Register additional languages to parse attribute values with.
    */
    nestedAttributes?: NestedAttr[];
}): LanguageSupport;

/**
A language provider based on the [Lezer JavaScript
parser](https://github.com/lezer-parser/javascript), extended with
highlighting and indentation information.
*/
declare const javascriptLanguage: LRLanguage;
/**
JavaScript support. Includes [snippet](https://codemirror.net/6/docs/ref/#lang-javascript.snippets)
completion.
*/
declare function javascript(config?: {
    jsx?: boolean;
    typescript?: boolean;
}): LanguageSupport;

/**
A language provider based on the [Lezer CSS
parser](https://github.com/lezer-parser/css), extended with
highlighting and indentation information.
*/
declare const cssLanguage: LRLanguage;
/**
Language support for CSS.
*/
declare function css(): LanguageSupport;

/**
A text iterator iterates over a sequence of strings. When
iterating over a [`Text`](https://codemirror.net/6/docs/ref/#state.Text) document, result values will
either be lines or line breaks.
*/
interface TextIterator$1 extends Iterator<string>, Iterable<string> {
    /**
    Retrieve the next string. Optionally skip a given number of
    positions after the current position. Always returns the object
    itself.
    */
    next(skip?: number): this;
    /**
    The current string. Will be the empty string when the cursor is
    at its end or `next` hasn't been called on it yet.
    */
    value: string;
    /**
    Whether the end of the iteration has been reached. You should
    probably check this right after calling `next`.
    */
    done: boolean;
    /**
    Whether the current string represents a line break.
    */
    lineBreak: boolean;
}
/**
The data structure for documents. @nonabstract
*/
declare abstract class Text$1 implements Iterable<string> {
    /**
    The length of the string.
    */
    abstract readonly length: number;
    /**
    The number of lines in the string (always >= 1).
    */
    abstract readonly lines: number;
    /**
    Get the line description around the given position.
    */
    lineAt(pos: number): Line$1;
    /**
    Get the description for the given (1-based) line number.
    */
    line(n: number): Line$1;
    /**
    Replace a range of the text with the given content.
    */
    replace(from: number, to: number, text: Text$1): Text$1;
    /**
    Append another document to this one.
    */
    append(other: Text$1): Text$1;
    /**
    Retrieve the text between the given points.
    */
    slice(from: number, to?: number): Text$1;
    /**
    Retrieve a part of the document as a string
    */
    abstract sliceString(from: number, to?: number, lineSep?: string): string;
    /**
    Test whether this text is equal to another instance.
    */
    eq(other: Text$1): boolean;
    /**
    Iterate over the text. When `dir` is `-1`, iteration happens
    from end to start. This will return lines and the breaks between
    them as separate strings.
    */
    iter(dir?: 1 | -1): TextIterator$1;
    /**
    Iterate over a range of the text. When `from` > `to`, the
    iterator will run in reverse.
    */
    iterRange(from: number, to?: number): TextIterator$1;
    /**
    Return a cursor that iterates over the given range of lines,
    _without_ returning the line breaks between, and yielding empty
    strings for empty lines.
    
    When `from` and `to` are given, they should be 1-based line numbers.
    */
    iterLines(from?: number, to?: number): TextIterator$1;
    /**
    Convert the document to an array of lines (which can be
    deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#state.Text^of)).
    */
    toJSON(): string[];
    /**
    If this is a branch node, `children` will hold the `Text`
    objects that it is made up of. For leaf nodes, this holds null.
    */
    abstract readonly children: readonly Text$1[] | null;
    [Symbol.iterator]: () => Iterator<string>;
    /**
    Create a `Text` instance for the given array of lines.
    */
    static of(text: readonly string[]): Text$1;
    /**
    The empty document.
    */
    static empty: Text$1;
}
/**
This type describes a line in the document. It is created
on-demand when lines are [queried](https://codemirror.net/6/docs/ref/#state.Text.lineAt).
*/
declare class Line$1 {
    /**
    The position of the start of the line.
    */
    readonly from: number;
    /**
    The position at the end of the line (_before_ the line break,
    or at the end of document for the last line).
    */
    readonly to: number;
    /**
    This line's line number (1-based).
    */
    readonly number: number;
    /**
    The line's content.
    */
    readonly text: string;
    /**
    The length of the line (not including any line break after it).
    */
    get length(): number;
}

/**
Distinguishes different ways in which positions can be mapped.
*/
declare enum MapMode$1 {
    /**
    Map a position to a valid new position, even when its context
    was deleted.
    */
    Simple = 0,
    /**
    Return null if deletion happens across the position.
    */
    TrackDel = 1,
    /**
    Return null if the character _before_ the position is deleted.
    */
    TrackBefore = 2,
    /**
    Return null if the character _after_ the position is deleted.
    */
    TrackAfter = 3
}
/**
A change description is a variant of [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet)
that doesn't store the inserted text. As such, it can't be
applied, but is cheaper to store and manipulate.
*/
declare class ChangeDesc$1 {
    /**
    The length of the document before the change.
    */
    get length(): number;
    /**
    The length of the document after the change.
    */
    get newLength(): number;
    /**
    False when there are actual changes in this set.
    */
    get empty(): boolean;
    /**
    Iterate over the unchanged parts left by these changes. `posA`
    provides the position of the range in the old document, `posB`
    the new position in the changed document.
    */
    iterGaps(f: (posA: number, posB: number, length: number) => void): void;
    /**
    Iterate over the ranges changed by these changes. (See
    [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
    variant that also provides you with the inserted text.)
    `fromA`/`toA` provides the extent of the change in the starting
    document, `fromB`/`toB` the extent of the replacement in the
    changed document.
    
    When `individual` is true, adjacent changes (which are kept
    separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
    reported separately.
    */
    iterChangedRanges(f: (fromA: number, toA: number, fromB: number, toB: number) => void, individual?: boolean): void;
    /**
    Get a description of the inverted form of these changes.
    */
    get invertedDesc(): ChangeDesc$1;
    /**
    Compute the combined effect of applying another set of changes
    after this one. The length of the document after this set should
    match the length before `other`.
    */
    composeDesc(other: ChangeDesc$1): ChangeDesc$1;
    /**
    Map this description, which should start with the same document
    as `other`, over another set of changes, so that it can be
    applied after it. When `before` is true, map as if the changes
    in `other` happened before the ones in `this`.
    */
    mapDesc(other: ChangeDesc$1, before?: boolean): ChangeDesc$1;
    /**
    Map a given position through these changes, to produce a
    position pointing into the new document.
    
    `assoc` indicates which side the position should be associated
    with. When it is negative or zero, the mapping will try to keep
    the position close to the character before it (if any), and will
    move it before insertions at that point or replacements across
    that point. When it is positive, the position is associated with
    the character after it, and will be moved forward for insertions
    at or replacements across the position. Defaults to -1.
    
    `mode` determines whether deletions should be
    [reported](https://codemirror.net/6/docs/ref/#state.MapMode). It defaults to
    [`MapMode.Simple`](https://codemirror.net/6/docs/ref/#state.MapMode.Simple) (don't report
    deletions).
    */
    mapPos(pos: number, assoc?: number): number;
    mapPos(pos: number, assoc: number, mode: MapMode$1): number | null;
    /**
    Check whether these changes touch a given range. When one of the
    changes entirely covers the range, the string `"cover"` is
    returned.
    */
    touchesRange(from: number, to?: number): boolean | "cover";
    /**
    Serialize this change desc to a JSON-representable value.
    */
    toJSON(): readonly number[];
    /**
    Create a change desc from its JSON representation (as produced
    by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
    */
    static fromJSON(json: any): ChangeDesc$1;
}
/**
This type is used as argument to
[`EditorState.changes`](https://codemirror.net/6/docs/ref/#state.EditorState.changes) and in the
[`changes` field](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) of transaction
specs to succinctly describe document changes. It may either be a
plain object describing a change (a deletion, insertion, or
replacement, depending on which fields are present), a [change
set](https://codemirror.net/6/docs/ref/#state.ChangeSet), or an array of change specs.
*/
declare type ChangeSpec$1 = {
    from: number;
    to?: number;
    insert?: string | Text$1;
} | ChangeSet$1 | readonly ChangeSpec$1[];
/**
A change set represents a group of modifications to a document. It
stores the document length, and can only be applied to documents
with exactly that length.
*/
declare class ChangeSet$1 extends ChangeDesc$1 {
    private constructor();
    /**
    Apply the changes to a document, returning the modified
    document.
    */
    apply(doc: Text$1): Text$1;
    mapDesc(other: ChangeDesc$1, before?: boolean): ChangeDesc$1;
    /**
    Given the document as it existed _before_ the changes, return a
    change set that represents the inverse of this set, which could
    be used to go from the document created by the changes back to
    the document as it existed before the changes.
    */
    invert(doc: Text$1): ChangeSet$1;
    /**
    Combine two subsequent change sets into a single set. `other`
    must start in the document produced by `this`. If `this` goes
    `docA` → `docB` and `other` represents `docB` → `docC`, the
    returned value will represent the change `docA` → `docC`.
    */
    compose(other: ChangeSet$1): ChangeSet$1;
    /**
    Given another change set starting in the same document, maps this
    change set over the other, producing a new change set that can be
    applied to the document produced by applying `other`. When
    `before` is `true`, order changes as if `this` comes before
    `other`, otherwise (the default) treat `other` as coming first.
    
    Given two changes `A` and `B`, `A.compose(B.map(A))` and
    `B.compose(A.map(B, true))` will produce the same document. This
    provides a basic form of [operational
    transformation](https://en.wikipedia.org/wiki/Operational_transformation),
    and can be used for collaborative editing.
    */
    map(other: ChangeDesc$1, before?: boolean): ChangeSet$1;
    /**
    Iterate over the changed ranges in the document, calling `f` for
    each, with the range in the original document (`fromA`-`toA`)
    and the range that replaces it in the new document
    (`fromB`-`toB`).
    
    When `individual` is true, adjacent changes are reported
    separately.
    */
    iterChanges(f: (fromA: number, toA: number, fromB: number, toB: number, inserted: Text$1) => void, individual?: boolean): void;
    /**
    Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
    set.
    */
    get desc(): ChangeDesc$1;
    /**
    Serialize this change set to a JSON-representable value.
    */
    toJSON(): any;
    /**
    Create a change set for the given changes, for a document of the
    given length, using `lineSep` as line separator.
    */
    static of(changes: ChangeSpec$1, length: number, lineSep?: string): ChangeSet$1;
    /**
    Create an empty changeset of the given length.
    */
    static empty(length: number): ChangeSet$1;
    /**
    Create a changeset from its JSON representation (as produced by
    [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
    */
    static fromJSON(json: any): ChangeSet$1;
}

/**
A single selection range. When
[`allowMultipleSelections`](https://codemirror.net/6/docs/ref/#state.EditorState^allowMultipleSelections)
is enabled, a [selection](https://codemirror.net/6/docs/ref/#state.EditorSelection) may hold
multiple ranges. By default, selections hold exactly one range.
*/
declare class SelectionRange$1 {
    /**
    The lower boundary of the range.
    */
    readonly from: number;
    /**
    The upper boundary of the range.
    */
    readonly to: number;
    private flags;
    private constructor();
    /**
    The anchor of the range—the side that doesn't move when you
    extend it.
    */
    get anchor(): number;
    /**
    The head of the range, which is moved when the range is
    [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
    */
    get head(): number;
    /**
    True when `anchor` and `head` are at the same position.
    */
    get empty(): boolean;
    /**
    If this is a cursor that is explicitly associated with the
    character on one of its sides, this returns the side. -1 means
    the character before its position, 1 the character after, and 0
    means no association.
    */
    get assoc(): -1 | 0 | 1;
    /**
    The bidirectional text level associated with this cursor, if
    any.
    */
    get bidiLevel(): number | null;
    /**
    The goal column (stored vertical offset) associated with a
    cursor. This is used to preserve the vertical position when
    [moving](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) across
    lines of different length.
    */
    get goalColumn(): number | undefined;
    /**
    Map this range through a change, producing a valid range in the
    updated document.
    */
    map(change: ChangeDesc$1, assoc?: number): SelectionRange$1;
    /**
    Extend this range to cover at least `from` to `to`.
    */
    extend(from: number, to?: number): SelectionRange$1;
    /**
    Compare this range to another range.
    */
    eq(other: SelectionRange$1): boolean;
    /**
    Return a JSON-serializable object representing the range.
    */
    toJSON(): any;
    /**
    Convert a JSON representation of a range to a `SelectionRange`
    instance.
    */
    static fromJSON(json: any): SelectionRange$1;
}
/**
An editor selection holds one or more selection ranges.
*/
declare class EditorSelection$1 {
    /**
    The ranges in the selection, sorted by position. Ranges cannot
    overlap (but they may touch, if they aren't empty).
    */
    readonly ranges: readonly SelectionRange$1[];
    /**
    The index of the _main_ range in the selection (which is
    usually the range that was added last).
    */
    readonly mainIndex: number;
    private constructor();
    /**
    Map a selection through a change. Used to adjust the selection
    position for changes.
    */
    map(change: ChangeDesc$1, assoc?: number): EditorSelection$1;
    /**
    Compare this selection to another selection.
    */
    eq(other: EditorSelection$1): boolean;
    /**
    Get the primary selection range. Usually, you should make sure
    your code applies to _all_ ranges, by using methods like
    [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
    */
    get main(): SelectionRange$1;
    /**
    Make sure the selection only has one range. Returns a selection
    holding only the main range from this selection.
    */
    asSingle(): EditorSelection$1;
    /**
    Extend this selection with an extra range.
    */
    addRange(range: SelectionRange$1, main?: boolean): EditorSelection$1;
    /**
    Replace a given range with another range, and then normalize the
    selection to merge and sort ranges if necessary.
    */
    replaceRange(range: SelectionRange$1, which?: number): EditorSelection$1;
    /**
    Convert this selection to an object that can be serialized to
    JSON.
    */
    toJSON(): any;
    /**
    Create a selection from a JSON representation.
    */
    static fromJSON(json: any): EditorSelection$1;
    /**
    Create a selection holding a single range.
    */
    static single(anchor: number, head?: number): EditorSelection$1;
    /**
    Sort and merge the given set of ranges, creating a valid
    selection.
    */
    static create(ranges: readonly SelectionRange$1[], mainIndex?: number): EditorSelection$1;
    /**
    Create a cursor selection range at the given position. You can
    safely ignore the optional arguments in most situations.
    */
    static cursor(pos: number, assoc?: number, bidiLevel?: number, goalColumn?: number): SelectionRange$1;
    /**
    Create a selection range.
    */
    static range(anchor: number, head: number, goalColumn?: number): SelectionRange$1;
}

declare type FacetConfig$1<Input, Output> = {
    /**
    How to combine the input values into a single output value. When
    not given, the array of input values becomes the output. This
    function will immediately be called on creating the facet, with
    an empty array, to compute the facet's default value when no
    inputs are present.
    */
    combine?: (value: readonly Input[]) => Output;
    /**
    How to compare output values to determine whether the value of
    the facet changed. Defaults to comparing by `===` or, if no
    `combine` function was given, comparing each element of the
    array with `===`.
    */
    compare?: (a: Output, b: Output) => boolean;
    /**
    How to compare input values to avoid recomputing the output
    value when no inputs changed. Defaults to comparing with `===`.
    */
    compareInput?: (a: Input, b: Input) => boolean;
    /**
    Forbids dynamic inputs to this facet.
    */
    static?: boolean;
    /**
    If given, these extension(s) (or the result of calling the given
    function with the facet) will be added to any state where this
    facet is provided. (Note that, while a facet's default value can
    be read from a state even if the facet wasn't present in the
    state at all, these extensions won't be added in that
    situation.)
    */
    enables?: Extension$1 | ((self: Facet$1<Input, Output>) => Extension$1);
};
/**
A facet is a labeled value that is associated with an editor
state. It takes inputs from any number of extensions, and combines
those into a single output value.

Examples of uses of facets are the [tab
size](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize), [editor
attributes](https://codemirror.net/6/docs/ref/#view.EditorView^editorAttributes), and [update
listeners](https://codemirror.net/6/docs/ref/#view.EditorView^updateListener).
*/
declare class Facet$1<Input, Output = readonly Input[]> {
    private isStatic;
    private constructor();
    /**
    Define a new facet.
    */
    static define<Input, Output = readonly Input[]>(config?: FacetConfig$1<Input, Output>): Facet$1<Input, Output>;
    /**
    Returns an extension that adds the given value to this facet.
    */
    of(value: Input): Extension$1;
    /**
    Create an extension that computes a value for the facet from a
    state. You must take care to declare the parts of the state that
    this value depends on, since your function is only called again
    for a new state when one of those parts changed.
    
    In cases where your value depends only on a single field, you'll
    want to use the [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method instead.
    */
    compute(deps: readonly Slot$1<any>[], get: (state: EditorState$1) => Input): Extension$1;
    /**
    Create an extension that computes zero or more values for this
    facet from a state.
    */
    computeN(deps: readonly Slot$1<any>[], get: (state: EditorState$1) => readonly Input[]): Extension$1;
    /**
    Shorthand method for registering a facet source with a state
    field as input. If the field's type corresponds to this facet's
    input type, the getter function can be omitted. If given, it
    will be used to retrieve the input from the field value.
    */
    from<T extends Input>(field: StateField$1<T>): Extension$1;
    from<T>(field: StateField$1<T>, get: (value: T) => Input): Extension$1;
}
declare type Slot$1<T> = Facet$1<any, T> | StateField$1<T> | "doc" | "selection";
declare type StateFieldSpec$1<Value> = {
    /**
    Creates the initial value for the field when a state is created.
    */
    create: (state: EditorState$1) => Value;
    /**
    Compute a new value from the field's previous value and a
    [transaction](https://codemirror.net/6/docs/ref/#state.Transaction).
    */
    update: (value: Value, transaction: Transaction$1) => Value;
    /**
    Compare two values of the field, returning `true` when they are
    the same. This is used to avoid recomputing facets that depend
    on the field when its value did not change. Defaults to using
    `===`.
    */
    compare?: (a: Value, b: Value) => boolean;
    /**
    Provide extensions based on this field. The given function will
    be called once with the initialized field. It will usually want
    to call some facet's [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method to
    create facet inputs from this field, but can also return other
    extensions that should be enabled when the field is present in a
    configuration.
    */
    provide?: (field: StateField$1<Value>) => Extension$1;
    /**
    A function used to serialize this field's content to JSON. Only
    necessary when this field is included in the argument to
    [`EditorState.toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON).
    */
    toJSON?: (value: Value, state: EditorState$1) => any;
    /**
    A function that deserializes the JSON representation of this
    field's content.
    */
    fromJSON?: (json: any, state: EditorState$1) => Value;
};
/**
Fields can store additional information in an editor state, and
keep it in sync with the rest of the state.
*/
declare class StateField$1<Value> {
    private createF;
    private updateF;
    private compareF;
    private constructor();
    /**
    Define a state field.
    */
    static define<Value>(config: StateFieldSpec$1<Value>): StateField$1<Value>;
    private create;
    /**
    Returns an extension that enables this field and overrides the
    way it is initialized. Can be useful when you need to provide a
    non-default starting value for the field.
    */
    init(create: (state: EditorState$1) => Value): Extension$1;
    /**
    State field instances can be used as
    [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
    given state.
    */
    get extension(): Extension$1;
}
/**
Extension values can be
[provided](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions) when creating a
state to attach various kinds of configuration and behavior
information. They can either be built-in extension-providing
objects, such as [state fields](https://codemirror.net/6/docs/ref/#state.StateField) or [facet
providers](https://codemirror.net/6/docs/ref/#state.Facet.of), or objects with an extension in its
`extension` property. Extensions can be nested in arrays
arbitrarily deep—they will be flattened when processed.
*/
declare type Extension$1 = {
    extension: Extension$1;
} | readonly Extension$1[];

/**
Annotations are tagged values that are used to add metadata to
transactions in an extensible way. They should be used to model
things that effect the entire transaction (such as its [time
stamp](https://codemirror.net/6/docs/ref/#state.Transaction^time) or information about its
[origin](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent)). For effects that happen
_alongside_ the other changes made by the transaction, [state
effects](https://codemirror.net/6/docs/ref/#state.StateEffect) are more appropriate.
*/
declare class Annotation$1<T> {
    /**
    The annotation type.
    */
    readonly type: AnnotationType$1<T>;
    /**
    The value of this annotation.
    */
    readonly value: T;
    /**
    Define a new type of annotation.
    */
    static define<T>(): AnnotationType$1<T>;
    private _isAnnotation;
}
/**
Marker that identifies a type of [annotation](https://codemirror.net/6/docs/ref/#state.Annotation).
*/
declare class AnnotationType$1<T> {
    /**
    Create an instance of this annotation.
    */
    of(value: T): Annotation$1<T>;
}
interface StateEffectSpec$1<Value> {
    /**
    Provides a way to map an effect like this through a position
    mapping. When not given, the effects will simply not be mapped.
    When the function returns `undefined`, that means the mapping
    deletes the effect.
    */
    map?: (value: Value, mapping: ChangeDesc$1) => Value | undefined;
}
/**
Representation of a type of state effect. Defined with
[`StateEffect.define`](https://codemirror.net/6/docs/ref/#state.StateEffect^define).
*/
declare class StateEffectType$1<Value> {
    /**
    @internal
    */
    readonly map: (value: any, mapping: ChangeDesc$1) => any | undefined;
    /**
    Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
    type.
    */
    of(value: Value): StateEffect$1<Value>;
}
/**
State effects can be used to represent additional effects
associated with a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction.effects). They
are often useful to model changes to custom [state
fields](https://codemirror.net/6/docs/ref/#state.StateField), when those changes aren't implicit in
document or selection changes.
*/
declare class StateEffect$1<Value> {
    /**
    The value of this effect.
    */
    readonly value: Value;
    /**
    Map this effect through a position mapping. Will return
    `undefined` when that ends up deleting the effect.
    */
    map(mapping: ChangeDesc$1): StateEffect$1<Value> | undefined;
    /**
    Tells you whether this effect object is of a given
    [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
    */
    is<T>(type: StateEffectType$1<T>): this is StateEffect$1<T>;
    /**
    Define a new effect type. The type parameter indicates the type
    of values that his effect holds.
    */
    static define<Value = null>(spec?: StateEffectSpec$1<Value>): StateEffectType$1<Value>;
    /**
    Map an array of effects through a change set.
    */
    static mapEffects(effects: readonly StateEffect$1<any>[], mapping: ChangeDesc$1): readonly StateEffect$1<any>[];
    /**
    This effect can be used to reconfigure the root extensions of
    the editor. Doing this will discard any extensions
    [appended](https://codemirror.net/6/docs/ref/#state.StateEffect^appendConfig), but does not reset
    the content of [reconfigured](https://codemirror.net/6/docs/ref/#state.Compartment.reconfigure)
    compartments.
    */
    static reconfigure: StateEffectType$1<Extension$1>;
    /**
    Append extensions to the top-level configuration of the editor.
    */
    static appendConfig: StateEffectType$1<Extension$1>;
}
/**
Describes a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) when calling the
[`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update) method.
*/
interface TransactionSpec$1 {
    /**
    The changes to the document made by this transaction.
    */
    changes?: ChangeSpec$1;
    /**
    When set, this transaction explicitly updates the selection.
    Offsets in this selection should refer to the document as it is
    _after_ the transaction.
    */
    selection?: EditorSelection$1 | {
        anchor: number;
        head?: number;
    };
    /**
    Attach [state effects](https://codemirror.net/6/docs/ref/#state.StateEffect) to this transaction.
    Again, when they contain positions and this same spec makes
    changes, those positions should refer to positions in the
    updated document.
    */
    effects?: StateEffect$1<any> | readonly StateEffect$1<any>[];
    /**
    Set [annotations](https://codemirror.net/6/docs/ref/#state.Annotation) for this transaction.
    */
    annotations?: Annotation$1<any> | readonly Annotation$1<any>[];
    /**
    Shorthand for `annotations:` [`Transaction.userEvent`](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent)`.of(...)`.
    */
    userEvent?: string;
    /**
    When set to `true`, the transaction is marked as needing to
    scroll the current selection into view.
    */
    scrollIntoView?: boolean;
    /**
    By default, transactions can be modified by [change
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^changeFilter) and [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter). You can set this
    to `false` to disable that. This can be necessary for
    transactions that, for example, include annotations that must be
    kept consistent with their changes.
    */
    filter?: boolean;
    /**
    Normally, when multiple specs are combined (for example by
    [`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update)), the
    positions in `changes` are taken to refer to the document
    positions in the initial document. When a spec has `sequental`
    set to true, its positions will be taken to refer to the
    document created by the specs before it instead.
    */
    sequential?: boolean;
}
/**
Changes to the editor state are grouped into transactions.
Typically, a user action creates a single transaction, which may
contain any number of document changes, may change the selection,
or have other effects. Create a transaction by calling
[`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update), or immediately
dispatch one by calling
[`EditorView.dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch).
*/
declare class Transaction$1 {
    /**
    The state from which the transaction starts.
    */
    readonly startState: EditorState$1;
    /**
    The document changes made by this transaction.
    */
    readonly changes: ChangeSet$1;
    /**
    The selection set by this transaction, or undefined if it
    doesn't explicitly set a selection.
    */
    readonly selection: EditorSelection$1 | undefined;
    /**
    The effects added to the transaction.
    */
    readonly effects: readonly StateEffect$1<any>[];
    /**
    Whether the selection should be scrolled into view after this
    transaction is dispatched.
    */
    readonly scrollIntoView: boolean;
    private constructor();
    /**
    The new document produced by the transaction. Contrary to
    [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
    force the entire new state to be computed right away, so it is
    recommended that [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
    when they need to look at the new document.
    */
    get newDoc(): Text$1;
    /**
    The new selection produced by the transaction. If
    [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
    this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
    current selection through the changes made by the transaction.
    */
    get newSelection(): EditorSelection$1;
    /**
    The new state created by the transaction. Computed on demand
    (but retained for subsequent access), so it is recommended not to
    access it in [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
    */
    get state(): EditorState$1;
    /**
    Get the value of the given annotation type, if any.
    */
    annotation<T>(type: AnnotationType$1<T>): T | undefined;
    /**
    Indicates whether the transaction changed the document.
    */
    get docChanged(): boolean;
    /**
    Indicates whether this transaction reconfigures the state
    (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
    with a top-level configuration
    [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
    */
    get reconfigured(): boolean;
    /**
    Returns true if the transaction has a [user
    event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
    or more specific than `event`. For example, if the transaction
    has `"select.pointer"` as user event, `"select"` and
    `"select.pointer"` will match it.
    */
    isUserEvent(event: string): boolean;
    /**
    Annotation used to store transaction timestamps. Automatically
    added to every transaction, holding `Date.now()`.
    */
    static time: AnnotationType$1<number>;
    /**
    Annotation used to associate a transaction with a user interface
    event. Holds a string identifying the event, using a
    dot-separated format to support attaching more specific
    information. The events used by the core libraries are:
    
     - `"input"` when content is entered
       - `"input.type"` for typed input
         - `"input.type.compose"` for composition
       - `"input.paste"` for pasted input
       - `"input.drop"` when adding content with drag-and-drop
       - `"input.complete"` when autocompleting
     - `"delete"` when the user deletes content
       - `"delete.selection"` when deleting the selection
       - `"delete.forward"` when deleting forward from the selection
       - `"delete.backward"` when deleting backward from the selection
       - `"delete.cut"` when cutting to the clipboard
     - `"move"` when content is moved
       - `"move.drop"` when content is moved within the editor through drag-and-drop
     - `"select"` when explicitly changing the selection
       - `"select.pointer"` when selecting with a mouse or other pointing device
     - `"undo"` and `"redo"` for history actions
    
    Use [`isUserEvent`](https://codemirror.net/6/docs/ref/#state.Transaction.isUserEvent) to check
    whether the annotation matches a given event.
    */
    static userEvent: AnnotationType$1<string>;
    /**
    Annotation indicating whether a transaction should be added to
    the undo history or not.
    */
    static addToHistory: AnnotationType$1<boolean>;
    /**
    Annotation indicating (when present and true) that a transaction
    represents a change made by some other actor, not the user. This
    is used, for example, to tag other people's changes in
    collaborative editing.
    */
    static remote: AnnotationType$1<boolean>;
}

/**
The categories produced by a [character
categorizer](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer). These are used
do things like selecting by word.
*/
declare enum CharCategory$1 {
    /**
    Word characters.
    */
    Word = 0,
    /**
    Whitespace.
    */
    Space = 1,
    /**
    Anything else.
    */
    Other = 2
}

/**
Options passed when [creating](https://codemirror.net/6/docs/ref/#state.EditorState^create) an
editor state.
*/
interface EditorStateConfig$1 {
    /**
    The initial document. Defaults to an empty document. Can be
    provided either as a plain string (which will be split into
    lines according to the value of the [`lineSeparator`
    facet](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)), or an instance of
    the [`Text`](https://codemirror.net/6/docs/ref/#state.Text) class (which is what the state will use
    to represent the document).
    */
    doc?: string | Text$1;
    /**
    The starting selection. Defaults to a cursor at the very start
    of the document.
    */
    selection?: EditorSelection$1 | {
        anchor: number;
        head?: number;
    };
    /**
    [Extension(s)](https://codemirror.net/6/docs/ref/#state.Extension) to associate with this state.
    */
    extensions?: Extension$1;
}
/**
The editor state class is a persistent (immutable) data structure.
To update a state, you [create](https://codemirror.net/6/docs/ref/#state.EditorState.update) a
[transaction](https://codemirror.net/6/docs/ref/#state.Transaction), which produces a _new_ state
instance, without modifying the original object.

As such, _never_ mutate properties of a state directly. That'll
just break things.
*/
declare class EditorState$1 {
    /**
    The current document.
    */
    readonly doc: Text$1;
    /**
    The current selection.
    */
    readonly selection: EditorSelection$1;
    private constructor();
    /**
    Retrieve the value of a [state field](https://codemirror.net/6/docs/ref/#state.StateField). Throws
    an error when the state doesn't have that field, unless you pass
    `false` as second parameter.
    */
    field<T>(field: StateField$1<T>): T;
    field<T>(field: StateField$1<T>, require: false): T | undefined;
    /**
    Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
    state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
    can be passed. Unless
    [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
    [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
    are assumed to start in the _current_ document (not the document
    produced by previous specs), and its
    [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
    [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
    to the document created by its _own_ changes. The resulting
    transaction contains the combined effect of all the different
    specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
    specs take precedence over earlier ones.
    */
    update(...specs: readonly TransactionSpec$1[]): Transaction$1;
    /**
    Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
    replaces every selection range with the given content.
    */
    replaceSelection(text: string | Text$1): TransactionSpec$1;
    /**
    Create a set of changes and a new selection by running the given
    function for each range in the active selection. The function
    can return an optional set of changes (in the coordinate space
    of the start document), plus an updated range (in the coordinate
    space of the document produced by the call's own changes). This
    method will merge all the changes and ranges into a single
    changeset and selection, and return it as a [transaction
    spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
    [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
    */
    changeByRange(f: (range: SelectionRange$1) => {
        range: SelectionRange$1;
        changes?: ChangeSpec$1;
        effects?: StateEffect$1<any> | readonly StateEffect$1<any>[];
    }): {
        changes: ChangeSet$1;
        selection: EditorSelection$1;
        effects: readonly StateEffect$1<any>[];
    };
    /**
    Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
    description, taking the state's document length and line
    separator into account.
    */
    changes(spec?: ChangeSpec$1): ChangeSet$1;
    /**
    Using the state's [line
    separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
    [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
    */
    toText(string: string): Text$1;
    /**
    Return the given range of the document as a string.
    */
    sliceDoc(from?: number, to?: number): string;
    /**
    Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
    */
    facet<Output>(facet: Facet$1<any, Output>): Output;
    /**
    Convert this state to a JSON-serializable object. When custom
    fields should be serialized, you can pass them in as an object
    mapping property names (in the resulting object, which should
    not use `doc` or `selection`) to fields.
    */
    toJSON(fields?: {
        [prop: string]: StateField$1<any>;
    }): any;
    /**
    Deserialize a state from its JSON representation. When custom
    fields should be deserialized, pass the same object you passed
    to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
    third argument.
    */
    static fromJSON(json: any, config?: EditorStateConfig$1, fields?: {
        [prop: string]: StateField$1<any>;
    }): EditorState$1;
    /**
    Create a new state. You'll usually only need this when
    initializing an editor—updated states are created by applying
    transactions.
    */
    static create(config?: EditorStateConfig$1): EditorState$1;
    /**
    A facet that, when enabled, causes the editor to allow multiple
    ranges to be selected. Be careful though, because by default the
    editor relies on the native DOM selection, which cannot handle
    multiple selections. An extension like
    [`drawSelection`](https://codemirror.net/6/docs/ref/#view.drawSelection) can be used to make
    secondary selections visible to the user.
    */
    static allowMultipleSelections: Facet$1<boolean, boolean>;
    /**
    Configures the tab size to use in this state. The first
    (highest-precedence) value of the facet is used. If no value is
    given, this defaults to 4.
    */
    static tabSize: Facet$1<number, number>;
    /**
    The size (in columns) of a tab in the document, determined by
    the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
    */
    get tabSize(): number;
    /**
    The line separator to use. By default, any of `"\n"`, `"\r\n"`
    and `"\r"` is treated as a separator when splitting lines, and
    lines are joined with `"\n"`.
    
    When you configure a value here, only that precise separator
    will be used, allowing you to round-trip documents through the
    editor without normalizing line separators.
    */
    static lineSeparator: Facet$1<string, string | undefined>;
    /**
    Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
    string for this state.
    */
    get lineBreak(): string;
    /**
    This facet controls the value of the
    [`readOnly`](https://codemirror.net/6/docs/ref/#state.EditorState.readOnly) getter, which is
    consulted by commands and extensions that implement editing
    functionality to determine whether they should apply. It
    defaults to false, but when its highest-precedence value is
    `true`, such functionality disables itself.
    
    Not to be confused with
    [`EditorView.editable`](https://codemirror.net/6/docs/ref/#view.EditorView^editable), which
    controls whether the editor's DOM is set to be editable (and
    thus focusable).
    */
    static readOnly: Facet$1<boolean, boolean>;
    /**
    Returns true when the editor is
    [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
    */
    get readOnly(): boolean;
    /**
    Registers translation phrases. The
    [`phrase`](https://codemirror.net/6/docs/ref/#state.EditorState.phrase) method will look through
    all objects registered with this facet to find translations for
    its argument.
    */
    static phrases: Facet$1<{
        [key: string]: string;
    }, readonly {
        [key: string]: string;
    }[]>;
    /**
    Look up a translation for the given phrase (via the
    [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
    original string if no translation is found.
    
    If additional arguments are passed, they will be inserted in
    place of markers like `$1` (for the first value) and `$2`, etc.
    A single `$` is equivalent to `$1`, and `$$` will produce a
    literal dollar sign.
    */
    phrase(phrase: string, ...insert: any[]): string;
    /**
    A facet used to register [language
    data](https://codemirror.net/6/docs/ref/#state.EditorState.languageDataAt) providers.
    */
    static languageData: Facet$1<(state: EditorState$1, pos: number, side: 0 | 1 | -1) => readonly {
        [name: string]: any;
    }[], readonly ((state: EditorState$1, pos: number, side: 0 | 1 | -1) => readonly {
        [name: string]: any;
    }[])[]>;
    /**
    Find the values for a given language data field, provided by the
    the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
    
    Examples of language data fields are...
    
    - [`"commentTokens"`](https://codemirror.net/6/docs/ref/#commands.CommentTokens) for specifying
      comment syntax.
    - [`"autocomplete"`](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion^config.override)
      for providing language-specific completion sources.
    - [`"wordChars"`](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) for adding
      characters that should be considered part of words in this
      language.
    - [`"closeBrackets"`](https://codemirror.net/6/docs/ref/#autocomplete.CloseBracketConfig) controls
      bracket closing behavior.
    */
    languageDataAt<T>(name: string, pos: number, side?: -1 | 0 | 1): readonly T[];
    /**
    Return a function that can categorize strings (expected to
    represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak))
    into one of:
    
     - Word (contains an alphanumeric character or a character
       explicitly listed in the local language's `"wordChars"`
       language data, which should be a string)
     - Space (contains only whitespace)
     - Other (anything else)
    */
    charCategorizer(at: number): (char: string) => CharCategory$1;
    /**
    Find the word at the given position, meaning the range
    containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
    around it. If no word characters are adjacent to the position,
    this returns null.
    */
    wordAt(pos: number): SelectionRange$1 | null;
    /**
    Facet used to register change filters, which are called for each
    transaction (unless explicitly
    [disabled](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter)), and can suppress
    part of the transaction's changes.
    
    Such a function can return `true` to indicate that it doesn't
    want to do anything, `false` to completely stop the changes in
    the transaction, or a set of ranges in which changes should be
    suppressed. Such ranges are represented as an array of numbers,
    with each pair of two numbers indicating the start and end of a
    range. So for example `[10, 20, 100, 110]` suppresses changes
    between 10 and 20, and between 100 and 110.
    */
    static changeFilter: Facet$1<(tr: Transaction$1) => boolean | readonly number[], readonly ((tr: Transaction$1) => boolean | readonly number[])[]>;
    /**
    Facet used to register a hook that gets a chance to update or
    replace transaction specs before they are applied. This will
    only be applied for transactions that don't have
    [`filter`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter) set to `false`. You
    can either return a single transaction spec (possibly the input
    transaction), or an array of specs (which will be combined in
    the same way as the arguments to
    [`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update)).
    
    When possible, it is recommended to avoid accessing
    [`Transaction.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state) in a filter,
    since it will force creation of a state that will then be
    discarded again, if the transaction is actually filtered.
    
    (This functionality should be used with care. Indiscriminately
    modifying transaction is likely to break something or degrade
    the user experience.)
    */
    static transactionFilter: Facet$1<(tr: Transaction$1) => TransactionSpec$1 | readonly TransactionSpec$1[], readonly ((tr: Transaction$1) => TransactionSpec$1 | readonly TransactionSpec$1[])[]>;
    /**
    This is a more limited form of
    [`transactionFilter`](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter),
    which can only add
    [annotations](https://codemirror.net/6/docs/ref/#state.TransactionSpec.annotations) and
    [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects). _But_, this type
    of filter runs even if the transaction has disabled regular
    [filtering](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter), making it suitable
    for effects that don't need to touch the changes or selection,
    but do want to process every transaction.
    
    Extenders run _after_ filters, when both are present.
    */
    static transactionExtender: Facet$1<(tr: Transaction$1) => Pick<TransactionSpec$1, "effects" | "annotations"> | null, readonly ((tr: Transaction$1) => Pick<TransactionSpec$1, "effects" | "annotations"> | null)[]>;
}

/**
Each range is associated with a value, which must inherit from
this class.
*/
declare abstract class RangeValue {
    /**
    Compare this value with another value. Used when comparing
    rangesets. The default implementation compares by identity.
    Unless you are only creating a fixed number of unique instances
    of your value type, it is a good idea to implement this
    properly.
    */
    eq(other: RangeValue): boolean;
    /**
    The bias value at the start of the range. Determines how the
    range is positioned relative to other ranges starting at this
    position. Defaults to 0.
    */
    startSide: number;
    /**
    The bias value at the end of the range. Defaults to 0.
    */
    endSide: number;
    /**
    The mode with which the location of the range should be mapped
    when its `from` and `to` are the same, to decide whether a
    change deletes the range. Defaults to `MapMode.TrackDel`.
    */
    mapMode: MapMode$1;
    /**
    Determines whether this value marks a point range. Regular
    ranges affect the part of the document they cover, and are
    meaningless when empty. Point ranges have a meaning on their
    own. When non-empty, a point range is treated as atomic and
    shadows any ranges contained in it.
    */
    point: boolean;
    /**
    Create a [range](https://codemirror.net/6/docs/ref/#state.Range) with this value.
    */
    range(from: number, to?: number): Range<this>;
}
/**
A range associates a value with a range of positions.
*/
declare class Range<T extends RangeValue> {
    /**
    The range's start position.
    */
    readonly from: number;
    /**
    Its end position.
    */
    readonly to: number;
    /**
    The value associated with this range.
    */
    readonly value: T;
    private constructor();
}
/**
Collection of methods used when comparing range sets.
*/
interface RangeComparator<T extends RangeValue> {
    /**
    Notifies the comparator that a range (in positions in the new
    document) has the given sets of values associated with it, which
    are different in the old (A) and new (B) sets.
    */
    compareRange(from: number, to: number, activeA: T[], activeB: T[]): void;
    /**
    Notification for a changed (or inserted, or deleted) point range.
    */
    comparePoint(from: number, to: number, pointA: T | null, pointB: T | null): void;
}
/**
Methods used when iterating over the spans created by a set of
ranges. The entire iterated range will be covered with either
`span` or `point` calls.
*/
interface SpanIterator<T extends RangeValue> {
    /**
    Called for any ranges not covered by point decorations. `active`
    holds the values that the range is marked with (and may be
    empty). `openStart` indicates how many of those ranges are open
    (continued) at the start of the span.
    */
    span(from: number, to: number, active: readonly T[], openStart: number): void;
    /**
    Called when going over a point decoration. The active range
    decorations that cover the point and have a higher precedence
    are provided in `active`. The open count in `openStart` counts
    the number of those ranges that started before the point and. If
    the point started before the iterated range, `openStart` will be
    `active.length + 1` to signal this.
    */
    point(from: number, to: number, value: T, active: readonly T[], openStart: number, index: number): void;
}
/**
A range cursor is an object that moves to the next range every
time you call `next` on it. Note that, unlike ES6 iterators, these
start out pointing at the first element, so you should call `next`
only after reading the first range (if any).
*/
interface RangeCursor<T> {
    /**
    Move the iterator forward.
    */
    next: () => void;
    /**
    The next range's value. Holds `null` when the cursor has reached
    its end.
    */
    value: T | null;
    /**
    The next range's start position.
    */
    from: number;
    /**
    The next end position.
    */
    to: number;
}
declare type RangeSetUpdate<T extends RangeValue> = {
    /**
    An array of ranges to add. If given, this should be sorted by
    `from` position and `startSide` unless
    [`sort`](https://codemirror.net/6/docs/ref/#state.RangeSet.update^updateSpec.sort) is given as
    `true`.
    */
    add?: readonly Range<T>[];
    /**
    Indicates whether the library should sort the ranges in `add`.
    Defaults to `false`.
    */
    sort?: boolean;
    /**
    Filter the ranges already in the set. Only those for which this
    function returns `true` are kept.
    */
    filter?: (from: number, to: number, value: T) => boolean;
    /**
    Can be used to limit the range on which the filter is
    applied. Filtering only a small range, as opposed to the entire
    set, can make updates cheaper.
    */
    filterFrom?: number;
    /**
    The end position to apply the filter to.
    */
    filterTo?: number;
};
/**
A range set stores a collection of [ranges](https://codemirror.net/6/docs/ref/#state.Range) in a
way that makes them efficient to [map](https://codemirror.net/6/docs/ref/#state.RangeSet.map) and
[update](https://codemirror.net/6/docs/ref/#state.RangeSet.update). This is an immutable data
structure.
*/
declare class RangeSet<T extends RangeValue> {
    private constructor();
    /**
    The number of ranges in the set.
    */
    get size(): number;
    /**
    Update the range set, optionally adding new ranges or filtering
    out existing ones.
    
    (Note: The type parameter is just there as a kludge to work
    around TypeScript variance issues that prevented `RangeSet<X>`
    from being a subtype of `RangeSet<Y>` when `X` is a subtype of
    `Y`.)
    */
    update<U extends T>(updateSpec: RangeSetUpdate<U>): RangeSet<T>;
    /**
    Map this range set through a set of changes, return the new set.
    */
    map(changes: ChangeDesc$1): RangeSet<T>;
    /**
    Iterate over the ranges that touch the region `from` to `to`,
    calling `f` for each. There is no guarantee that the ranges will
    be reported in any specific order. When the callback returns
    `false`, iteration stops.
    */
    between(from: number, to: number, f: (from: number, to: number, value: T) => void | false): void;
    /**
    Iterate over the ranges in this set, in order, including all
    ranges that end at or after `from`.
    */
    iter(from?: number): RangeCursor<T>;
    /**
    Iterate over the ranges in a collection of sets, in order,
    starting from `from`.
    */
    static iter<T extends RangeValue>(sets: readonly RangeSet<T>[], from?: number): RangeCursor<T>;
    /**
    Iterate over two groups of sets, calling methods on `comparator`
    to notify it of possible differences.
    */
    static compare<T extends RangeValue>(oldSets: readonly RangeSet<T>[], newSets: readonly RangeSet<T>[], 
    /**
    This indicates how the underlying data changed between these
    ranges, and is needed to synchronize the iteration. `from` and
    `to` are coordinates in the _new_ space, after these changes.
    */
    textDiff: ChangeDesc$1, comparator: RangeComparator<T>, 
    /**
    Can be used to ignore all non-point ranges, and points below
    the given size. When -1, all ranges are compared.
    */
    minPointSize?: number): void;
    /**
    Compare the contents of two groups of range sets, returning true
    if they are equivalent in the given range.
    */
    static eq<T extends RangeValue>(oldSets: readonly RangeSet<T>[], newSets: readonly RangeSet<T>[], from?: number, to?: number): boolean;
    /**
    Iterate over a group of range sets at the same time, notifying
    the iterator about the ranges covering every given piece of
    content. Returns the open count (see
    [`SpanIterator.span`](https://codemirror.net/6/docs/ref/#state.SpanIterator.span)) at the end
    of the iteration.
    */
    static spans<T extends RangeValue>(sets: readonly RangeSet<T>[], from: number, to: number, iterator: SpanIterator<T>, 
    /**
    When given and greater than -1, only points of at least this
    size are taken into account.
    */
    minPointSize?: number): number;
    /**
    Create a range set for the given range or array of ranges. By
    default, this expects the ranges to be _sorted_ (by start
    position and, if two start at the same position,
    `value.startSide`). You can pass `true` as second argument to
    cause the method to sort them.
    */
    static of<T extends RangeValue>(ranges: readonly Range<T>[] | Range<T>, sort?: boolean): RangeSet<T>;
    /**
    The empty set of ranges.
    */
    static empty: RangeSet<any>;
}

declare type Attrs = {
    [name: string]: string;
};

interface MarkDecorationSpec {
    /**
    Whether the mark covers its start and end position or not. This
    influences whether content inserted at those positions becomes
    part of the mark. Defaults to false.
    */
    inclusive?: boolean;
    /**
    Specify whether the start position of the marked range should be
    inclusive. Overrides `inclusive`, when both are present.
    */
    inclusiveStart?: boolean;
    /**
    Whether the end should be inclusive.
    */
    inclusiveEnd?: boolean;
    /**
    Add attributes to the DOM elements that hold the text in the
    marked range.
    */
    attributes?: {
        [key: string]: string;
    };
    /**
    Shorthand for `{attributes: {class: value}}`.
    */
    class?: string;
    /**
    Add a wrapping element around the text in the marked range. Note
    that there will not necessarily be a single element covering the
    entire range—other decorations with lower precedence might split
    this one if they partially overlap it, and line breaks always
    end decoration elements.
    */
    tagName?: string;
    /**
    Decoration specs allow extra properties, which can be retrieved
    through the decoration's [`spec`](https://codemirror.net/6/docs/ref/#view.Decoration.spec)
    property.
    */
    [other: string]: any;
}
interface WidgetDecorationSpec {
    /**
    The type of widget to draw here.
    */
    widget: WidgetType;
    /**
    Which side of the given position the widget is on. When this is
    positive, the widget will be drawn after the cursor if the
    cursor is on the same position. Otherwise, it'll be drawn before
    it. When multiple widgets sit at the same position, their `side`
    values will determine their ordering—those with a lower value
    come first. Defaults to 0.
    */
    side?: number;
    /**
    Determines whether this is a block widgets, which will be drawn
    between lines, or an inline widget (the default) which is drawn
    between the surrounding text.
    
    Note that block-level decorations should not have vertical
    margins, and if you dynamically change their height, you should
    make sure to call
    [`requestMeasure`](https://codemirror.net/6/docs/ref/#view.EditorView.requestMeasure), so that the
    editor can update its information about its vertical layout.
    */
    block?: boolean;
    /**
    Other properties are allowed.
    */
    [other: string]: any;
}
interface ReplaceDecorationSpec {
    /**
    An optional widget to drawn in the place of the replaced
    content.
    */
    widget?: WidgetType;
    /**
    Whether this range covers the positions on its sides. This
    influences whether new content becomes part of the range and
    whether the cursor can be drawn on its sides. Defaults to false
    for inline replacements, and true for block replacements.
    */
    inclusive?: boolean;
    /**
    Set inclusivity at the start.
    */
    inclusiveStart?: boolean;
    /**
    Set inclusivity at the end.
    */
    inclusiveEnd?: boolean;
    /**
    Whether this is a block-level decoration. Defaults to false.
    */
    block?: boolean;
    /**
    Other properties are allowed.
    */
    [other: string]: any;
}
interface LineDecorationSpec {
    /**
    DOM attributes to add to the element wrapping the line.
    */
    attributes?: {
        [key: string]: string;
    };
    /**
    Shorthand for `{attributes: {class: value}}`.
    */
    class?: string;
    /**
    Other properties are allowed.
    */
    [other: string]: any;
}
/**
Widgets added to the content are described by subclasses of this
class. Using a description object like that makes it possible to
delay creating of the DOM structure for a widget until it is
needed, and to avoid redrawing widgets even if the decorations
that define them are recreated.
*/
declare abstract class WidgetType {
    /**
    Build the DOM structure for this widget instance.
    */
    abstract toDOM(view: EditorView): HTMLElement;
    /**
    Compare this instance to another instance of the same type.
    (TypeScript can't express this, but only instances of the same
    specific class will be passed to this method.) This is used to
    avoid redrawing widgets when they are replaced by a new
    decoration of the same type. The default implementation just
    returns `false`, which will cause new instances of the widget to
    always be redrawn.
    */
    eq(widget: WidgetType): boolean;
    /**
    Update a DOM element created by a widget of the same type (but
    different, non-`eq` content) to reflect this widget. May return
    true to indicate that it could update, false to indicate it
    couldn't (in which case the widget will be redrawn). The default
    implementation just returns false.
    */
    updateDOM(dom: HTMLElement): boolean;
    /**
    The estimated height this widget will have, to be used when
    estimating the height of content that hasn't been drawn. May
    return -1 to indicate you don't know. The default implementation
    returns -1.
    */
    get estimatedHeight(): number;
    /**
    Can be used to configure which kinds of events inside the widget
    should be ignored by the editor. The default is to ignore all
    events.
    */
    ignoreEvent(event: Event): boolean;
    /**
    This is called when the an instance of the widget is removed
    from the editor view.
    */
    destroy(dom: HTMLElement): void;
}
/**
A decoration set represents a collection of decorated ranges,
organized for efficient access and mapping. See
[`RangeSet`](https://codemirror.net/6/docs/ref/#state.RangeSet) for its methods.
*/
declare type DecorationSet = RangeSet<Decoration>;
/**
The different types of blocks that can occur in an editor view.
*/
declare enum BlockType {
    /**
    A line of text.
    */
    Text = 0,
    /**
    A block widget associated with the position after it.
    */
    WidgetBefore = 1,
    /**
    A block widget associated with the position before it.
    */
    WidgetAfter = 2,
    /**
    A block widget [replacing](https://codemirror.net/6/docs/ref/#view.Decoration^replace) a range of content.
    */
    WidgetRange = 3
}
/**
A decoration provides information on how to draw or style a piece
of content. You'll usually use it wrapped in a
[`Range`](https://codemirror.net/6/docs/ref/#state.Range), which adds a start and end position.
@nonabstract
*/
declare abstract class Decoration extends RangeValue {
    /**
    The config object used to create this decoration. You can
    include additional properties in there to store metadata about
    your decoration.
    */
    readonly spec: any;
    protected constructor(
    /**
    @internal
    */
    startSide: number, 
    /**
    @internal
    */
    endSide: number, 
    /**
    @internal
    */
    widget: WidgetType | null, 
    /**
    The config object used to create this decoration. You can
    include additional properties in there to store metadata about
    your decoration.
    */
    spec: any);
    abstract eq(other: Decoration): boolean;
    /**
    Create a mark decoration, which influences the styling of the
    content in its range. Nested mark decorations will cause nested
    DOM elements to be created. Nesting order is determined by
    precedence of the [facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations), with
    the higher-precedence decorations creating the inner DOM nodes.
    Such elements are split on line boundaries and on the boundaries
    of lower-precedence decorations.
    */
    static mark(spec: MarkDecorationSpec): Decoration;
    /**
    Create a widget decoration, which displays a DOM element at the
    given position.
    */
    static widget(spec: WidgetDecorationSpec): Decoration;
    /**
    Create a replace decoration which replaces the given range with
    a widget, or simply hides it.
    */
    static replace(spec: ReplaceDecorationSpec): Decoration;
    /**
    Create a line decoration, which can add DOM attributes to the
    line starting at the given position.
    */
    static line(spec: LineDecorationSpec): Decoration;
    /**
    Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
    decorated range or ranges. If the ranges aren't already sorted,
    pass `true` for `sort` to make the library sort them for you.
    */
    static set(of: Range<Decoration> | readonly Range<Decoration>[], sort?: boolean): DecorationSet;
    /**
    The empty set of decorations.
    */
    static none: DecorationSet;
}

/**
Basic rectangle type.
*/
interface Rect {
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;
}
declare type ScrollStrategy = "nearest" | "start" | "end" | "center";
/**
This is the interface plugin objects conform to.
*/
interface PluginValue extends Object {
    /**
    Notifies the plugin of an update that happened in the view. This
    is called _before_ the view updates its own DOM. It is
    responsible for updating the plugin's internal state (including
    any state that may be read by plugin fields) and _writing_ to
    the DOM for the changes in the update. To avoid unnecessary
    layout recomputations, it should _not_ read the DOM layout—use
    [`requestMeasure`](https://codemirror.net/6/docs/ref/#view.EditorView.requestMeasure) to schedule
    your code in a DOM reading phase if you need to.
    */
    update?(update: ViewUpdate): void;
    /**
    Called when the plugin is no longer going to be used. Should
    revert any changes the plugin made to the DOM.
    */
    destroy?(): void;
}
/**
Provides additional information when defining a [view
plugin](https://codemirror.net/6/docs/ref/#view.ViewPlugin).
*/
interface PluginSpec<V extends PluginValue> {
    /**
    Register the given [event
    handlers](https://codemirror.net/6/docs/ref/#view.EditorView^domEventHandlers) for the plugin.
    When called, these will have their `this` bound to the plugin
    value.
    */
    eventHandlers?: DOMEventHandlers<V>;
    /**
    Specify that the plugin provides additional extensions when
    added to an editor configuration.
    */
    provide?: (plugin: ViewPlugin<V>) => Extension$1;
    /**
    Allow the plugin to provide decorations. When given, this should
    be a function that take the plugin value and return a
    [decoration set](https://codemirror.net/6/docs/ref/#view.DecorationSet). See also the caveat about
    [layout-changing decorations](https://codemirror.net/6/docs/ref/#view.EditorView^decorations) that
    depend on the view.
    */
    decorations?: (value: V) => DecorationSet;
}
/**
View plugins associate stateful values with a view. They can
influence the way the content is drawn, and are notified of things
that happen in the view.
*/
declare class ViewPlugin<V extends PluginValue> {
    /**
    Instances of this class act as extensions.
    */
    extension: Extension$1;
    private constructor();
    /**
    Define a plugin from a constructor function that creates the
    plugin's value, given an editor view.
    */
    static define<V extends PluginValue>(create: (view: EditorView) => V, spec?: PluginSpec<V>): ViewPlugin<V>;
    /**
    Create a plugin for a class whose constructor takes a single
    editor view as argument.
    */
    static fromClass<V extends PluginValue>(cls: {
        new (view: EditorView): V;
    }, spec?: PluginSpec<V>): ViewPlugin<V>;
}
interface MeasureRequest<T> {
    /**
    Called in a DOM read phase to gather information that requires
    DOM layout. Should _not_ mutate the document.
    */
    read(view: EditorView): T;
    /**
    Called in a DOM write phase to update the document. Should _not_
    do anything that triggers DOM layout.
    */
    write?(measure: T, view: EditorView): void;
    /**
    When multiple requests with the same key are scheduled, only the
    last one will actually be ran.
    */
    key?: any;
}
declare type AttrSource = Attrs | ((view: EditorView) => Attrs | null);
/**
View [plugins](https://codemirror.net/6/docs/ref/#view.ViewPlugin) are given instances of this
class, which describe what happened, whenever the view is updated.
*/
declare class ViewUpdate {
    /**
    The editor view that the update is associated with.
    */
    readonly view: EditorView;
    /**
    The new editor state.
    */
    readonly state: EditorState$1;
    /**
    The transactions involved in the update. May be empty.
    */
    readonly transactions: readonly Transaction$1[];
    /**
    The changes made to the document by this update.
    */
    readonly changes: ChangeSet$1;
    /**
    The previous editor state.
    */
    readonly startState: EditorState$1;
    private constructor();
    /**
    Tells you whether the [viewport](https://codemirror.net/6/docs/ref/#view.EditorView.viewport) or
    [visible ranges](https://codemirror.net/6/docs/ref/#view.EditorView.visibleRanges) changed in this
    update.
    */
    get viewportChanged(): boolean;
    /**
    Indicates whether the height of a block element in the editor
    changed in this update.
    */
    get heightChanged(): boolean;
    /**
    Returns true when the document was modified or the size of the
    editor, or elements within the editor, changed.
    */
    get geometryChanged(): boolean;
    /**
    True when this update indicates a focus change.
    */
    get focusChanged(): boolean;
    /**
    Whether the document changed in this update.
    */
    get docChanged(): boolean;
    /**
    Whether the selection was explicitly set in this update.
    */
    get selectionSet(): boolean;
}

/**
Interface that objects registered with
[`EditorView.mouseSelectionStyle`](https://codemirror.net/6/docs/ref/#view.EditorView^mouseSelectionStyle)
must conform to.
*/
interface MouseSelectionStyle {
    /**
    Return a new selection for the mouse gesture that starts with
    the event that was originally given to the constructor, and ends
    with the event passed here. In case of a plain click, those may
    both be the `mousedown` event, in case of a drag gesture, the
    latest `mousemove` event will be passed.
    
    When `extend` is true, that means the new selection should, if
    possible, extend the start selection. If `multiple` is true, the
    new selection should be added to the original selection.
    */
    get: (curEvent: MouseEvent, extend: boolean, multiple: boolean) => EditorSelection$1;
    /**
    Called when the view is updated while the gesture is in
    progress. When the document changes, it may be necessary to map
    some data (like the original selection or start position)
    through the changes.
    
    This may return `true` to indicate that the `get` method should
    get queried again after the update, because something in the
    update could change its result. Be wary of infinite loops when
    using this (where `get` returns a new selection, which will
    trigger `update`, which schedules another `get` in response).
    */
    update: (update: ViewUpdate) => boolean | void;
}
declare type MakeSelectionStyle = (view: EditorView, event: MouseEvent) => MouseSelectionStyle | null;

/**
Record used to represent information about a block-level element
in the editor view.
*/
declare class BlockInfo {
    /**
    The start of the element in the document.
    */
    readonly from: number;
    /**
    The length of the element.
    */
    readonly length: number;
    /**
    The top position of the element (relative to the top of the
    document).
    */
    readonly top: number;
    /**
    Its height.
    */
    readonly height: number;
    /**
    The type of element this is. When querying lines, this may be
    an array of all the blocks that make up the line.
    */
    readonly type: BlockType | readonly BlockInfo[];
    /**
    The end of the element as a document position.
    */
    get to(): number;
    /**
    The bottom position of the element.
    */
    get bottom(): number;
}

/**
Used to indicate [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
*/
declare enum Direction {
    /**
    Left-to-right.
    */
    LTR = 0,
    /**
    Right-to-left.
    */
    RTL = 1
}
/**
Represents a contiguous range of text that has a single direction
(as in left-to-right or right-to-left).
*/
declare class BidiSpan {
    /**
    The start of the span (relative to the start of the line).
    */
    readonly from: number;
    /**
    The end of the span.
    */
    readonly to: number;
    /**
    The ["bidi
    level"](https://unicode.org/reports/tr9/#Basic_Display_Algorithm)
    of the span (in this context, 0 means
    left-to-right, 1 means right-to-left, 2 means left-to-right
    number inside right-to-left text).
    */
    readonly level: number;
    /**
    The direction of this span.
    */
    get dir(): Direction;
}

/**
The type of object given to the [`EditorView`](https://codemirror.net/6/docs/ref/#view.EditorView)
constructor.
*/
interface EditorViewConfig extends EditorStateConfig$1 {
    /**
    The view's initial state. If not given, a new state is created
    by passing this configuration object to
    [`EditorState.create`](https://codemirror.net/6/docs/ref/#state.EditorState^create), using its
    `doc`, `selection`, and `extensions` field (if provided).
    */
    state?: EditorState$1;
    /**
    When given, the editor is immediately appended to the given
    element on creation. (Otherwise, you'll have to place the view's
    [`dom`](https://codemirror.net/6/docs/ref/#view.EditorView.dom) element in the document yourself.)
    */
    parent?: Element | DocumentFragment;
    /**
    If the view is going to be mounted in a shadow root or document
    other than the one held by the global variable `document` (the
    default), you should pass it here. If you provide `parent`, but
    not this option, the editor will automatically look up a root
    from the parent.
    */
    root?: Document | ShadowRoot;
    /**
    Override the transaction [dispatch
    function](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) for this editor view, which
    is the way updates get routed to the view. Your implementation,
    if provided, should probably call the view's [`update`
    method](https://codemirror.net/6/docs/ref/#view.EditorView.update).
    */
    dispatch?: (tr: Transaction$1) => void;
}
/**
An editor view represents the editor's user interface. It holds
the editable DOM surface, and possibly other elements such as the
line number gutter. It handles events and dispatches state
transactions for editing actions.
*/
declare class EditorView {
    /**
    The current editor state.
    */
    get state(): EditorState$1;
    /**
    To be able to display large documents without consuming too much
    memory or overloading the browser, CodeMirror only draws the
    code that is visible (plus a margin around it) to the DOM. This
    property tells you the extent of the current drawn viewport, in
    document positions.
    */
    get viewport(): {
        from: number;
        to: number;
    };
    /**
    When there are, for example, large collapsed ranges in the
    viewport, its size can be a lot bigger than the actual visible
    content. Thus, if you are doing something like styling the
    content in the viewport, it is preferable to only do so for
    these ranges, which are the subset of the viewport that is
    actually drawn.
    */
    get visibleRanges(): readonly {
        from: number;
        to: number;
    }[];
    /**
    Returns false when the editor is entirely scrolled out of view
    or otherwise hidden.
    */
    get inView(): boolean;
    /**
    Indicates whether the user is currently composing text via
    [IME](https://en.wikipedia.org/wiki/Input_method), and at least
    one change has been made in the current composition.
    */
    get composing(): boolean;
    /**
    Indicates whether the user is currently in composing state. Note
    that on some platforms, like Android, this will be the case a
    lot, since just putting the cursor on a word starts a
    composition there.
    */
    get compositionStarted(): boolean;
    private _dispatch;
    private _root;
    /**
    The document or shadow root that the view lives in.
    */
    get root(): DocumentOrShadowRoot;
    /**
    The DOM element that wraps the entire editor view.
    */
    readonly dom: HTMLElement;
    /**
    The DOM element that can be styled to scroll. (Note that it may
    not have been, so you can't assume this is scrollable.)
    */
    readonly scrollDOM: HTMLElement;
    /**
    The editable DOM element holding the editor content. You should
    not, usually, interact with this content directly though the
    DOM, since the editor will immediately undo most of the changes
    you make. Instead, [dispatch](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch)
    [transactions](https://codemirror.net/6/docs/ref/#state.Transaction) to modify content, and
    [decorations](https://codemirror.net/6/docs/ref/#view.Decoration) to style it.
    */
    readonly contentDOM: HTMLElement;
    private announceDOM;
    private plugins;
    private pluginMap;
    private editorAttrs;
    private contentAttrs;
    private styleModules;
    private bidiCache;
    private destroyed;
    /**
    Construct a new view. You'll want to either provide a `parent`
    option, or put `view.dom` into your document after creating a
    view, so that the user can see the editor.
    */
    constructor(config?: EditorViewConfig);
    /**
    All regular editor state updates should go through this. It
    takes a transaction or transaction spec and updates the view to
    show the new state produced by that transaction. Its
    implementation can be overridden with an
    [option](https://codemirror.net/6/docs/ref/#view.EditorView.constructor^config.dispatch). This
    function is bound to the view instance, so it does not have to
    be called as a method.
    */
    dispatch(tr: Transaction$1): void;
    dispatch(...specs: TransactionSpec$1[]): void;
    /**
    Update the view for the given array of transactions. This will
    update the visible document and selection to match the state
    produced by the transactions, and notify view plugins of the
    change. You should usually call
    [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead, which uses this
    as a primitive.
    */
    update(transactions: readonly Transaction$1[]): void;
    /**
    Reset the view to the given state. (This will cause the entire
    document to be redrawn and all view plugins to be reinitialized,
    so you should probably only use it when the new state isn't
    derived from the old state. Otherwise, use
    [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead.)
    */
    setState(newState: EditorState$1): void;
    private updatePlugins;
    /**
    Get the CSS classes for the currently active editor themes.
    */
    get themeClasses(): string;
    private updateAttrs;
    private showAnnouncements;
    private mountStyles;
    private readMeasured;
    /**
    Schedule a layout measurement, optionally providing callbacks to
    do custom DOM measuring followed by a DOM write phase. Using
    this is preferable reading DOM layout directly from, for
    example, an event handler, because it'll make sure measuring and
    drawing done by other components is synchronized, avoiding
    unnecessary DOM layout computations.
    */
    requestMeasure<T>(request?: MeasureRequest<T>): void;
    /**
    Get the value of a specific plugin, if present. Note that
    plugins that crash can be dropped from a view, so even when you
    know you registered a given plugin, it is recommended to check
    the return value of this method.
    */
    plugin<T extends PluginValue>(plugin: ViewPlugin<T>): T | null;
    /**
    The top position of the document, in screen coordinates. This
    may be negative when the editor is scrolled down. Points
    directly to the top of the first line, not above the padding.
    */
    get documentTop(): number;
    /**
    Reports the padding above and below the document.
    */
    get documentPadding(): {
        top: number;
        bottom: number;
    };
    /**
    Find the text line or block widget at the given vertical
    position (which is interpreted as relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop)).
    */
    elementAtHeight(height: number): BlockInfo;
    /**
    Find the line block (see
    [`lineBlockAt`](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) at the given
    height, again interpreted relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop).
    */
    lineBlockAtHeight(height: number): BlockInfo;
    /**
    Get the extent and vertical position of all [line
    blocks](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) in the viewport. Positions
    are relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop);
    */
    get viewportLineBlocks(): BlockInfo[];
    /**
    Find the line block around the given document position. A line
    block is a range delimited on both sides by either a
    non-[hidden](https://codemirror.net/6/docs/ref/#view.Decoration^replace) line breaks, or the
    start/end of the document. It will usually just hold a line of
    text, but may be broken into multiple textblocks by block
    widgets.
    */
    lineBlockAt(pos: number): BlockInfo;
    /**
    The editor's total content height.
    */
    get contentHeight(): number;
    /**
    Move a cursor position by [grapheme
    cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak). `forward` determines whether
    the motion is away from the line start, or towards it. In
    bidirectional text, the line is traversed in visual order, using
    the editor's [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
    When the start position was the last one on the line, the
    returned position will be across the line break. If there is no
    further line, the original position is returned.
    
    By default, this method moves over a single cluster. The
    optional `by` argument can be used to move across more. It will
    be called with the first cluster as argument, and should return
    a predicate that determines, for each subsequent cluster,
    whether it should also be moved over.
    */
    moveByChar(start: SelectionRange$1, forward: boolean, by?: (initial: string) => (next: string) => boolean): SelectionRange$1;
    /**
    Move a cursor position across the next group of either
    [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
    non-whitespace characters.
    */
    moveByGroup(start: SelectionRange$1, forward: boolean): SelectionRange$1;
    /**
    Move to the next line boundary in the given direction. If
    `includeWrap` is true, line wrapping is on, and there is a
    further wrap point on the current line, the wrap point will be
    returned. Otherwise this function will return the start or end
    of the line.
    */
    moveToLineBoundary(start: SelectionRange$1, forward: boolean, includeWrap?: boolean): SelectionRange$1;
    /**
    Move a cursor position vertically. When `distance` isn't given,
    it defaults to moving to the next line (including wrapped
    lines). Otherwise, `distance` should provide a positive distance
    in pixels.
    
    When `start` has a
    [`goalColumn`](https://codemirror.net/6/docs/ref/#state.SelectionRange.goalColumn), the vertical
    motion will use that as a target horizontal position. Otherwise,
    the cursor's own horizontal position is used. The returned
    cursor will have its goal column set to whichever column was
    used.
    */
    moveVertically(start: SelectionRange$1, forward: boolean, distance?: number): SelectionRange$1;
    /**
    Find the DOM parent node and offset (child offset if `node` is
    an element, character offset when it is a text node) at the
    given document position.
    
    Note that for positions that aren't currently in
    `visibleRanges`, the resulting DOM position isn't necessarily
    meaningful (it may just point before or after a placeholder
    element).
    */
    domAtPos(pos: number): {
        node: Node;
        offset: number;
    };
    /**
    Find the document position at the given DOM node. Can be useful
    for associating positions with DOM events. Will raise an error
    when `node` isn't part of the editor content.
    */
    posAtDOM(node: Node, offset?: number): number;
    /**
    Get the document position at the given screen coordinates. For
    positions not covered by the visible viewport's DOM structure,
    this will return null, unless `false` is passed as second
    argument, in which case it'll return an estimated position that
    would be near the coordinates if it were rendered.
    */
    posAtCoords(coords: {
        x: number;
        y: number;
    }, precise: false): number;
    posAtCoords(coords: {
        x: number;
        y: number;
    }): number | null;
    /**
    Get the screen coordinates at the given document position.
    `side` determines whether the coordinates are based on the
    element before (-1) or after (1) the position (if no element is
    available on the given side, the method will transparently use
    another strategy to get reasonable coordinates).
    */
    coordsAtPos(pos: number, side?: -1 | 1): Rect | null;
    /**
    The default width of a character in the editor. May not
    accurately reflect the width of all characters (given variable
    width fonts or styling of invididual ranges).
    */
    get defaultCharacterWidth(): number;
    /**
    The default height of a line in the editor. May not be accurate
    for all lines.
    */
    get defaultLineHeight(): number;
    /**
    The text direction
    ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
    CSS property) of the editor's content element.
    */
    get textDirection(): Direction;
    /**
    Find the text direction of the block at the given position, as
    assigned by CSS. If
    [`perLineTextDirection`](https://codemirror.net/6/docs/ref/#view.EditorView^perLineTextDirection)
    isn't enabled, or the given position is outside of the viewport,
    this will always return the same as
    [`textDirection`](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection). Note that
    this may trigger a DOM layout.
    */
    textDirectionAt(pos: number): Direction;
    /**
    Whether this editor [wraps lines](https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping)
    (as determined by the
    [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
    CSS property of its content element).
    */
    get lineWrapping(): boolean;
    /**
    Returns the bidirectional text structure of the given line
    (which should be in the current document) as an array of span
    objects. The order of these spans matches the [text
    direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection)—if that is
    left-to-right, the leftmost spans come first, otherwise the
    rightmost spans come first.
    */
    bidiSpans(line: Line$1): readonly BidiSpan[];
    /**
    Check whether the editor has focus.
    */
    get hasFocus(): boolean;
    /**
    Put focus on the editor.
    */
    focus(): void;
    /**
    Update the [root](https://codemirror.net/6/docs/ref/##view.EditorViewConfig.root) in which the editor lives. This is only
    necessary when moving the editor's existing DOM to a new window or shadow root.
    */
    setRoot(root: Document | ShadowRoot): void;
    /**
    Clean up this editor view, removing its element from the
    document, unregistering event handlers, and notifying
    plugins. The view instance can no longer be used after
    calling this.
    */
    destroy(): void;
    /**
    Returns an effect that can be
    [added](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) to a transaction to
    cause it to scroll the given position or range into view.
    */
    static scrollIntoView(pos: number | SelectionRange$1, options?: {
        /**
        By default (`"nearest"`) the position will be vertically
        scrolled only the minimal amount required to move the given
        position into view. You can set this to `"start"` to move it
        to the top of the view, `"end"` to move it to the bottom, or
        `"center"` to move it to the center.
        */
        y?: ScrollStrategy;
        /**
        Effect similar to
        [`y`](https://codemirror.net/6/docs/ref/#view.EditorView^scrollIntoView^options.y), but for the
        horizontal scroll position.
        */
        x?: ScrollStrategy;
        /**
        Extra vertical distance to add when moving something into
        view. Not used with the `"center"` strategy. Defaults to 5.
        */
        yMargin?: number;
        /**
        Extra horizontal distance to add. Not used with the `"center"`
        strategy. Defaults to 5.
        */
        xMargin?: number;
    }): StateEffect$1<unknown>;
    /**
    Facet to add a [style
    module](https://github.com/marijnh/style-mod#documentation) to
    an editor view. The view will ensure that the module is
    mounted in its [document
    root](https://codemirror.net/6/docs/ref/#view.EditorView.constructor^config.root).
    */
    static styleModule: Facet$1<StyleModule, readonly StyleModule[]>;
    /**
    Returns an extension that can be used to add DOM event handlers.
    The value should be an object mapping event names to handler
    functions. For any given event, such functions are ordered by
    extension precedence, and the first handler to return true will
    be assumed to have handled that event, and no other handlers or
    built-in behavior will be activated for it. These are registered
    on the [content element](https://codemirror.net/6/docs/ref/#view.EditorView.contentDOM), except
    for `scroll` handlers, which will be called any time the
    editor's [scroll element](https://codemirror.net/6/docs/ref/#view.EditorView.scrollDOM) or one of
    its parent nodes is scrolled.
    */
    static domEventHandlers(handlers: DOMEventHandlers<any>): Extension$1;
    /**
    An input handler can override the way changes to the editable
    DOM content are handled. Handlers are passed the document
    positions between which the change was found, and the new
    content. When one returns true, no further input handlers are
    called and the default behavior is prevented.
    */
    static inputHandler: Facet$1<(view: EditorView, from: number, to: number, text: string) => boolean, readonly ((view: EditorView, from: number, to: number, text: string) => boolean)[]>;
    /**
    By default, the editor assumes all its content has the same
    [text direction](https://codemirror.net/6/docs/ref/#view.Direction). Configure this with a `true`
    value to make it read the text direction of every (rendered)
    line separately.
    */
    static perLineTextDirection: Facet$1<boolean, boolean>;
    /**
    Allows you to provide a function that should be called when the
    library catches an exception from an extension (mostly from view
    plugins, but may be used by other extensions to route exceptions
    from user-code-provided callbacks). This is mostly useful for
    debugging and logging. See [`logException`](https://codemirror.net/6/docs/ref/#view.logException).
    */
    static exceptionSink: Facet$1<(exception: any) => void, readonly ((exception: any) => void)[]>;
    /**
    A facet that can be used to register a function to be called
    every time the view updates.
    */
    static updateListener: Facet$1<(update: ViewUpdate) => void, readonly ((update: ViewUpdate) => void)[]>;
    /**
    Facet that controls whether the editor content DOM is editable.
    When its highest-precedence value is `false`, the element will
    not have its `contenteditable` attribute set. (Note that this
    doesn't affect API calls that change the editor content, even
    when those are bound to keys or buttons. See the
    [`readOnly`](https://codemirror.net/6/docs/ref/#state.EditorState.readOnly) facet for that.)
    */
    static editable: Facet$1<boolean, boolean>;
    /**
    Allows you to influence the way mouse selection happens. The
    functions in this facet will be called for a `mousedown` event
    on the editor, and can return an object that overrides the way a
    selection is computed from that mouse click or drag.
    */
    static mouseSelectionStyle: Facet$1<MakeSelectionStyle, readonly MakeSelectionStyle[]>;
    /**
    Facet used to configure whether a given selection drag event
    should move or copy the selection. The given predicate will be
    called with the `mousedown` event, and can return `true` when
    the drag should move the content.
    */
    static dragMovesSelection: Facet$1<(event: MouseEvent) => boolean, readonly ((event: MouseEvent) => boolean)[]>;
    /**
    Facet used to configure whether a given selecting click adds a
    new range to the existing selection or replaces it entirely. The
    default behavior is to check `event.metaKey` on macOS, and
    `event.ctrlKey` elsewhere.
    */
    static clickAddsSelectionRange: Facet$1<(event: MouseEvent) => boolean, readonly ((event: MouseEvent) => boolean)[]>;
    /**
    A facet that determines which [decorations](https://codemirror.net/6/docs/ref/#view.Decoration)
    are shown in the view. Decorations can be provided in two
    ways—directly, or via a function that takes an editor view.
    
    Only decoration sets provided directly are allowed to influence
    the editor's vertical layout structure. The ones provided as
    functions are called _after_ the new viewport has been computed,
    and thus **must not** introduce block widgets or replacing
    decorations that cover line breaks.
    
    If you want decorated ranges to behave like atomic units for
    cursor motion and deletion purposes, also provide the range set
    containing the decorations to
    [`EditorView.atomicRanges`](https://codemirror.net/6/docs/ref/#view.EditorView^atomicRanges).
    */
    static decorations: Facet$1<DecorationSet | ((view: EditorView) => DecorationSet), readonly (DecorationSet | ((view: EditorView) => DecorationSet))[]>;
    /**
    Used to provide ranges that should be treated as atoms as far as
    cursor motion is concerned. This causes methods like
    [`moveByChar`](https://codemirror.net/6/docs/ref/#view.EditorView.moveByChar) and
    [`moveVertically`](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) (and the
    commands built on top of them) to skip across such regions when
    a selection endpoint would enter them. This does _not_ prevent
    direct programmatic [selection
    updates](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) from moving into such
    regions.
    */
    static atomicRanges: Facet$1<(view: EditorView) => RangeSet<any>, readonly ((view: EditorView) => RangeSet<any>)[]>;
    /**
    Facet that allows extensions to provide additional scroll
    margins (space around the sides of the scrolling element that
    should be considered invisible). This can be useful when the
    plugin introduces elements that cover part of that element (for
    example a horizontally fixed gutter).
    */
    static scrollMargins: Facet$1<(view: EditorView) => Partial<Rect> | null, readonly ((view: EditorView) => Partial<Rect> | null)[]>;
    /**
    Create a theme extension. The first argument can be a
    [`style-mod`](https://github.com/marijnh/style-mod#documentation)
    style spec providing the styles for the theme. These will be
    prefixed with a generated class for the style.
    
    Because the selectors will be prefixed with a scope class, rule
    that directly match the editor's [wrapper
    element](https://codemirror.net/6/docs/ref/#view.EditorView.dom)—to which the scope class will be
    added—need to be explicitly differentiated by adding an `&` to
    the selector for that element—for example
    `&.cm-focused`.
    
    When `dark` is set to true, the theme will be marked as dark,
    which will cause the `&dark` rules from [base
    themes](https://codemirror.net/6/docs/ref/#view.EditorView^baseTheme) to be used (as opposed to
    `&light` when a light theme is active).
    */
    static theme(spec: {
        [selector: string]: StyleSpec;
    }, options?: {
        dark?: boolean;
    }): Extension$1;
    /**
    This facet records whether a dark theme is active. The extension
    returned by [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme) automatically
    includes an instance of this when the `dark` option is set to
    true.
    */
    static darkTheme: Facet$1<boolean, boolean>;
    /**
    Create an extension that adds styles to the base theme. Like
    with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
    place of the editor wrapper element when directly targeting
    that. You can also use `&dark` or `&light` instead to only
    target editors with a dark or light theme.
    */
    static baseTheme(spec: {
        [selector: string]: StyleSpec;
    }): Extension$1;
    /**
    Facet that provides additional DOM attributes for the editor's
    editable DOM element.
    */
    static contentAttributes: Facet$1<AttrSource, readonly AttrSource[]>;
    /**
    Facet that provides DOM attributes for the editor's outer
    element.
    */
    static editorAttributes: Facet$1<AttrSource, readonly AttrSource[]>;
    /**
    An extension that enables line wrapping in the editor (by
    setting CSS `white-space` to `pre-wrap` in the content).
    */
    static lineWrapping: Extension$1;
    /**
    State effect used to include screen reader announcements in a
    transaction. These will be added to the DOM in a visually hidden
    element with `aria-live="polite"` set, and should be used to
    describe effects that are visually obvious but may not be
    noticed by screen reader users (such as moving to the next
    search match).
    */
    static announce: StateEffectType$1<string>;
    /**
    Retrieve an editor view instance from the view's DOM
    representation.
    */
    static findFromDOM(dom: HTMLElement): EditorView | null;
}
/**
Helper type that maps event names to event object types, or the
`any` type for unknown events.
*/
interface DOMEventMap extends HTMLElementEventMap {
    [other: string]: any;
}
/**
Event handlers are specified with objects like this. For event
types known by TypeScript, this will infer the event argument type
to hold the appropriate event object type. For unknown events, it
is inferred to `any`, and should be explicitly set if you want type
checking.
*/
declare type DOMEventHandlers<This> = {
    [event in keyof DOMEventMap]?: (this: This, event: DOMEventMap[event], view: EditorView) => boolean | void;
};

/**
Objects type used to represent individual completions.
*/
interface Completion {
    /**
    The label to show in the completion picker. This is what input
    is matched agains to determine whether a completion matches (and
    how well it matches).
    */
    label: string;
    /**
    An optional short piece of information to show (with a different
    style) after the label.
    */
    detail?: string;
    /**
    Additional info to show when the completion is selected. Can be
    a plain string or a function that'll render the DOM structure to
    show when invoked.
    */
    info?: string | ((completion: Completion) => (Node | null | Promise<Node | null>));
    /**
    How to apply the completion. The default is to replace it with
    its [label](https://codemirror.net/6/docs/ref/#autocomplete.Completion.label). When this holds a
    string, the completion range is replaced by that string. When it
    is a function, that function is called to perform the
    completion. If it fires a transaction, it is responsible for
    adding the [`pickedCompletion`](https://codemirror.net/6/docs/ref/#autocomplete.pickedCompletion)
    annotation to it.
    */
    apply?: string | ((view: EditorView, completion: Completion, from: number, to: number) => void);
    /**
    The type of the completion. This is used to pick an icon to show
    for the completion. Icons are styled with a CSS class created by
    appending the type name to `"cm-completionIcon-"`. You can
    define or restyle icons by defining these selectors. The base
    library defines simple icons for `class`, `constant`, `enum`,
    `function`, `interface`, `keyword`, `method`, `namespace`,
    `property`, `text`, `type`, and `variable`.
    
    Multiple types can be provided by separating them with spaces.
    */
    type?: string;
    /**
    When given, should be a number from -99 to 99 that adjusts how
    this completion is ranked compared to other completions that
    match the input as well as this one. A negative number moves it
    down the list, a positive number moves it up.
    */
    boost?: number;
}

declare type SQLDialectSpec = {
    /**
    A space-separated list of keywords for the dialect.
    */
    keywords?: string;
    /**
    A space-separated string of built-in identifiers for the dialect.
    */
    builtin?: string;
    /**
    A space-separated string of type names for the dialect.
    */
    types?: string;
    /**
    Controls whether regular strings allow backslash escapes.
    */
    backslashEscapes?: boolean;
    /**
    Controls whether # creates a line comment.
    */
    hashComments?: boolean;
    /**
    Controls whether `//` creates a line comment.
    */
    slashComments?: boolean;
    /**
    When enabled `--` comments are only recognized when there's a
    space after the dashes.
    */
    spaceAfterDashes?: boolean;
    /**
    When enabled, things quoted with "$$" are treated as
    strings, rather than identifiers.
    */
    doubleDollarQuotedStrings?: boolean;
    /**
    When enabled, things quoted with double quotes are treated as
    strings, rather than identifiers.
    */
    doubleQuotedStrings?: boolean;
    /**
    Enables strings like `_utf8'str'` or `N'str'`.
    */
    charSetCasts?: boolean;
    /**
    The set of characters that make up operators. Defaults to
    `"*+\-%<>!=&|~^/"`.
    */
    operatorChars?: string;
    /**
    The set of characters that start a special variable name.
    Defaults to `"?"`.
    */
    specialVar?: string;
    /**
    The characters that can be used to quote identifiers. Defaults
    to `"\""`.
    */
    identifierQuotes?: string;
    /**
    Controls whether bit values can be defined as 0b1010. Defaults
    to false.
    */
    unquotedBitLiterals?: boolean;
    treatBitsAsBytes?: boolean;
};
/**
Represents an SQL dialect.
*/
declare class SQLDialect {
    /**
    The language for this dialect.
    */
    readonly language: LRLanguage;
    private constructor();
    /**
    Returns the language for this dialect as an extension.
    */
    get extension(): Extension$1;
    /**
    Define a new dialect.
    */
    static define(spec: SQLDialectSpec): SQLDialect;
}
/**
Options used to configure an SQL extension.
*/
interface SQLConfig {
    /**
    The [dialect](https://codemirror.net/6/docs/ref/#lang-sql.SQLDialect) to use. Defaults to
    [`StandardSQL`](https://codemirror.net/6/docs/ref/#lang-sql.StandardSQL).
    */
    dialect?: SQLDialect;
    /**
    An object that maps table names, optionally prefixed with a
    schema name (`"schema.table"`) to options (columns) that can be
    completed for that table. Use lower-case names here.
    */
    schema?: {
        [table: string]: readonly (string | Completion)[];
    };
    /**
    By default, the completions for the table names will be
    generated from the `schema` object. But if you want to
    customize them, you can pass an array of completions through
    this option.
    */
    tables?: readonly Completion[];
    /**
    When given, columns from the named table can be completed
    directly at the top level.
    */
    defaultTable?: string;
    /**
    When given, tables prefixed with this schema name can be
    completed directly at the top level.
    */
    defaultSchema?: string;
    /**
    When set to true, keyword completions will be upper-case.
    */
    upperCaseKeywords?: boolean;
}
/**
SQL language support for the given SQL dialect, with keyword
completion, and, if provided, schema-based completion as extra
extensions.
*/
declare function sql(config?: SQLConfig): LanguageSupport;
/**
Dialect for [PostgreSQL](https://www.postgresql.org).
*/
declare const PostgreSQL: SQLDialect;

/**
A language provider based on the [Lezer Python
parser](https://github.com/lezer-parser/python), extended with
highlighting and indentation information.
*/
declare const pythonLanguage: LRLanguage;
/**
Python language support.
*/
declare function python(): LanguageSupport;

/**
A text iterator iterates over a sequence of strings. When
iterating over a [`Text`](https://codemirror.net/6/docs/ref/#state.Text) document, result values will
either be lines or line breaks.
*/
interface TextIterator extends Iterator<string>, Iterable<string> {
    /**
    Retrieve the next string. Optionally skip a given number of
    positions after the current position. Always returns the object
    itself.
    */
    next(skip?: number): this;
    /**
    The current string. Will be the empty string when the cursor is
    at its end or `next` hasn't been called on it yet.
    */
    value: string;
    /**
    Whether the end of the iteration has been reached. You should
    probably check this right after calling `next`.
    */
    done: boolean;
    /**
    Whether the current string represents a line break.
    */
    lineBreak: boolean;
}
/**
The data structure for documents. @nonabstract
*/
declare abstract class Text implements Iterable<string> {
    /**
    The length of the string.
    */
    abstract readonly length: number;
    /**
    The number of lines in the string (always >= 1).
    */
    abstract readonly lines: number;
    /**
    Get the line description around the given position.
    */
    lineAt(pos: number): Line;
    /**
    Get the description for the given (1-based) line number.
    */
    line(n: number): Line;
    /**
    Replace a range of the text with the given content.
    */
    replace(from: number, to: number, text: Text): Text;
    /**
    Append another document to this one.
    */
    append(other: Text): Text;
    /**
    Retrieve the text between the given points.
    */
    slice(from: number, to?: number): Text;
    /**
    Retrieve a part of the document as a string
    */
    abstract sliceString(from: number, to?: number, lineSep?: string): string;
    /**
    Test whether this text is equal to another instance.
    */
    eq(other: Text): boolean;
    /**
    Iterate over the text. When `dir` is `-1`, iteration happens
    from end to start. This will return lines and the breaks between
    them as separate strings.
    */
    iter(dir?: 1 | -1): TextIterator;
    /**
    Iterate over a range of the text. When `from` > `to`, the
    iterator will run in reverse.
    */
    iterRange(from: number, to?: number): TextIterator;
    /**
    Return a cursor that iterates over the given range of lines,
    _without_ returning the line breaks between, and yielding empty
    strings for empty lines.
    
    When `from` and `to` are given, they should be 1-based line numbers.
    */
    iterLines(from?: number, to?: number): TextIterator;
    /**
    Convert the document to an array of lines (which can be
    deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#state.Text^of)).
    */
    toJSON(): string[];
    /**
    If this is a branch node, `children` will hold the `Text`
    objects that it is made up of. For leaf nodes, this holds null.
    */
    abstract readonly children: readonly Text[] | null;
    [Symbol.iterator]: () => Iterator<string>;
    /**
    Create a `Text` instance for the given array of lines.
    */
    static of(text: readonly string[]): Text;
    /**
    The empty document.
    */
    static empty: Text;
}
/**
This type describes a line in the document. It is created
on-demand when lines are [queried](https://codemirror.net/6/docs/ref/#state.Text.lineAt).
*/
declare class Line {
    /**
    The position of the start of the line.
    */
    readonly from: number;
    /**
    The position at the end of the line (_before_ the line break,
    or at the end of document for the last line).
    */
    readonly to: number;
    /**
    This line's line number (1-based).
    */
    readonly number: number;
    /**
    The line's content.
    */
    readonly text: string;
    /**
    The length of the line (not including any line break after it).
    */
    get length(): number;
}

/**
Distinguishes different ways in which positions can be mapped.
*/
declare enum MapMode {
    /**
    Map a position to a valid new position, even when its context
    was deleted.
    */
    Simple = 0,
    /**
    Return null if deletion happens across the position.
    */
    TrackDel = 1,
    /**
    Return null if the character _before_ the position is deleted.
    */
    TrackBefore = 2,
    /**
    Return null if the character _after_ the position is deleted.
    */
    TrackAfter = 3
}
/**
A change description is a variant of [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet)
that doesn't store the inserted text. As such, it can't be
applied, but is cheaper to store and manipulate.
*/
declare class ChangeDesc {
    /**
    The length of the document before the change.
    */
    get length(): number;
    /**
    The length of the document after the change.
    */
    get newLength(): number;
    /**
    False when there are actual changes in this set.
    */
    get empty(): boolean;
    /**
    Iterate over the unchanged parts left by these changes. `posA`
    provides the position of the range in the old document, `posB`
    the new position in the changed document.
    */
    iterGaps(f: (posA: number, posB: number, length: number) => void): void;
    /**
    Iterate over the ranges changed by these changes. (See
    [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
    variant that also provides you with the inserted text.)
    `fromA`/`toA` provides the extent of the change in the starting
    document, `fromB`/`toB` the extent of the replacement in the
    changed document.
    
    When `individual` is true, adjacent changes (which are kept
    separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
    reported separately.
    */
    iterChangedRanges(f: (fromA: number, toA: number, fromB: number, toB: number) => void, individual?: boolean): void;
    /**
    Get a description of the inverted form of these changes.
    */
    get invertedDesc(): ChangeDesc;
    /**
    Compute the combined effect of applying another set of changes
    after this one. The length of the document after this set should
    match the length before `other`.
    */
    composeDesc(other: ChangeDesc): ChangeDesc;
    /**
    Map this description, which should start with the same document
    as `other`, over another set of changes, so that it can be
    applied after it. When `before` is true, map as if the changes
    in `other` happened before the ones in `this`.
    */
    mapDesc(other: ChangeDesc, before?: boolean): ChangeDesc;
    /**
    Map a given position through these changes, to produce a
    position pointing into the new document.
    
    `assoc` indicates which side the position should be associated
    with. When it is negative or zero, the mapping will try to keep
    the position close to the character before it (if any), and will
    move it before insertions at that point or replacements across
    that point. When it is positive, the position is associated with
    the character after it, and will be moved forward for insertions
    at or replacements across the position. Defaults to -1.
    
    `mode` determines whether deletions should be
    [reported](https://codemirror.net/6/docs/ref/#state.MapMode). It defaults to
    [`MapMode.Simple`](https://codemirror.net/6/docs/ref/#state.MapMode.Simple) (don't report
    deletions).
    */
    mapPos(pos: number, assoc?: number): number;
    mapPos(pos: number, assoc: number, mode: MapMode): number | null;
    /**
    Check whether these changes touch a given range. When one of the
    changes entirely covers the range, the string `"cover"` is
    returned.
    */
    touchesRange(from: number, to?: number): boolean | "cover";
    /**
    Serialize this change desc to a JSON-representable value.
    */
    toJSON(): readonly number[];
    /**
    Create a change desc from its JSON representation (as produced
    by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
    */
    static fromJSON(json: any): ChangeDesc;
}
/**
This type is used as argument to
[`EditorState.changes`](https://codemirror.net/6/docs/ref/#state.EditorState.changes) and in the
[`changes` field](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) of transaction
specs to succinctly describe document changes. It may either be a
plain object describing a change (a deletion, insertion, or
replacement, depending on which fields are present), a [change
set](https://codemirror.net/6/docs/ref/#state.ChangeSet), or an array of change specs.
*/
declare type ChangeSpec = {
    from: number;
    to?: number;
    insert?: string | Text;
} | ChangeSet | readonly ChangeSpec[];
/**
A change set represents a group of modifications to a document. It
stores the document length, and can only be applied to documents
with exactly that length.
*/
declare class ChangeSet extends ChangeDesc {
    private constructor();
    /**
    Apply the changes to a document, returning the modified
    document.
    */
    apply(doc: Text): Text;
    mapDesc(other: ChangeDesc, before?: boolean): ChangeDesc;
    /**
    Given the document as it existed _before_ the changes, return a
    change set that represents the inverse of this set, which could
    be used to go from the document created by the changes back to
    the document as it existed before the changes.
    */
    invert(doc: Text): ChangeSet;
    /**
    Combine two subsequent change sets into a single set. `other`
    must start in the document produced by `this`. If `this` goes
    `docA` → `docB` and `other` represents `docB` → `docC`, the
    returned value will represent the change `docA` → `docC`.
    */
    compose(other: ChangeSet): ChangeSet;
    /**
    Given another change set starting in the same document, maps this
    change set over the other, producing a new change set that can be
    applied to the document produced by applying `other`. When
    `before` is `true`, order changes as if `this` comes before
    `other`, otherwise (the default) treat `other` as coming first.
    
    Given two changes `A` and `B`, `A.compose(B.map(A))` and
    `B.compose(A.map(B, true))` will produce the same document. This
    provides a basic form of [operational
    transformation](https://en.wikipedia.org/wiki/Operational_transformation),
    and can be used for collaborative editing.
    */
    map(other: ChangeDesc, before?: boolean): ChangeSet;
    /**
    Iterate over the changed ranges in the document, calling `f` for
    each, with the range in the original document (`fromA`-`toA`)
    and the range that replaces it in the new document
    (`fromB`-`toB`).
    
    When `individual` is true, adjacent changes are reported
    separately.
    */
    iterChanges(f: (fromA: number, toA: number, fromB: number, toB: number, inserted: Text) => void, individual?: boolean): void;
    /**
    Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
    set.
    */
    get desc(): ChangeDesc;
    /**
    Serialize this change set to a JSON-representable value.
    */
    toJSON(): any;
    /**
    Create a change set for the given changes, for a document of the
    given length, using `lineSep` as line separator.
    */
    static of(changes: ChangeSpec, length: number, lineSep?: string): ChangeSet;
    /**
    Create an empty changeset of the given length.
    */
    static empty(length: number): ChangeSet;
    /**
    Create a changeset from its JSON representation (as produced by
    [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
    */
    static fromJSON(json: any): ChangeSet;
}

/**
A single selection range. When
[`allowMultipleSelections`](https://codemirror.net/6/docs/ref/#state.EditorState^allowMultipleSelections)
is enabled, a [selection](https://codemirror.net/6/docs/ref/#state.EditorSelection) may hold
multiple ranges. By default, selections hold exactly one range.
*/
declare class SelectionRange {
    /**
    The lower boundary of the range.
    */
    readonly from: number;
    /**
    The upper boundary of the range.
    */
    readonly to: number;
    private flags;
    private constructor();
    /**
    The anchor of the range—the side that doesn't move when you
    extend it.
    */
    get anchor(): number;
    /**
    The head of the range, which is moved when the range is
    [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
    */
    get head(): number;
    /**
    True when `anchor` and `head` are at the same position.
    */
    get empty(): boolean;
    /**
    If this is a cursor that is explicitly associated with the
    character on one of its sides, this returns the side. -1 means
    the character before its position, 1 the character after, and 0
    means no association.
    */
    get assoc(): -1 | 0 | 1;
    /**
    The bidirectional text level associated with this cursor, if
    any.
    */
    get bidiLevel(): number | null;
    /**
    The goal column (stored vertical offset) associated with a
    cursor. This is used to preserve the vertical position when
    [moving](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) across
    lines of different length.
    */
    get goalColumn(): number | undefined;
    /**
    Map this range through a change, producing a valid range in the
    updated document.
    */
    map(change: ChangeDesc, assoc?: number): SelectionRange;
    /**
    Extend this range to cover at least `from` to `to`.
    */
    extend(from: number, to?: number): SelectionRange;
    /**
    Compare this range to another range.
    */
    eq(other: SelectionRange): boolean;
    /**
    Return a JSON-serializable object representing the range.
    */
    toJSON(): any;
    /**
    Convert a JSON representation of a range to a `SelectionRange`
    instance.
    */
    static fromJSON(json: any): SelectionRange;
}
/**
An editor selection holds one or more selection ranges.
*/
declare class EditorSelection {
    /**
    The ranges in the selection, sorted by position. Ranges cannot
    overlap (but they may touch, if they aren't empty).
    */
    readonly ranges: readonly SelectionRange[];
    /**
    The index of the _main_ range in the selection (which is
    usually the range that was added last).
    */
    readonly mainIndex: number;
    private constructor();
    /**
    Map a selection through a change. Used to adjust the selection
    position for changes.
    */
    map(change: ChangeDesc, assoc?: number): EditorSelection;
    /**
    Compare this selection to another selection.
    */
    eq(other: EditorSelection): boolean;
    /**
    Get the primary selection range. Usually, you should make sure
    your code applies to _all_ ranges, by using methods like
    [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
    */
    get main(): SelectionRange;
    /**
    Make sure the selection only has one range. Returns a selection
    holding only the main range from this selection.
    */
    asSingle(): EditorSelection;
    /**
    Extend this selection with an extra range.
    */
    addRange(range: SelectionRange, main?: boolean): EditorSelection;
    /**
    Replace a given range with another range, and then normalize the
    selection to merge and sort ranges if necessary.
    */
    replaceRange(range: SelectionRange, which?: number): EditorSelection;
    /**
    Convert this selection to an object that can be serialized to
    JSON.
    */
    toJSON(): any;
    /**
    Create a selection from a JSON representation.
    */
    static fromJSON(json: any): EditorSelection;
    /**
    Create a selection holding a single range.
    */
    static single(anchor: number, head?: number): EditorSelection;
    /**
    Sort and merge the given set of ranges, creating a valid
    selection.
    */
    static create(ranges: readonly SelectionRange[], mainIndex?: number): EditorSelection;
    /**
    Create a cursor selection range at the given position. You can
    safely ignore the optional arguments in most situations.
    */
    static cursor(pos: number, assoc?: number, bidiLevel?: number, goalColumn?: number): SelectionRange;
    /**
    Create a selection range.
    */
    static range(anchor: number, head: number, goalColumn?: number): SelectionRange;
}

declare type FacetConfig<Input, Output> = {
    /**
    How to combine the input values into a single output value. When
    not given, the array of input values becomes the output. This
    function will immediately be called on creating the facet, with
    an empty array, to compute the facet's default value when no
    inputs are present.
    */
    combine?: (value: readonly Input[]) => Output;
    /**
    How to compare output values to determine whether the value of
    the facet changed. Defaults to comparing by `===` or, if no
    `combine` function was given, comparing each element of the
    array with `===`.
    */
    compare?: (a: Output, b: Output) => boolean;
    /**
    How to compare input values to avoid recomputing the output
    value when no inputs changed. Defaults to comparing with `===`.
    */
    compareInput?: (a: Input, b: Input) => boolean;
    /**
    Forbids dynamic inputs to this facet.
    */
    static?: boolean;
    /**
    If given, these extension(s) (or the result of calling the given
    function with the facet) will be added to any state where this
    facet is provided. (Note that, while a facet's default value can
    be read from a state even if the facet wasn't present in the
    state at all, these extensions won't be added in that
    situation.)
    */
    enables?: Extension | ((self: Facet<Input, Output>) => Extension);
};
/**
A facet is a labeled value that is associated with an editor
state. It takes inputs from any number of extensions, and combines
those into a single output value.

Examples of uses of facets are the [tab
size](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize), [editor
attributes](https://codemirror.net/6/docs/ref/#view.EditorView^editorAttributes), and [update
listeners](https://codemirror.net/6/docs/ref/#view.EditorView^updateListener).
*/
declare class Facet<Input, Output = readonly Input[]> {
    private isStatic;
    private constructor();
    /**
    Define a new facet.
    */
    static define<Input, Output = readonly Input[]>(config?: FacetConfig<Input, Output>): Facet<Input, Output>;
    /**
    Returns an extension that adds the given value to this facet.
    */
    of(value: Input): Extension;
    /**
    Create an extension that computes a value for the facet from a
    state. You must take care to declare the parts of the state that
    this value depends on, since your function is only called again
    for a new state when one of those parts changed.
    
    In cases where your value depends only on a single field, you'll
    want to use the [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method instead.
    */
    compute(deps: readonly Slot<any>[], get: (state: EditorState) => Input): Extension;
    /**
    Create an extension that computes zero or more values for this
    facet from a state.
    */
    computeN(deps: readonly Slot<any>[], get: (state: EditorState) => readonly Input[]): Extension;
    /**
    Shorthand method for registering a facet source with a state
    field as input. If the field's type corresponds to this facet's
    input type, the getter function can be omitted. If given, it
    will be used to retrieve the input from the field value.
    */
    from<T extends Input>(field: StateField<T>): Extension;
    from<T>(field: StateField<T>, get: (value: T) => Input): Extension;
}
declare type Slot<T> = Facet<any, T> | StateField<T> | "doc" | "selection";
declare type StateFieldSpec<Value> = {
    /**
    Creates the initial value for the field when a state is created.
    */
    create: (state: EditorState) => Value;
    /**
    Compute a new value from the field's previous value and a
    [transaction](https://codemirror.net/6/docs/ref/#state.Transaction).
    */
    update: (value: Value, transaction: Transaction) => Value;
    /**
    Compare two values of the field, returning `true` when they are
    the same. This is used to avoid recomputing facets that depend
    on the field when its value did not change. Defaults to using
    `===`.
    */
    compare?: (a: Value, b: Value) => boolean;
    /**
    Provide extensions based on this field. The given function will
    be called once with the initialized field. It will usually want
    to call some facet's [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method to
    create facet inputs from this field, but can also return other
    extensions that should be enabled when the field is present in a
    configuration.
    */
    provide?: (field: StateField<Value>) => Extension;
    /**
    A function used to serialize this field's content to JSON. Only
    necessary when this field is included in the argument to
    [`EditorState.toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON).
    */
    toJSON?: (value: Value, state: EditorState) => any;
    /**
    A function that deserializes the JSON representation of this
    field's content.
    */
    fromJSON?: (json: any, state: EditorState) => Value;
};
/**
Fields can store additional information in an editor state, and
keep it in sync with the rest of the state.
*/
declare class StateField<Value> {
    private createF;
    private updateF;
    private compareF;
    private constructor();
    /**
    Define a state field.
    */
    static define<Value>(config: StateFieldSpec<Value>): StateField<Value>;
    private create;
    /**
    Returns an extension that enables this field and overrides the
    way it is initialized. Can be useful when you need to provide a
    non-default starting value for the field.
    */
    init(create: (state: EditorState) => Value): Extension;
    /**
    State field instances can be used as
    [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
    given state.
    */
    get extension(): Extension;
}
/**
Extension values can be
[provided](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions) when creating a
state to attach various kinds of configuration and behavior
information. They can either be built-in extension-providing
objects, such as [state fields](https://codemirror.net/6/docs/ref/#state.StateField) or [facet
providers](https://codemirror.net/6/docs/ref/#state.Facet.of), or objects with an extension in its
`extension` property. Extensions can be nested in arrays
arbitrarily deep—they will be flattened when processed.
*/
declare type Extension = {
    extension: Extension;
} | readonly Extension[];

/**
Annotations are tagged values that are used to add metadata to
transactions in an extensible way. They should be used to model
things that effect the entire transaction (such as its [time
stamp](https://codemirror.net/6/docs/ref/#state.Transaction^time) or information about its
[origin](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent)). For effects that happen
_alongside_ the other changes made by the transaction, [state
effects](https://codemirror.net/6/docs/ref/#state.StateEffect) are more appropriate.
*/
declare class Annotation<T> {
    /**
    The annotation type.
    */
    readonly type: AnnotationType<T>;
    /**
    The value of this annotation.
    */
    readonly value: T;
    /**
    Define a new type of annotation.
    */
    static define<T>(): AnnotationType<T>;
    private _isAnnotation;
}
/**
Marker that identifies a type of [annotation](https://codemirror.net/6/docs/ref/#state.Annotation).
*/
declare class AnnotationType<T> {
    /**
    Create an instance of this annotation.
    */
    of(value: T): Annotation<T>;
}
interface StateEffectSpec<Value> {
    /**
    Provides a way to map an effect like this through a position
    mapping. When not given, the effects will simply not be mapped.
    When the function returns `undefined`, that means the mapping
    deletes the effect.
    */
    map?: (value: Value, mapping: ChangeDesc) => Value | undefined;
}
/**
Representation of a type of state effect. Defined with
[`StateEffect.define`](https://codemirror.net/6/docs/ref/#state.StateEffect^define).
*/
declare class StateEffectType<Value> {
    /**
    @internal
    */
    readonly map: (value: any, mapping: ChangeDesc) => any | undefined;
    /**
    Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
    type.
    */
    of(value: Value): StateEffect<Value>;
}
/**
State effects can be used to represent additional effects
associated with a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction.effects). They
are often useful to model changes to custom [state
fields](https://codemirror.net/6/docs/ref/#state.StateField), when those changes aren't implicit in
document or selection changes.
*/
declare class StateEffect<Value> {
    /**
    The value of this effect.
    */
    readonly value: Value;
    /**
    Map this effect through a position mapping. Will return
    `undefined` when that ends up deleting the effect.
    */
    map(mapping: ChangeDesc): StateEffect<Value> | undefined;
    /**
    Tells you whether this effect object is of a given
    [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
    */
    is<T>(type: StateEffectType<T>): this is StateEffect<T>;
    /**
    Define a new effect type. The type parameter indicates the type
    of values that his effect holds.
    */
    static define<Value = null>(spec?: StateEffectSpec<Value>): StateEffectType<Value>;
    /**
    Map an array of effects through a change set.
    */
    static mapEffects(effects: readonly StateEffect<any>[], mapping: ChangeDesc): readonly StateEffect<any>[];
    /**
    This effect can be used to reconfigure the root extensions of
    the editor. Doing this will discard any extensions
    [appended](https://codemirror.net/6/docs/ref/#state.StateEffect^appendConfig), but does not reset
    the content of [reconfigured](https://codemirror.net/6/docs/ref/#state.Compartment.reconfigure)
    compartments.
    */
    static reconfigure: StateEffectType<Extension>;
    /**
    Append extensions to the top-level configuration of the editor.
    */
    static appendConfig: StateEffectType<Extension>;
}
/**
Describes a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) when calling the
[`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update) method.
*/
interface TransactionSpec {
    /**
    The changes to the document made by this transaction.
    */
    changes?: ChangeSpec;
    /**
    When set, this transaction explicitly updates the selection.
    Offsets in this selection should refer to the document as it is
    _after_ the transaction.
    */
    selection?: EditorSelection | {
        anchor: number;
        head?: number;
    };
    /**
    Attach [state effects](https://codemirror.net/6/docs/ref/#state.StateEffect) to this transaction.
    Again, when they contain positions and this same spec makes
    changes, those positions should refer to positions in the
    updated document.
    */
    effects?: StateEffect<any> | readonly StateEffect<any>[];
    /**
    Set [annotations](https://codemirror.net/6/docs/ref/#state.Annotation) for this transaction.
    */
    annotations?: Annotation<any> | readonly Annotation<any>[];
    /**
    Shorthand for `annotations:` [`Transaction.userEvent`](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent)`.of(...)`.
    */
    userEvent?: string;
    /**
    When set to `true`, the transaction is marked as needing to
    scroll the current selection into view.
    */
    scrollIntoView?: boolean;
    /**
    By default, transactions can be modified by [change
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^changeFilter) and [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter). You can set this
    to `false` to disable that. This can be necessary for
    transactions that, for example, include annotations that must be
    kept consistent with their changes.
    */
    filter?: boolean;
    /**
    Normally, when multiple specs are combined (for example by
    [`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update)), the
    positions in `changes` are taken to refer to the document
    positions in the initial document. When a spec has `sequental`
    set to true, its positions will be taken to refer to the
    document created by the specs before it instead.
    */
    sequential?: boolean;
}
/**
Changes to the editor state are grouped into transactions.
Typically, a user action creates a single transaction, which may
contain any number of document changes, may change the selection,
or have other effects. Create a transaction by calling
[`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update), or immediately
dispatch one by calling
[`EditorView.dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch).
*/
declare class Transaction {
    /**
    The state from which the transaction starts.
    */
    readonly startState: EditorState;
    /**
    The document changes made by this transaction.
    */
    readonly changes: ChangeSet;
    /**
    The selection set by this transaction, or undefined if it
    doesn't explicitly set a selection.
    */
    readonly selection: EditorSelection | undefined;
    /**
    The effects added to the transaction.
    */
    readonly effects: readonly StateEffect<any>[];
    /**
    Whether the selection should be scrolled into view after this
    transaction is dispatched.
    */
    readonly scrollIntoView: boolean;
    private constructor();
    /**
    The new document produced by the transaction. Contrary to
    [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
    force the entire new state to be computed right away, so it is
    recommended that [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
    when they need to look at the new document.
    */
    get newDoc(): Text;
    /**
    The new selection produced by the transaction. If
    [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
    this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
    current selection through the changes made by the transaction.
    */
    get newSelection(): EditorSelection;
    /**
    The new state created by the transaction. Computed on demand
    (but retained for subsequent access), so it is recommended not to
    access it in [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
    */
    get state(): EditorState;
    /**
    Get the value of the given annotation type, if any.
    */
    annotation<T>(type: AnnotationType<T>): T | undefined;
    /**
    Indicates whether the transaction changed the document.
    */
    get docChanged(): boolean;
    /**
    Indicates whether this transaction reconfigures the state
    (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
    with a top-level configuration
    [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
    */
    get reconfigured(): boolean;
    /**
    Returns true if the transaction has a [user
    event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
    or more specific than `event`. For example, if the transaction
    has `"select.pointer"` as user event, `"select"` and
    `"select.pointer"` will match it.
    */
    isUserEvent(event: string): boolean;
    /**
    Annotation used to store transaction timestamps. Automatically
    added to every transaction, holding `Date.now()`.
    */
    static time: AnnotationType<number>;
    /**
    Annotation used to associate a transaction with a user interface
    event. Holds a string identifying the event, using a
    dot-separated format to support attaching more specific
    information. The events used by the core libraries are:
    
     - `"input"` when content is entered
       - `"input.type"` for typed input
         - `"input.type.compose"` for composition
       - `"input.paste"` for pasted input
       - `"input.drop"` when adding content with drag-and-drop
       - `"input.complete"` when autocompleting
     - `"delete"` when the user deletes content
       - `"delete.selection"` when deleting the selection
       - `"delete.forward"` when deleting forward from the selection
       - `"delete.backward"` when deleting backward from the selection
       - `"delete.cut"` when cutting to the clipboard
     - `"move"` when content is moved
       - `"move.drop"` when content is moved within the editor through drag-and-drop
     - `"select"` when explicitly changing the selection
       - `"select.pointer"` when selecting with a mouse or other pointing device
     - `"undo"` and `"redo"` for history actions
    
    Use [`isUserEvent`](https://codemirror.net/6/docs/ref/#state.Transaction.isUserEvent) to check
    whether the annotation matches a given event.
    */
    static userEvent: AnnotationType<string>;
    /**
    Annotation indicating whether a transaction should be added to
    the undo history or not.
    */
    static addToHistory: AnnotationType<boolean>;
    /**
    Annotation indicating (when present and true) that a transaction
    represents a change made by some other actor, not the user. This
    is used, for example, to tag other people's changes in
    collaborative editing.
    */
    static remote: AnnotationType<boolean>;
}

/**
The categories produced by a [character
categorizer](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer). These are used
do things like selecting by word.
*/
declare enum CharCategory {
    /**
    Word characters.
    */
    Word = 0,
    /**
    Whitespace.
    */
    Space = 1,
    /**
    Anything else.
    */
    Other = 2
}

/**
Options passed when [creating](https://codemirror.net/6/docs/ref/#state.EditorState^create) an
editor state.
*/
interface EditorStateConfig {
    /**
    The initial document. Defaults to an empty document. Can be
    provided either as a plain string (which will be split into
    lines according to the value of the [`lineSeparator`
    facet](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)), or an instance of
    the [`Text`](https://codemirror.net/6/docs/ref/#state.Text) class (which is what the state will use
    to represent the document).
    */
    doc?: string | Text;
    /**
    The starting selection. Defaults to a cursor at the very start
    of the document.
    */
    selection?: EditorSelection | {
        anchor: number;
        head?: number;
    };
    /**
    [Extension(s)](https://codemirror.net/6/docs/ref/#state.Extension) to associate with this state.
    */
    extensions?: Extension;
}
/**
The editor state class is a persistent (immutable) data structure.
To update a state, you [create](https://codemirror.net/6/docs/ref/#state.EditorState.update) a
[transaction](https://codemirror.net/6/docs/ref/#state.Transaction), which produces a _new_ state
instance, without modifying the original object.

As such, _never_ mutate properties of a state directly. That'll
just break things.
*/
declare class EditorState {
    /**
    The current document.
    */
    readonly doc: Text;
    /**
    The current selection.
    */
    readonly selection: EditorSelection;
    private constructor();
    /**
    Retrieve the value of a [state field](https://codemirror.net/6/docs/ref/#state.StateField). Throws
    an error when the state doesn't have that field, unless you pass
    `false` as second parameter.
    */
    field<T>(field: StateField<T>): T;
    field<T>(field: StateField<T>, require: false): T | undefined;
    /**
    Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
    state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
    can be passed. Unless
    [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
    [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
    are assumed to start in the _current_ document (not the document
    produced by previous specs), and its
    [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
    [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
    to the document created by its _own_ changes. The resulting
    transaction contains the combined effect of all the different
    specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
    specs take precedence over earlier ones.
    */
    update(...specs: readonly TransactionSpec[]): Transaction;
    /**
    Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
    replaces every selection range with the given content.
    */
    replaceSelection(text: string | Text): TransactionSpec;
    /**
    Create a set of changes and a new selection by running the given
    function for each range in the active selection. The function
    can return an optional set of changes (in the coordinate space
    of the start document), plus an updated range (in the coordinate
    space of the document produced by the call's own changes). This
    method will merge all the changes and ranges into a single
    changeset and selection, and return it as a [transaction
    spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
    [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
    */
    changeByRange(f: (range: SelectionRange) => {
        range: SelectionRange;
        changes?: ChangeSpec;
        effects?: StateEffect<any> | readonly StateEffect<any>[];
    }): {
        changes: ChangeSet;
        selection: EditorSelection;
        effects: readonly StateEffect<any>[];
    };
    /**
    Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
    description, taking the state's document length and line
    separator into account.
    */
    changes(spec?: ChangeSpec): ChangeSet;
    /**
    Using the state's [line
    separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
    [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
    */
    toText(string: string): Text;
    /**
    Return the given range of the document as a string.
    */
    sliceDoc(from?: number, to?: number): string;
    /**
    Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
    */
    facet<Output>(facet: Facet<any, Output>): Output;
    /**
    Convert this state to a JSON-serializable object. When custom
    fields should be serialized, you can pass them in as an object
    mapping property names (in the resulting object, which should
    not use `doc` or `selection`) to fields.
    */
    toJSON(fields?: {
        [prop: string]: StateField<any>;
    }): any;
    /**
    Deserialize a state from its JSON representation. When custom
    fields should be deserialized, pass the same object you passed
    to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
    third argument.
    */
    static fromJSON(json: any, config?: EditorStateConfig, fields?: {
        [prop: string]: StateField<any>;
    }): EditorState;
    /**
    Create a new state. You'll usually only need this when
    initializing an editor—updated states are created by applying
    transactions.
    */
    static create(config?: EditorStateConfig): EditorState;
    /**
    A facet that, when enabled, causes the editor to allow multiple
    ranges to be selected. Be careful though, because by default the
    editor relies on the native DOM selection, which cannot handle
    multiple selections. An extension like
    [`drawSelection`](https://codemirror.net/6/docs/ref/#view.drawSelection) can be used to make
    secondary selections visible to the user.
    */
    static allowMultipleSelections: Facet<boolean, boolean>;
    /**
    Configures the tab size to use in this state. The first
    (highest-precedence) value of the facet is used. If no value is
    given, this defaults to 4.
    */
    static tabSize: Facet<number, number>;
    /**
    The size (in columns) of a tab in the document, determined by
    the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
    */
    get tabSize(): number;
    /**
    The line separator to use. By default, any of `"\n"`, `"\r\n"`
    and `"\r"` is treated as a separator when splitting lines, and
    lines are joined with `"\n"`.
    
    When you configure a value here, only that precise separator
    will be used, allowing you to round-trip documents through the
    editor without normalizing line separators.
    */
    static lineSeparator: Facet<string, string | undefined>;
    /**
    Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
    string for this state.
    */
    get lineBreak(): string;
    /**
    This facet controls the value of the
    [`readOnly`](https://codemirror.net/6/docs/ref/#state.EditorState.readOnly) getter, which is
    consulted by commands and extensions that implement editing
    functionality to determine whether they should apply. It
    defaults to false, but when its highest-precedence value is
    `true`, such functionality disables itself.
    
    Not to be confused with
    [`EditorView.editable`](https://codemirror.net/6/docs/ref/#view.EditorView^editable), which
    controls whether the editor's DOM is set to be editable (and
    thus focusable).
    */
    static readOnly: Facet<boolean, boolean>;
    /**
    Returns true when the editor is
    [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
    */
    get readOnly(): boolean;
    /**
    Registers translation phrases. The
    [`phrase`](https://codemirror.net/6/docs/ref/#state.EditorState.phrase) method will look through
    all objects registered with this facet to find translations for
    its argument.
    */
    static phrases: Facet<{
        [key: string]: string;
    }, readonly {
        [key: string]: string;
    }[]>;
    /**
    Look up a translation for the given phrase (via the
    [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
    original string if no translation is found.
    
    If additional arguments are passed, they will be inserted in
    place of markers like `$1` (for the first value) and `$2`, etc.
    A single `$` is equivalent to `$1`, and `$$` will produce a
    literal dollar sign.
    */
    phrase(phrase: string, ...insert: any[]): string;
    /**
    A facet used to register [language
    data](https://codemirror.net/6/docs/ref/#state.EditorState.languageDataAt) providers.
    */
    static languageData: Facet<(state: EditorState, pos: number, side: 0 | 1 | -1) => readonly {
        [name: string]: any;
    }[], readonly ((state: EditorState, pos: number, side: 0 | 1 | -1) => readonly {
        [name: string]: any;
    }[])[]>;
    /**
    Find the values for a given language data field, provided by the
    the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
    
    Examples of language data fields are...
    
    - [`"commentTokens"`](https://codemirror.net/6/docs/ref/#commands.CommentTokens) for specifying
      comment syntax.
    - [`"autocomplete"`](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion^config.override)
      for providing language-specific completion sources.
    - [`"wordChars"`](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) for adding
      characters that should be considered part of words in this
      language.
    - [`"closeBrackets"`](https://codemirror.net/6/docs/ref/#autocomplete.CloseBracketConfig) controls
      bracket closing behavior.
    */
    languageDataAt<T>(name: string, pos: number, side?: -1 | 0 | 1): readonly T[];
    /**
    Return a function that can categorize strings (expected to
    represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak))
    into one of:
    
     - Word (contains an alphanumeric character or a character
       explicitly listed in the local language's `"wordChars"`
       language data, which should be a string)
     - Space (contains only whitespace)
     - Other (anything else)
    */
    charCategorizer(at: number): (char: string) => CharCategory;
    /**
    Find the word at the given position, meaning the range
    containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
    around it. If no word characters are adjacent to the position,
    this returns null.
    */
    wordAt(pos: number): SelectionRange | null;
    /**
    Facet used to register change filters, which are called for each
    transaction (unless explicitly
    [disabled](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter)), and can suppress
    part of the transaction's changes.
    
    Such a function can return `true` to indicate that it doesn't
    want to do anything, `false` to completely stop the changes in
    the transaction, or a set of ranges in which changes should be
    suppressed. Such ranges are represented as an array of numbers,
    with each pair of two numbers indicating the start and end of a
    range. So for example `[10, 20, 100, 110]` suppresses changes
    between 10 and 20, and between 100 and 110.
    */
    static changeFilter: Facet<(tr: Transaction) => boolean | readonly number[], readonly ((tr: Transaction) => boolean | readonly number[])[]>;
    /**
    Facet used to register a hook that gets a chance to update or
    replace transaction specs before they are applied. This will
    only be applied for transactions that don't have
    [`filter`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter) set to `false`. You
    can either return a single transaction spec (possibly the input
    transaction), or an array of specs (which will be combined in
    the same way as the arguments to
    [`EditorState.update`](https://codemirror.net/6/docs/ref/#state.EditorState.update)).
    
    When possible, it is recommended to avoid accessing
    [`Transaction.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state) in a filter,
    since it will force creation of a state that will then be
    discarded again, if the transaction is actually filtered.
    
    (This functionality should be used with care. Indiscriminately
    modifying transaction is likely to break something or degrade
    the user experience.)
    */
    static transactionFilter: Facet<(tr: Transaction) => TransactionSpec | readonly TransactionSpec[], readonly ((tr: Transaction) => TransactionSpec | readonly TransactionSpec[])[]>;
    /**
    This is a more limited form of
    [`transactionFilter`](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter),
    which can only add
    [annotations](https://codemirror.net/6/docs/ref/#state.TransactionSpec.annotations) and
    [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects). _But_, this type
    of filter runs even if the transaction has disabled regular
    [filtering](https://codemirror.net/6/docs/ref/#state.TransactionSpec.filter), making it suitable
    for effects that don't need to touch the changes or selection,
    but do want to process every transaction.
    
    Extenders run _after_ filters, when both are present.
    */
    static transactionExtender: Facet<(tr: Transaction) => Pick<TransactionSpec, "effects" | "annotations"> | null, readonly ((tr: Transaction) => Pick<TransactionSpec, "effects" | "annotations"> | null)[]>;
}

declare type CollabConfig = {
    /**
    The starting document version. Defaults to 0.
    */
    startVersion?: number;
    /**
    This client's identifying [ID](https://codemirror.net/6/docs/ref/#collab.getClientID). Will be a
    randomly generated string if not provided.
    */
    clientID?: string;
    /**
    It is possible to share information other than document changes
    through this extension. If you provide this option, your
    function will be called on each transaction, and the effects it
    returns will be sent to the server, much like changes are. Such
    effects are automatically remapped when conflicting remote
    changes come in.
    */
    sharedEffects?: (tr: Transaction) => readonly StateEffect<any>[];
};
/**
Create an instance of the collaborative editing plugin.
*/
declare function collab(config?: CollabConfig): Extension;

export { Annotation$5 as Annotation, Compartment, Decoration$3 as Decoration, EditorSelection$5 as EditorSelection, EditorState$5 as EditorState, EditorView$3 as EditorView, Facet$5 as Facet, HighlightStyle, NodeProp$2 as NodeProp, PostgreSQL, SelectionRange$5 as SelectionRange, StateEffect$5 as StateEffect, StateField$5 as StateField, Text$5 as Text, Transaction$5 as Transaction, TreeCursor$2 as TreeCursor, ViewPlugin$3 as ViewPlugin, ViewUpdate$3 as ViewUpdate, WidgetType$3 as WidgetType, index_d as autocomplete, bracketMatching, closeBrackets, closeBracketsKeymap, collab, combineConfig, completionKeymap, css, cssLanguage, defaultHighlightStyle, defaultKeymap, drawSelection, foldGutter, foldKeymap, highlightSelectionMatches, highlightSpecialChars, history, historyKeymap, html, htmlLanguage, indentLess, indentMore, indentOnInput, indentUnit, javascript, javascriptLanguage, julia as julia_andrey, keymap, lineNumbers, markdown, markdownLanguage, parseCode, parseMixed, placeholder, python, pythonLanguage, rectangularSelection, searchKeymap, selectNextOccurrence, sql, syntaxHighlighting, syntaxTree, syntaxTreeAvailable, tags };
