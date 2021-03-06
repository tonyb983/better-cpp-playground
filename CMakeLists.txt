####################
#      Global      #
####################

cmake_minimum_required(VERSION 3.12)
set(CMAKE_CXX_STANDARD 20)


#####################
#      Project      #
#####################

# Project variables
set(LOCAL_PROJECT_NAME "Playground")
set(LOCAL_PROJECT_VERSION "0.1.0")
set(LOCAL_PROJECT_DESCRIPTION "A playground to get some experience with CMake and C++ in general!")

# Project setup
project(${LOCAL_PROJECT_NAME}
        VERSION ${LOCAL_PROJECT_VERSION}
        DESCRIPTION ${LOCAL_PROJECT_DESCRIPTION}
        LANGUAGES CXX)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

option(RUN_CLANG_TIDY "Enable clang tidy." OFF)

if (RUN_CLANG_TIDY)
    set(CMAKE_CXX_CLANG_TIDY clang-tidy -checks=-*,clang-diagnostic-*,clang-analyzer-*,cppcoreguidelines-*,modernize-*,bugprone-*,misc-*,performance-*,readability-*)
endif ()

# Create build timing reports
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -ftime-trace")
# endif()

set(PG_BUILT_BIN_DIR ${CMAKE_BINARY_DIR}/bin)
set(PG_BUILT_TEST_BIN_DIR ${CMAKE_BINARY_DIR}/bin/tests)
set(PG_ALL_DOCUMENTED_SOURCES "")

# Uncomment this to print all variables while building
#get_cmake_property(_variableNames VARIABLES)
#foreach (_variableName ${_variableNames})
#    message(STATUS "${_variableName}=${${_variableName}}")
#endforeach ()

####################
#   Dependencies   #
####################
find_package(fmt CONFIG REQUIRED)
# target_link_libraries(${LOCAL_PROJECT_NAME} PRIVATE fmt::fmt)
# or
# target_link_libraries(${LOCAL_PROJECT_NAME} PRIVATE fmt::fmt-header-only)

find_package(RapidJSON CONFIG REQUIRED)
# target_link_libraries(${LOCAL_PROJECT_NAME} PRIVATE rapidjson)

find_package(nlohmann_json CONFIG REQUIRED)
# target_link_libraries(${LOCAL_PROJECT_NAME} PRIVATE nlohmann_json nlohmann_json::nlohmann_json)

find_package(nameof CONFIG REQUIRED)
# target_link_libraries(${LOCAL_PROJECT_NAME} PRIVATE nameof::nameof)

find_package(visit_struct CONFIG REQUIRED)
# target_link_libraries(main PRIVATE visit_struct::visit_struct)

find_path(PROMISE_CPP_INCLUDE_DIRS "promise-cpp/promise.hpp")
# target_include_directories(main PRIVATE ${PROMISE_CPP_INCLUDE_DIRS})

find_path(PLF_HIVE_INCLUDE_DIRS "plf_hive.h")
# target_include_directories(main PRIVATE ${PLF_HIVE_INCLUDE_DIRS})

find_path(PLF_NANOTIMER_INCLUDE_DIRS "plf_nanotimer.h")
# target_include_directories(main PRIVATE ${PLF_NANOTIMER_INCLUDE_DIRS})

find_package(SqliteOrm CONFIG REQUIRED)
# target_link_libraries(main PRIVATE sqlite_orm::sqlite_orm)

find_package(spdlog CONFIG REQUIRED)
# target_link_libraries(main PRIVATE spdlog::spdlog)

find_path(BOOST_HEADER_INCLUDE_DIRS "boost/circular_buffer.hpp" "boost/uuid/uuid.hpp" "boost/uuid/uuid_generators.hpp" "boost/hana.hpp" "boost/hana/accessors.hpp")
# target_include_directories(main PRIVATE ${BOOST_HEADER_INCLUDE_DIRS})
find_package(Boost REQUIRED)
# target_link_libraries(main PRIVATE Boost::boost Boost::<lib1> Boost::<lib2> ...)

find_package(protobuf CONFIG REQUIRED)
# target_link_libraries(main PRIVATE protobuf::libprotoc protobuf::libprotobuf protobuf::libprotobuf-lite)

find_package(Flatbuffers CONFIG REQUIRED)
# target_link_libraries(main PRIVATE flatbuffers::flatbuffers)

find_package(GTest CONFIG REQUIRED)
# target_link_libraries(main PRIVATE GTest::gmock GTest::gtest GTest::gmock_main GTest::gtest_main)

find_path(MPMCQUEUE_INCLUDE_DIRS "rigtorp/MPMCQueue.h")
# target_include_directories(main PRIVATE ${MPMCQUEUE_INCLUDE_DIRS})

find_package(unofficial-concurrentqueue CONFIG REQUIRED)
# target_link_libraries(main PRIVATE unofficial::concurrentqueue::concurrentqueue)

find_package(Microsoft.GSL CONFIG REQUIRED)
# target_link_libraries(main PRIVATE Microsoft.GSL::GSL)

find_package(stx CONFIG REQUIRED)
# target_link_libraries(main PRIVATE stx::stx)

find_path(PARALLEL_HASHMAP_INCLUDE_DIRS "parallel_hashmap/btree.h")
# target_include_directories(main PRIVATE ${PARALLEL_HASHMAP_INCLUDE_DIRS})

# Disable the multitude of unnecessary targets added by CTest
set_property(GLOBAL PROPERTY CTEST_TARGETS_ADDED 1)
include(CTest)
include(GoogleTest)

##################
#    Sub-Dirs    #
##################
add_subdirectory(packages)

add_subdirectory(docs)

# message(STATUS "PG_ALL_DOCUMENTED_SOURCES=${PG_ALL_DOCUMENTED_SOURCES}")