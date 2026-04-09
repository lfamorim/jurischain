
/**
 * Promise API for JurisChain PoW — bundled version.
 * This file is concatenated AFTER the modularized ASM.js output
 * inside an IIFE by the build system. _JurischainASM is available
 * in the same closure scope.
 *
 * @param {Object}  options
 * @param {string}  options.seed       - Random seed for the challenge
 * @param {number}  options.difficulty  - Difficulty level (1-255)
 * @param {number}  [options.timeout]  - Optional timeout in ms (0 = no timeout)
 * @returns {Promise<string>} The hex-encoded solution hash
 */
function solveJurischain(options) {
  var opts = options || {};
  var seed = opts.seed;
  var difficulty = opts.difficulty;
  var timeout = opts.timeout || 0;

  if (typeof seed !== 'string' || seed.length === 0) {
    return Promise.reject(new TypeError('seed must be a non-empty string'));
  }

  var diff = Number(difficulty);
  if (!Number.isInteger(diff) || diff < 1 || diff > 255) {
    return Promise.reject(new RangeError('difficulty must be an integer between 1 and 255'));
  }

  window.jurischain = Object.freeze({
    seed: seed,
    difficulty: String(diff),
  });

  return new Promise(function (resolve, reject) {
    var settled = false;
    var timerId;

    function onSolved(event) {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(event.detail);
    }

    function cleanup() {
      document.removeEventListener('jurischain', onSolved);
      if (timerId) clearTimeout(timerId);
    }

    document.addEventListener('jurischain', onSolved, { once: true });

    if (timeout > 0) {
      timerId = setTimeout(function () {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error('JurisChain solver timed out after ' + timeout + 'ms'));
      }, timeout);
    }

    try {
      _JurischainASM().catch(function (err) {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error('Failed to initialize JurisChain ASM module: ' + err.message));
      });
    } catch (err) {
      if (!settled) {
        settled = true;
        cleanup();
        reject(new Error('Failed to start JurisChain ASM module: ' + err.message));
      }
    }
  });
}

window.solveJurischain = solveJurischain;
