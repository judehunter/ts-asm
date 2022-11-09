// type SpaceOrNewLine = ' ' | '\n';

// type TrimLeft<T extends string> =
//   T extends `${SpaceOrNewLine}${infer R extends string}` ? TrimLeft<R> : T;
// type TrimRight<T extends string> =
//   T extends `${infer R extends string}${SpaceOrNewLine}` ? TrimRight<R> : T;
// type Trim<T extends string> = TrimRight<TrimLeft<T>>;

// type Split<
//   T extends string,
//   SEP extends string,
// > = T extends `${infer LINE extends string}${SEP}${infer REST extends string}`
//   ? [LINE, ...Split<REST, SEP>]
//   : [T];

// type SplitLines<T extends string> = Split<T, '\n'>;

// type Letter =
//   | 'a'
//   | 'A'
//   | 'b'
//   | 'B'
//   | 'c'
//   | 'C'
//   | 'd'
//   | 'D'
//   | 'e'
//   | 'E'
//   | 'f'
//   | 'F'
//   | 'g'
//   | 'G'
//   | 'h'
//   | 'H'
//   | 'i'
//   | 'I'
//   | 'j'
//   | 'J'
//   | 'k'
//   | 'K'
//   | 'l'
//   | 'L'
//   | 'm'
//   | 'M'
//   | 'n'
//   | 'N'
//   | 'o'
//   | 'O'
//   | 'p'
//   | 'P'
//   | 'q'
//   | 'Q'
//   | 'r'
//   | 'R'
//   | 's'
//   | 'S'
//   | 't'
//   | 'T'
//   | 'u'
//   | 'U'
//   | 'v'
//   | 'V'
//   | 'w'
//   | 'W'
//   | 'x'
//   | 'X'
//   | 'y'
//   | 'Y'
//   | 'z'
//   | 'Z';

// type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// type Operator = '+' | '-' | '*' | '/' | '(' | ')' | ',' | '=';
// type Keyword = 'fn' | 'endfn' | 'let';

// type LexWordLoop<T extends string> =
//   T extends `${infer A extends Letter}${infer REST extends string}`
//     ? `${A}${LexWordLoop<REST>}`
//     : '';
// type TryLexWord<T extends string> = LexWordLoop<T> extends ''
//   ? never
//   : {type: 'identifier'; val: LexWordLoop<T>};

// type TryLexKeywordOrIdentifier<T extends string> =
//   TryLexWord<T>['val'] extends infer R extends Keyword
//     ? {type: R; val: R}
//     : TryLexWord<T>;

// type LexNumberLoop<T extends string> =
//   T extends `${infer A extends Digit}${infer REST extends string}`
//     ? `${A}${LexWordLoop<REST>}`
//     : '';

// type ParseNumber<T> = T extends `${infer R extends number}` ? R : never;
// type TryLexNumber<T extends string> = LexNumberLoop<T> extends ''
//   ? never
//   : {type: 'number'; val: ParseNumber<LexNumberLoop<T>>};

// type LexOperator<T extends string> =
//   T extends `${infer A extends Operator}${string}` ? A : '';
// type TryLexOperator<T extends string> = LexOperator<T> extends ''
//   ? never
//   : {
//       type: LexOperator<T>;
//       val: LexOperator<T>;
//     };

// type LexSpace<T extends string> =
//   T extends `${infer A extends ' '}${infer REST extends string}`
//     ? `${A}${LexSpace<REST>}`
//     : '';

// type TryLexSpace<T extends string> = LexSpace<T> extends ''
//   ? never
//   : LexSpace<T>;

// type LexNewLine<T extends string> =
//   T extends `${infer A extends '\n'}${infer REST extends string}`
//     ? `${A}${LexNewLine<REST>}`
//     : '';

// type TryLexNewLine<T extends string> = LexNewLine<T> extends ''
//   ? never
//   : LexNewLine<T>;

// type LexCurrent<T extends string> =
//   T extends `${infer R extends TryLexKeywordOrIdentifier<T>['val']}${string}`
//     ? [
//         TryLexKeywordOrIdentifier<T>,
//         ...(T extends `${R}${infer REST}` ? LexCurrent<REST> : never),
//       ]
//     : T extends `${infer R extends TryLexOperator<T>['val']}${string}`
//     ? [
//         TryLexOperator<T>,
//         ...(T extends `${R}${infer REST}` ? LexCurrent<REST> : never),
//       ]
//     : T extends `${infer R extends TryLexNumber<T>['val']}${string}`
//     ? [
//         TryLexNumber<T>,
//         ...(T extends `${R}${infer REST}` ? LexCurrent<REST> : never),
//       ]
//     : T extends `${infer R extends TryLexSpace<T>}${string}`
//     ? [...(T extends `${R}${infer REST}` ? LexCurrent<REST> : never)]
//     : T extends `${infer R extends TryLexNewLine<T>}${string}`
//     ? [
//         {type: 'newline'; val: '\n'},
//         ...(T extends `${R}${infer REST}` ? LexCurrent<REST> : never),
//       ]
//     : [];

// // type LexLine<T extends string> = LexCurrent<T>;

// export type Lex<T extends string> = [
//   ...(Trim<T> extends infer R extends string ? LexCurrent<R> : never),
//   {type: 'newline'; val: '\n'},
// ];

// type Test = Lex<`
//   a
//   a
//   a
//   a
//   a
//   a
//   a
//   a
//   a
//   a
//   a
//   a
//   a
//   a
//   a
//   a
// `>;

// export type Token = {type: any; val: any};
