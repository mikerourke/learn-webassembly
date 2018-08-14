.DEFAULT_GOAL := build
build:
	emcc lib/main.c -Os -s WASM=1 -s SIDE_MODULE=1 -s BINARYEN_ASYNC_COMPILATION=0 -o src/assets/main.wasm
