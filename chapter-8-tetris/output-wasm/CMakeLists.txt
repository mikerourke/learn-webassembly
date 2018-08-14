cmake_minimum_required(VERSION 3.10)
project(Tetris-Wasm)

set(CMAKE_CXX_STANDARD 14)

include_directories(
    $ENV{EMSCRIPTEN}/system/include
    $ENV{EMSCRIPTEN}/system/include/emscripten
)

add_executable(
    Tetris-Wasm
    src/board.cpp
    src/board.h
    src/constants.h
    src/main.cpp
    src/piece.cpp
    src/piece.h
)

target_link_libraries(Tetris-Wasm ${SDL2_LIBRARIES})
