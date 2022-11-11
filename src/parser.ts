import {
  AddIInstr,
  Immediate,
  Register,
  AddRInstr,
  SubIInstr,
  SubRInstr,
  MovIInstr,
  MovRInstr,
  LabelInstr,
  _BranchInstr,
  _BranchIfZeroInstr,
  _BranchIfNotZeroInstr,
  _BranchLinkInstr,
  Indexed,
  _BranchIf,
  BranchLinkInstr,
  BranchIf,
  PushInstr,
  PopInstr,
  StrIInstr,
  StrRInstr,
  LdrIInstr,
  LdrRInstr,
} from './ast';
import {EvalAdd} from './eval';
import {Signature} from './utils';

type TrimLeftSpace<T> = T extends ` ${infer R}` ? TrimLeftSpace<R> : T;
type TrimRightSpace<T> = T extends `${infer R} ` ? TrimRightSpace<R> : T;
type TrimSpace<T> = TrimRightSpace<TrimLeftSpace<T>>;

type TrimLeft<T> = T extends `${' ' | '\n'}${infer R}` ? TrimLeft<R> : T;
type TrimRight<T> = T extends `${infer R}${' ' | '\n'}` ? TrimRight<R> : T;
type Trim<T> = TrimRight<TrimLeft<T>>;

type Split<T, SEP extends string> = T extends `${infer LINE}${SEP}${infer REST}`
  ? [LINE, ...Split<REST, SEP>]
  : [T];

type SplitLines<T> = Split<T, '\n'>;

type ParseAddIInstr<T> =
  T extends `ADD ${infer Rd extends Register}, ${infer Rn extends Register}, #${infer imm extends Immediate}`
    ? AddIInstr<Rd, Rn, imm>
    : never;

type ParseAddRInstr<T> =
  T extends `ADD ${infer Rd extends Register}, ${infer Rn extends Register}, ${infer Rm extends Register}`
    ? AddRInstr<Rd, Rn, Rm>
    : never;

type ParseSubIInstr<T> =
  T extends `SUB ${infer Rd extends Register}, ${infer Rn extends Register}, #${infer imm extends Immediate}`
    ? SubIInstr<Rd, Rn, imm>
    : never;

type ParseSubRInstr<T> =
  T extends `SUB ${infer Rd extends Register}, ${infer Rn extends Register}, ${infer Rm extends Register}`
    ? SubRInstr<Rd, Rn, Rm>
    : never;

type ParseMovIInstr<T> =
  T extends `MOV ${infer Rd extends Register}, #${infer imm extends Immediate}`
    ? MovIInstr<Rd, imm>
    : never;

type ParseMovRInstr<T> =
  T extends `MOV ${infer Rd extends Register}, ${infer Rm extends Register}`
    ? MovRInstr<Rd, Rm>
    : never;

type ParseLabel<T> = T extends `${infer name extends string}:`
  ? LabelInstr<name>
  : never;

type ParseBranch<T> = T extends `B ${infer label extends string}`
  ? _BranchInstr<label>
  : never;

type ParseBranchIfZero<T> =
  T extends `CBZ ${infer Rn extends Register}, ${infer label extends string}`
    ? _BranchIfZeroInstr<Rn, label>
    : never;

type ParseBranchIfNotZero<T> =
  T extends `CBNZ ${infer Rn extends Register}, ${infer label extends string}`
    ? _BranchIfNotZeroInstr<Rn, label>
    : never;

type ParseBranchLink<T> = T extends `BL ${infer label extends string}`
  ? _BranchLinkInstr<label>
  : never;

type ParseBranchR<T> = T extends `BR ${infer Rm extends Register}`
  ? MovRInstr<'pc', Rm>
  : never;

type ParsePush<T> = T extends `PUSH {${infer Rm extends Register}}`
  ? PushInstr<Rm>
  : never;

type ParsePop<T> = T extends `POP {${infer Rm extends Register}}`
  ? PopInstr<Rm>
  : never;

type ParseStrInstr<T> =
  T extends `STR ${infer Rt extends Register}, [${infer address extends string}]`
    ? address extends `${infer Rn extends Register}`
      ? StrIInstr<Rt, Rn, '00000000'>
      : address extends `${infer Rn extends Register}, #${infer imm extends Immediate}`
      ? StrIInstr<Rt, Rn, imm>
      : address extends `${infer Rn extends Register}, ${infer Rm extends Register}`
      ? StrRInstr<Rt, Rn, Rm>
      : never
    : never;

type ParseLdrInstr<T> =
  T extends `LDR ${infer Rt extends Register}, [${infer address extends string}]`
    ? address extends `${infer Rn extends Register}`
      ? LdrIInstr<Rt, Rn, '00000000'>
      : address extends `${infer Rn extends Register}, #${infer imm extends Immediate}`
      ? LdrIInstr<Rt, Rn, imm>
      : address extends `${infer Rn extends Register}, ${infer Rm extends Register}`
      ? LdrRInstr<Rt, Rn, Rm>
      : never
    : never;

type ParseInstr<T> =
  | ParseAddIInstr<T>
  | ParseAddRInstr<T>
  | ParseSubIInstr<T>
  | ParseSubRInstr<T>
  | ParseMovIInstr<T>
  | ParseMovRInstr<T>
  | ParseLabel<T>
  | ParseBranch<T>
  | ParseBranchIfZero<T>
  | ParseBranchLink<T>
  | ParseBranchR<T>
  | ParseBranchIfNotZero<T>
  | ParsePush<T>
  | ParsePop<T>
  | ParseStrInstr<T>
  | ParseLdrInstr<T>;

type ParseLine<T> = ParseInstr<TrimSpace<T>>;

type ParseLoop<T extends any[], idx extends string = '00000000'> = T extends [
  infer Cur,
  ...infer Rest,
]
  ? [
      Indexed<ParseLine<Cur>, idx>,
      ...ParseLoop<Rest, EvalAdd<idx, '00000001'>['result']>,
    ]
  : [];

export type ParseProgram<T> = SplitLines<Trim<T>> extends infer R extends any[]
  ? ParseLoop<R>
  : never;

type Find<Instrs, Name> = {
  [K in keyof Instrs]: Instrs[K] extends {
    type: 'Label';
    name: Name;
    idx: string;
  }
    ? Instrs[K]
    : never;
};

type Clean<Arr> = {
  [K in keyof Arr as K extends number ? K : never]: Arr[K];
}[any];

type FindLabel<Instrs, PC> = Clean<Find<Instrs, PC>>;

export type ResolveLabels<Instrs> = {
  [K in keyof Instrs]: Instrs[K] extends Indexed<
    _BranchInstr<infer label>,
    infer idx
  >
    ? Indexed<MovIInstr<'pc', FindLabel<Instrs, label>['idx']>, idx>
    : // else if
    Instrs[K] extends Indexed<_BranchLinkInstr<infer label>, infer idx>
    ? Indexed<BranchLinkInstr<FindLabel<Instrs, label>['idx']>, idx>
    : // else if
    Instrs[K] extends Indexed<
        _BranchIf<
          infer type extends 'BranchIfZero' | 'BranchIfNotZero',
          infer Rn,
          infer label
        >,
        infer idx
      >
    ? Indexed<BranchIf<type, Rn, FindLabel<Instrs, label>['idx']>, idx>
    : // else
      Instrs[K];
};

type Test = Signature<
  ParseProgram<`
    MOV r0, #00000110
  `>
>;
