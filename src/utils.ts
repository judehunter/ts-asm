type Signature<T> = T extends Record<any, any>
  ? {[K in keyof T]: Signature<T[K]>}
  : T;

  
type Tail<T extends any[]> = T extends [any, ...infer U] ? U : never;
// type TailN<T extends any[], N extends number> = N extends 0
//   ? T
//   : TailN<Tail<T>, Subtract<N, 1>>;