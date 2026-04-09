#include <stdint.h>
#include <stdio.h>

#include "emscripten.h"
#include "jurischain.h"
#include "string.h"

jurischain_ctx_t pow_i;

char *loading = "<div class='jurischain-captcha__marker'><div "
                "class='jurischain-captcha__checkbox--loading'></div></div>"
                "<div class='jurischain-captcha__text'>Aguarde enquanto validamos "
                "seu acesso.</div>";

char *completed = "<div class='jurischain-captcha__marker'><div "
                  "class='jurischain-captcha__checkbox--completed'></div></div>"
                  "<div class='jurischain-captcha__text'>Seu acesso foi validado "
                  "com sucesso.</div>";

EM_JS(void, jurischainElement, (const char *content, int solved, char *challenge), {
  if (solved) {
    const solution = UTF8ToString(challenge, 32);
    const event = new CustomEvent('jurischain', { detail: solution });
    document.dispatchEvent(event);
  }

  const el = document.getElementById('jurischain-captcha');
  if (el) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(UTF8ToString(content), 'text/html');
    el.replaceChildren(...doc.body.childNodes);
    if (solved) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'jurischain';
      input.value = UTF8ToString(challenge, 32);
      el.appendChild(input);
    }
  }
})

void EMSCRIPTEN_KEEPALIVE try_solve() {
  for (int attempt = 0; attempt < 15; attempt++) {
    if (!jurischain_try(&pow_i))
      continue;
    char challenge[(HASH_LEN * 2) + 1] = { 0, };
    for (int j = 0; j < HASH_LEN; j++)
      snprintf(challenge + (j * 2), 3, "%02hhX", pow_i.seed[j]);
    jurischainElement(completed, 1, challenge);
    emscripten_force_exit(0);
    return;
  }
}

int main() {
  if (!emscripten_run_script_int(
          "!document || !window.jurischain || typeof "
          "window.jurischain.seed !== 'string' || typeof "
          "window.jurischain.difficulty !== 'string'"))
    return 1;
  char *seed = emscripten_run_script_string("window.jurischain.seed");
  uint8_t difficulty =
      emscripten_run_script_int("window.jurischain.difficulty");
  jurischainElement(loading, 0, NULL);
  jurischain_gen(&pow_i, difficulty, seed, strlen(seed));
  emscripten_set_main_loop(try_solve, 0, 0);
  return 0;
}
