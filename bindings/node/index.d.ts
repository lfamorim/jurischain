declare class Jurischain {
  constructor(difficulty: number, seed: string);
  challengeResponse(response: string): boolean;
  readChallenge(): string;
  solveStep(): boolean;
  verify(): boolean;
}

export { Jurischain };
export default Jurischain;