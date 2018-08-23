.DEFAULT_GOAL := build

LIB_DIR = lib
ASSETS_DIR = src/assets
FLAGS = -s WASM=1 -s SIDE_MODULE=1 -O1 -s BINARYEN_ASYNC_COMPILATION=0

clean:
	find $(ASSETS_DIR) -name '*.wasm' -exec rm -r {} \;

compile:
	emcc $(FLAGS) $(LIB_DIR)/add.c -o $(ASSETS_DIR)/add.wasm
	emcc $(FLAGS) $(LIB_DIR)/subtract.c -o $(ASSETS_DIR)/subtract.wasm

build: clean compile
