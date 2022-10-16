import {Lex, Token} from './lexer';
import {Overwrite, Signature} from './utils';

type Length<T extends any[]> = T extends {length: infer L} ? L : never;
type BuildTuple<L extends number, T extends any[] = []> = T extends {length: L}
  ? T
  : BuildTuple<L, [...T, any]>;
type Add<A extends number, B extends number> = Length<
  [...BuildTuple<A>, ...BuildTuple<B>]
>;
type Subtract<A extends number, B extends number> = BuildTuple<A> extends [
  ...infer U,
  ...BuildTuple<B>,
]
  ? Length<U>
  : never;

type MultiAdd<
  N extends number,
  A extends number,
  I extends number,
> = I extends 0 ? A : MultiAdd<N, Add<N, A>, Subtract<I, 1>>;

type EQ<A, B> = A extends B ? (B extends A ? true : false) : false;
type AtTerminus<A extends number, B extends number> = A extends 0
  ? true
  : B extends 0
  ? true
  : false;
type LT<A extends number, B extends number> = AtTerminus<A, B> extends true
  ? EQ<A, B> extends true
    ? false
    : A extends 0
    ? true
    : false
  : LT<Subtract<A, 1>, Subtract<B, 1>>;

type MultiSub<N extends number, D extends number, Q extends number> = LT<
  N,
  D
> extends true
  ? Q
  : MultiSub<Subtract<N, D>, D, Add<Q, 1>>;

type Multiply<A extends number, B extends number> = MultiAdd<A, 0, B>;
type Divide<A extends number, B extends number> = MultiSub<A, B, 0>;

type Primary<
  INPUT extends Token[],
  CUR extends number,
> = INPUT[CUR] extends infer R extends {
  type: 'number' | 'identifier';
}
  ? [Add<CUR, 1>, R]
  : never;

type MulDivLoop<
  INPUT extends Token[],
  CUR extends number,
  EXPR extends any,
> = INPUT[CUR]['type'] extends '*' | '/'
  ? Primary<INPUT, Add<CUR, 1>> extends infer B extends [number, any]
    ? MulDivLoop<
        INPUT,
        B[0],
        {
          type: 'binary';
          op: INPUT[CUR]['type'];
          left: EXPR;
          right: B[1];
        }
      >
    : never
  : [CUR, EXPR];

type MulDiv<INPUT extends Token[], CUR extends number> = Primary<
  INPUT,
  CUR
> extends infer A extends [number, any]
  ? MulDivLoop<INPUT, A[0], A[1]>
  : never;

type AddSubLoop<
  INPUT extends Token[],
  CUR extends number,
  EXPR extends any,
> = INPUT[CUR]['type'] extends '+' | '-'
  ? MulDiv<INPUT, Add<CUR, 1>> extends infer B extends [number, any]
    ? AddSubLoop<
        INPUT,
        B[0],
        {
          type: 'binary';
          op: INPUT[CUR]['type'];
          left: EXPR;
          right: B[1];
        }
      >
    : never
  : [CUR, EXPR];

type AddSub<INPUT extends Token[], CUR extends number> = MulDiv<
  INPUT,
  CUR
> extends infer A extends [number, any]
  ? AddSubLoop<INPUT, A[0], A[1]>
  : never;

type Expr<INPUT extends Token[], CUR extends number> = AddSub<
  INPUT,
  CUR
> extends infer R extends [number, any] // had to add this for optimalization for some reason
  ? R
  : never;

type ExprStmt<INPUT extends Token[], CUR extends number> = Expr<
  INPUT,
  CUR
> extends infer R extends [number, any]
  ? INPUT[R[0]] extends {type: 'newline'}
    ? [Add<R[0], 1>, {type: 'exprstmt'; expr: R[1]}]
    : never
  : never;

type AssignmentStmt<INPUT extends Token[], CUR extends number> = Expr<
  INPUT,
  Add<CUR, 2>
