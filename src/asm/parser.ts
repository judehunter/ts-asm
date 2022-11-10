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

type ParseLabel<T> = T extends `${infer name extends string}:`
  ? {type: 'Label'; name: name}
  : never;

type ParseBranch<T> = T extends `B ${infer label extends string}`
  ? {type: 'Branch'; label: label}
  : never;

type ParseBranchIfZero<T> =
  T extends `CBZ ${infer Rn extends Register}, ${infer label extends string}`
    ? {type: 'BranchIfZero'; Rn: Rn; label: label}
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
  | ParseBranchIfZero<T>;

type ParseLine<T> = ParseInstr<TrimSpace<T>>;

type ParseLoop<T extends any[], Idx = '00000000'> = T extends [
  infer Cur,
  ...infer Rest,
]
  ? [
      ParseLine<Cur> & {idx: Idx},
      ...ParseLoop<Rest, EvalAdd<Idx, '00000001'>['result']>,
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
  [K in keyof Instrs]: Instrs[K] extends {
    type: 'Branch';
    label: string;
    idx: string;
  }
    ? {
        type: 'MovI';
        Rd: 'pc';
        imm: FindLabel<Instrs, Instrs[K]['label']>['idx'];
        idx: Instrs[K]['idx'];
      }
    : Instrs[K] extends {type: 'BranchIfZero'; label: string; idx: string; Rn: Register}
    ? {
        type: 'BranchIfZero';
        address: FindLabel<Instrs, Instrs[K]['label']>['idx'];
        Rn: Instrs[K]['Rn']
        idx: Instrs[K]['idx'];
      }
    : Instrs[K];
};

type Test = ResolveLabels<
  ParseProgram<`
    ADD r0, r0, #0
    test:
    CBZ r0, test
  `>
>;
