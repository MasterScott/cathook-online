cmake_minimum_required(VERSION 3.0)

project(co-client)
add_executable(${PROJECT_NAME} "")

target_include_directories(co-client PRIVATE include)

add_subdirectory(include)
add_subdirectory(src)