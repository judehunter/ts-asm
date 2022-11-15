import {InterpretProgram} from '..';
import {Signature} from '../utils';

// type Test = InterpretProgram<`
`
  B main
  sum_fibonacci:
    PUSH {lr}
    MOV r1, #00000000
  sum_fibonacci_loop:
    CBZ r0, sum_fibonacci_exit

    SUB r0, r0, #00000001
    BL fibonacci
  sum_fibonacci_exit:
    POP {pc}
  fibonacci:
    PUSH {lr}
    SUB r1, r0, #00000001
    CBZ r1, fibonacci_base_case
    SUB r1, r0, #00000010
    CBZ r1, fibonacci_base_case

    POP {pc}
  fibonacci_base_case:
    MOV r0, #00000001

  main:
    MOV r0, #00000100
    BL sum_fibonacci
`;
// `>;

type Program = InterpretProgram<`
  B main
  fibonacci:
    PUSH {lr}
    MOV r4, r0
    SUB r1, r0, #00000001
    CBZ r1, fibonacci_base_case
    SUB r1, r0, #00000010
    CBZ r1, fibonacci_base_case
    SUB r0, r4, #00000001
    PUSH {r4}
    BL fibonacci
    POP {r4}
    MOV r2, r0
    SUB r0, r4, #00000010
    PUSH {r4}
    PUSH {r2}
    BL fibonacci
    POP {r2}
    POP {r4}
    MOV r3, r0
    ADD r0, r2, r3
    POP {pc}
  fibonacci_base_case:
    MOV r0, #00000001
    POP {pc}
  main:
    MOV r0, #00001000
    BL fibonacci
`>;

type r0 = Program['registers']['r0'];
//   ^?






// type r1 = Test['registers']['r1'];
// //   ^?
// type r2 = Test['registers']['r2'];
// //   ^?
// type r3 = Test['registers']['r3'];
// //   ^?
// // type r4 = Test['registers']['r4'];
// // //   ^?
// type r4 = Test['registers']['r4'];
// //   ^?
// type mem = Signature<Test['memory']>;
//   ^?
