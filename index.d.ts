interface SolveOptions {
  /** Random seed for the challenge */
  seed: string;
  /** Difficulty level (1–255) */
  difficulty: number;
  /** Optional timeout in milliseconds (0 = no timeout) */
  timeout?: number;
}

/**
 * Solves a JurisChain SHA3-256 Proof-of-Work challenge.
 * Returns the hex-encoded solution hash (64 characters).
 *
 * @example
 * ```html
 * <script src="node_modules/@credithub/jurischain/dist/jurischain-bundle.js"></script>
 * <script>
 *   solveJurischain({ seed: 'abc123', difficulty: 10, timeout: 5000 })
 *     .then(solution => console.log(solution));
 * </script>
 * ```
 */
declare function solveJurischain(options: SolveOptions): Promise<string>;
