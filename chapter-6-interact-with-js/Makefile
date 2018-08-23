with-glue:
	emcc js-with-glue.c -O3 -s WASM=1 -s MODULARIZE=1 -o js-with-glue.js

without-glue:
	emcc js-without-glue.c -Os -s WASM=1 -s SIDE_MODULE=1 \
	-s BINARYEN_ASYNC_COMPILATION=0 -o js-without-glue.wasm

with-source-maps:
	emcc js-without-glue.cpp -O1 -g4 \
	-s WASM=1 -s SIDE_MODULE=1 -s BINARYEN_ASYNC_COMPILATION=0 \
	-o js-without-glue.wasm \
	--source-map-base http://localhost:8080/chapter-6-interact-with-js
