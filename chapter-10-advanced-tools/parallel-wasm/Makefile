.DEFAULT_GOAL := build

LIB_DIR = lib
SRC_DIR = src
FLAGS = -s WASM=1 -s SIDE_MODULE=1 -O1 -s BINARYEN_ASYNC_COMPILATION=0

clean:
	find $(SRC_DIR) -name '*.wasm' -exec rm -r {} \;

compile:
	emcc $(FLAGS) $(LIB_DIR)/add.c -o $(SRC_DIR)/calc-add.wasm
	emcc $(FLAGS) $(LIB_DIR)/subtract.c -o $(SRC_DIR)/calc-subtract.wasm

build: clean compile
