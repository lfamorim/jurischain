export interface SolveOptions {
  /** Random seed for the challenge */
  seed: string;
  /** Difficulty level (1–255) */
  difficulty: number;
  /** Optional timeout in milliseconds (0 = no timeout) */
  timeout?: number;
}

export interface JurischainState {
  /** The seed used for the current challenge */
  readonly seed: string;
  /** The difficulty level as a string */
  readonly difficulty: string;
}

/**
 * Solves a JurisChain SHA3-256 Proof-of-Work challenge.
 * Returns the hex-encoded solution hash (64 uppercase hex characters).
 *
 * @throws {TypeError}  If `seed` is not a non-empty string.
 * @throws {RangeError} If `difficulty` is not an integer between 1 and 255.
 * @throws {Error}      If the solver times out or fails to initialize.
 *
 * @example
 * ```ts
 * // Via <script> tag (global)
 * const hash = await solveJurischain({ seed: 'abc123', difficulty: 10, timeout: 5000 });
 * console.log(hash); // "A1B2C3..." (64 hex chars)
 * ```
 */
export declare function solveJurischain(options: SolveOptions): Promise<string>;

// ── Global declarations (when loaded via <script> tag) ──────────────

declare global {
  function solveJurischain(options: SolveOptions): Promise<string>;

  interface Window {
    /** Current challenge state, set by solveJurischain() before solving. */
    jurischain: JurischainState;
    /** Global solver function, available after loading the bundle. */
    solveJurischain: typeof solveJurischain;
  }

  interface DocumentEventMap {
    /**
     * Fired when the PoW solver finds a valid solution.
     * `event.detail` contains the 64-char hex hash.
     */
    jurischain: CustomEvent<string>;
  }
}
