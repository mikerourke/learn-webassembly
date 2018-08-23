.DEFAULT_GOAL := build

clean:
	@[ -f ./main.wasm ] && rm main.wasm || true

compile:
	emcc main.c -Os \
	-s WASM=1 -s SIDE_MODULE=1 -s BINARYEN_ASYNC_COMPILATION=0 \
	-o main.wasm

build: clean compile
