export interface SolveOptions {
  seed: string;
  difficulty: number;
  timeout?: number;
}

export declare function solveJurischain(options: SolveOptions): Promise<string>;
