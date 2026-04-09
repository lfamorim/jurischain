'use strict';

/**
 * Returns a Promise that resolves with the PoW solution string
 * once the JurisChain WASM solver completes the challenge.
 *
 * @param {Object}  options
 * @param {string}  options.seed       - Random seed for the challenge
 * @param {number}  options.difficulty  - Difficulty level (1–255)
 * @param {number}  [options.timeout]  - Optional timeout in ms (0 = no timeout)
 * @returns {Promise<string>} The hex-encoded solution hash
 *
 * @example
 *   const solution = await solveJurischain({ seed: 'abc123', difficulty: 10 });
 *   console.log('Solved:', solution);
 */
function solveJurischain({ seed, difficulty, timeout = 0 } = {}) {
  if (typeof seed !== 'string' || seed.length === 0) {
    return Promise.reject(new TypeError('seed must be a non-empty string'));
  }

  const diff = Number(difficulty);
  if (!Number.isInteger(diff) || diff < 1 || diff > 255) {
    return Promise.reject(new RangeError('difficulty must be an integer between 1 and 255'));
  }

  window.jurischain = Object.freeze({
    seed,
    difficulty: String(diff),
  });

  return new Promise((resolve, reject) => {
    let settled = false;
    let timerId;

    const onSolved = (event) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(event.detail);
    };

    const cleanup = () => {
      document.removeEventListener('jurischain', onSolved);
      if (timerId) clearTimeout(timerId);
    };

    document.addEventListener('jurischain', onSolved, { once: true });

    if (timeout > 0) {
      timerId = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error(`JurisChain solver timed out after ${timeout}ms`));
      }, timeout);
    }

    const script = document.createElement('script');
    script.src = './dist/jurischain.js';
    script.onerror = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('Failed to load JurisChain WASM solver'));
    };
    document.body.appendChild(script);
  });
}

// UMD export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { solveJurischain };
} else {
  window.solveJurischain = solveJurischain;
}
