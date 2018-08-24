# This allows you to just run the "make" command without specifying
# arguments:
default: all;
.PHONY: default

# Specifies which files to compile as part of the project:
CPP_FILES = $(wildcard src/*.cpp)

# Flags to use for Emscripten emcc compile command:
FLAGS = -std=c++14 -s WASM=1 -s USE_SDL=2 -s MODULARIZE=1 -O3 \
		--bind $(CPP_FILES)

# Name of output (the .wasm file is created automatically):
OUTPUT = public/index.js

# This is the target that compiles our executable
build: $(CPP_FILES)
	emcc  $(FLAGS) -o $(OUTPUT)

# Removes the existing index.js and index.wasm files:
clean:
	@[ -f $(OUTPUT) ] && rm $(OUTPUT) || true
	@[ -f public/index.wasm ] && rm public/index.wasm || true

# Removes the existing files and builds the project:
all: clean build
	@echo "Build Complete!"
