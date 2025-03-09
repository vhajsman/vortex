cmake_minimum_required(VERSION 3.10)
project(Vortex-backend)

set(CMAKE_CXX_STANDARD 17)
set(SOURCES
    src/main.cpp
    src/mime.cpp
    src/server.cpp
    src/api.cpp
    src/api/auth.cpp)

find_package(Boost REQUIRED COMPONENTS system filesystem program_options json)
add_executable(vortex-server ${SOURCES})
target_include_directories(vortex-server PRIVATE src)
target_link_libraries(vortex-server Boost::system Boost::filesystem Boost::program_options Boost::json)
