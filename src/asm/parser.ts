import {AddInstr, Immediate, Register} from './ast';
import {EvalAdd} from './eval';

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

// type

type ParseAddIInstr<T> =
  T extends `ADD ${infer Rd extends Register}, ${infer Rn extends Register}, #${infer imm extends Immediate}`
    ? {type: 'AddI'; Rd: Rd; Rn: Rn; imm: imm}
    : never;

type ParseAddRInstr<T> =
  T extends `ADD ${infer Rd extends Register}, ${infer Rn extends Register}, ${infer Rm extends Register}`
    ? {type: 'AddR'; Rd: Rd; Rn: Rn; Rm: Rm}
    : never;

type ParseSubIInstr<T> =
  T extends `SUB ${infer Rd extends Register}, ${infer Rn extends Register}, #${infer imm extends Immediate}`
    ? {type: 'SubI'; Rd: Rd; Rn: Rn; imm: imm}
    : never;

type ParseSubRInstr<T> =
  T extends `SUB ${infer Rd extends Register}, ${infer Rn extends Register}, ${infer Rm extends Register}`
    ? {type: 'SubR'; Rd: Rd; Rn: Rn; Rm: Rm}
    : never;

type ParseMovIInstr<T> =
  T extends `MOV ${infer Rd extends Register}, #${infer imm extends Immediate}`
    ? {type: 'MovI'; Rd: Rd; imm: imm}
    : never;

type ParseMovRInstr<T> =
  T extends `MOV ${infer Rd extends Register}, ${infer Rm extends Register}`
    ? {type: 'MovR'; Rd: Rd; Rm: Rm}
    : never;

type ParseInstr<T> =
  | ParseAddIInstr<T>
  | ParseAddRInstr<T>
  | ParseSubIInstr<T>
  | ParseSubRInstr<T>
  | ParseMovIInstr<T>
  | ParseMovRInstr<T>;

type ParseLine<T> = ParseInstr<TrimSpace<T>>;

type ParseLoop<T extends any[], Idx = '00000000'> = T extends [
  infer Cur,
  ...infer Rest,
]
  ? [ParseLine<Cur> & {idx: Idx}, ...ParseLoop<Rest, EvalAdd<Idx, '00000001'>['result']>]
  : [];

export type ParseProgram<T> = SplitLines<Trim<T>> extends infer R extends any[]
  ? ParseLoop<R>
  : never;

type Test = ParseProgram<`
  ADD r0, r1, r2
  ADD r0, r1, r2
`>;
