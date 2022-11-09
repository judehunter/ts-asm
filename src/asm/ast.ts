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

export type AddInstr = {
  Rd: Register;
  Rn: Register;
} & ({imm: Immediate} | {Rm: Register});

export type MovInstr = {
  Rd: Register;
} & ({imm: Immediate} | {Rm: Register})