> extends infer R extends [number, any]
  ? INPUT[R[0]] extends {type: 'newline'}
    ? [
        Add<R[0], 1>,
        {
          type: 'assignment';
          name: INPUT[CUR]['val'];
          expr: R[1];
        },
      ]
    : never
  : never;

type Stmt<INPUT extends Token[], CUR extends number> = INPUT[Add<
  CUR,
  1
>] extends {
  type: '=';
}
  ? INPUT[CUR] extends {type: 'identifier'}
    ? AssignmentStmt<INPUT, CUR>
    : never
  : ExprStmt<INPUT, CUR>;

type Parse<
  INPUT extends Token[],
  CUR extends number,
> = INPUT[CUR] extends undefined
  ? []
  : Stmt<INPUT, CUR> extends infer R extends [number, any]
  ? [R[1], ...Parse<INPUT, R[0]>]
  : never;

// type Lex2<T extends string> = Lex<T>

// type A = Parse<
//   [
//     ...Lex<`
//       a = 5
//     `>,
//     {type: 'newline'; val: '\n'},
//   ],
//   0
// >;

type EvalExpr<CTX extends Record<string, any>, EXPR_NODE> = EXPR_NODE extends {
  type: 'number';
  val: infer R;
}
  ? R
  : EXPR_NODE extends {
      type: 'identifier';
      val: infer R extends keyof CTX;
    }
  ? CTX[R]
  : EXPR_NODE extends {
      type: 'binary';
      left: infer LEFT;
      right: infer RIGHT;
      op: infer OP;
    }
  ? OP extends '+'
    ? [EvalExpr<CTX, LEFT>, EvalExpr<CTX, RIGHT>] extends [
        infer E_LEFT extends number,
        infer E_RIGHT extends number,
      ]
      ? Add<E_LEFT, E_RIGHT>
      : never
    : never
  : never;

type EvalStmt<CTX extends Record<string, any>, STMT_NODE> = STMT_NODE extends {
  type: 'assignment';
  name: infer NAME extends string;
  expr: infer EXPR;
}
  ? Overwrite<CTX, {[K in NAME]: EvalExpr<CTX, EXPR>}>
  : never;

type EvalLoop<
  AST extends any[],
  CTX extends Record<string, any> = {},
> = AST extends [infer STMT_NODE, ...infer REST]
  ? EvalStmt<CTX, STMT_NODE> extends infer R extends Record<string, any>
    ? EvalLoop<REST, R>
    : never
  : CTX;

// type X = Stmt<
//   Lex<`
//     x = 5
//   `>
// >;

// type Parse<LEXED extends Token[]> = Stmt<LEXED>;

type ABC = Signature<
  EvalLoop<
    Parse<
      Lex<`
        y = 4
        x = y + 2
        y = y + x
        y = y + 1
      `>,
      0
    >
  >
>;

/*
def atom(input, cur):
  x = input[cur]
  cur +=1
  return x, cur

def mulLoop(input, cur, expr):
  if cur < len(input) and (input[cur] == '*' or input[cur] == '/'):
    op = input[cur]
    cur += 1
    right, cur = atom(input, cur)
    return mulLoop(input, cur, {"left": expr, "op": op, "right": right})
  return expr, cur

def mul(input, cur):
  expr, cur = atom(input, cur)

  expr, cur = mulLoop(input, cur, expr)
  
  return expr, cur

def addLoop(input, cur, expr):
  if cur < len(input) and (input[cur] == '+' or input[cur] == '-'):
    op = input[cur]
    cur += 1
    right, cur = mul(input, cur)
    return addLoop(input, cur, {"left": expr, "op": op, "right": right})
  return expr, cur
    

def add(input, cur):
  expr, cur = mul(input, cur)

  expr, cur = addLoop(input, cur, expr)
  
  return expr, cur

print(add(['a', '-', 'b', '*', 'c'], 0))
*/
