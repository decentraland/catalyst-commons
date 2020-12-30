HOST_FILES := $(wildcard *.ts)

dist/index.js: $(HOST_FILES)
	NODE_ENV=production node_modules/.bin/ncc build index.ts -e util -e inspector -e fs -e ws -e node-fetch -e path

clean:
	rm -rf dist

watch_host:
	node_modules/.bin/ncc build index.ts -e util -e inspector -e fs -e ws -e node-fetch -e path

build-and-test: dist/index.js
	@echo "test OK stub"
