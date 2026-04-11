
ifeq ($(PREFIX),)
    PREFIX := /usr/local
endif

SRCDIR   := src
INCDIR   := include
DISTDIR  := dist
WEBDIR   := bindings/browser

CFLAGS   := -O3 -march=native -frename-registers -fassociative-math -freciprocal-math -fno-signed-zeros -fno-trapping-math
EMCCFLAGS := -O3 -I$(INCDIR) -fassociative-math -freciprocal-math -fno-signed-zeros -fno-trapping-math

CC   := gcc
EMCC := emcc

all: js bundle cli-js

$(DISTDIR):
	mkdir -p $(DISTDIR)

cli:
	$(CC) $(SRCDIR)/cli.c -I$(INCDIR) -o jurischain $(CFLAGS)

js: $(DISTDIR)
	$(EMCC) $(SRCDIR)/browser.c -o $(DISTDIR)/jurischain.js -s WASM=0 --memory-init-file 0 $(EMCCFLAGS)

js-module: $(DISTDIR)
	$(EMCC) $(SRCDIR)/browser.c -o $(DISTDIR)/jurischain-module.js -s WASM=0 --memory-init-file 0 -s MODULARIZE=1 -s 'EXPORT_NAME=_JurischainASM' $(EMCCFLAGS)

bundle: js-module
	@echo "Bundling $(DISTDIR)/jurischain-bundle.js..."
	@printf '(function(root){"use strict";\n' > $(DISTDIR)/jurischain-bundle.js
	@cat $(DISTDIR)/jurischain-module.js >> $(DISTDIR)/jurischain-bundle.js
	@printf '\n' >> $(DISTDIR)/jurischain-bundle.js
	@cat $(WEBDIR)/jurischain-bundle-api.js >> $(DISTDIR)/jurischain-bundle.js
	@printf '\n})(typeof self!=="undefined"?self:typeof global!=="undefined"?global:this);\n' >> $(DISTDIR)/jurischain-bundle.js
	@echo "Bundle created: $(DISTDIR)/jurischain-bundle.js ($$(wc -c < $(DISTDIR)/jurischain-bundle.js) bytes)"

cli-js: $(DISTDIR)
	$(EMCC) $(SRCDIR)/cli.c -o $(DISTDIR)/jurischain-cli.js $(EMCCFLAGS)

install:
	cp $(INCDIR)/jurischain.h $(DESTDIR)$(PREFIX)/include/

clean:
	rm -rf ./jurischain
	rm -rf ./$(DISTDIR)
	rm -rf *.gcda
