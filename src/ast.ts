export type Register =
  | 'r0'
  | 'r1'
  | 'r2'
  | 'r3'
  | 'r4'
  | 'r5'
  | 'r6'
  | 'r7'
  | 'sp'
  | 'lr'
  | 'pc';

export type Immediate = string;

export type AddIInstr<
  Rd extends Register,
  Rn extends Register,
  imm extends Immediate,
> = {
  type: 'AddI';
  Rd: Rd;
  Rn: Rn;
  imm: imm;
};

export type AddRInstr<
  Rd extends Register,
  Rn extends Register,
  Rm extends Register,
> = {
  type: 'AddR';
  Rd: Rd;
  Rn: Rn;
  Rm: Rm;
};

export type SubIInstr<
  Rd extends Register,
  Rn extends Register,
  imm extends Immediate,
> = {
  type: 'SubI';
  Rd: Rd;
  Rn: Rn;
  imm: imm;
};

export type SubRInstr<
  Rd extends Register,
  Rn extends Register,
  Rm extends Register,
> = {
  type: 'SubR';
  Rd: Rd;
  Rn: Rn;
  Rm: Rm;
};

export type MovIInstr<Rd extends Register, imm extends Immediate> = {
  type: 'MovI';
  Rd: Rd;
  imm: imm;
};

export type MovRInstr<Rd extends Register, Rm extends Register> = {
  type: 'MovR';
  Rd: Rd;
  Rm: Rm;
};

export type LabelInstr<name extends string> = {
  type: 'Label';
  name: name;
};

export type _BranchInstr<label extends string> = {
  type: 'Branch';
  label: label;
};

export type _BranchIfZeroInstr<Rn extends Register, label extends string> = {
  type: 'BranchIfZero';
  Rn: Rn;
  label: label;
};

export type _BranchIfNotZeroInstr<Rn extends Register, label extends string> = {
  type: 'BranchIfNotZero';
  Rn: Rn;
  label: label;
};

export type _BranchIf<
  type extends 'BranchIfZero' | 'BranchIfNotZero',
  Rn extends Register,
  label extends string,
> = {
  type: type;
  Rn: Rn;
  label: label;
};

export type BranchIf<
  type extends 'BranchIfZero' | 'BranchIfNotZero',
  Rn extends Register,
  address extends string,
> = {
  type: type;
  Rn: Rn;
  address: address;
};

export type _BranchLinkInstr<label extends string> = {
  type: '_BranchLink';
  label: label;
};

export type BranchLinkInstr<address extends string> = {
  type: 'BranchLink';
  address: address;
};

export type PushInstr<Rm extends Register> = {
  type: 'Push';
  Rm: Rm;
};

export type PopInstr<Rm extends Register> = {
  type: 'Pop';
  Rm: Rm;
};

export type StrIInstr<
  Rt extends Register,
  Rn extends Register,
  imm extends Immediate,
> = {
  type: 'StrI';
  Rt: Rt;
  Rn: Rn;
  imm: imm;
};

export type StrRInstr<
  Rt extends Register,
  Rn extends Register,
  Rm extends Register,
> = {
  type: 'StrR';
  Rt: Rt;
  Rn: Rn;
  Rm: Rm;
};

export type LdrIInstr<
  Rt extends Register,
  Rn extends Register,
  imm extends Immediate,
> = {
  type: 'LdrI';
  Rt: Rt;
  Rn: Rn;
  imm: imm;
};

export type LdrRInstr<
  Rt extends Register,
  Rn extends Register,
  Rm extends Register,
> = {
  type: 'LdrR';
  Rt: Rt;
  Rn: Rn;
  Rm: Rm;
};

export type LSLIInstr<
  Rd extends Register,
  Rm extends Register,
  imm extends Immediate,
> = {
  type: 'LslI';
  Rd: Rd;
  Rm: Rm;
  imm: imm;
};

export type LSLRInstr<
  Rd extends Register,
  Rm extends Register,
  Rs extends Register,
> = {
  type: 'LslR';
  Rd: Rd;
  Rm: Rm;
  Rs: Rs;
};
export type LSRIInstr<
  Rd extends Register,
  Rm extends Register,
  imm extends Immediate,
> = {
  type: 'LsrI';
  Rd: Rd;
  Rm: Rm;
  imm: imm;
};

export type LSRRInstr<
  Rd extends Register,
  Rm extends Register,
  Rs extends Register,
> = {
  type: 'LsrR';
  Rd: Rd;
  Rm: Rm;
  Rs: Rs;
};

export type Indexed<T, idx extends string> = T & {idx: idx};

// export type Resolved<T, address extends string> = T &
