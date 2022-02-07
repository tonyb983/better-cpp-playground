####################
#      Global      #
####################

cmake_minimum_required(VERSION 3.12)
set(CMAKE_CXX_STANDARD 20)


#####################
#      Project      #
#####################

# Project variables
set(LOCAL_PROJECT_NAME        "Playground")
set(LOCAL_PROJECT_VERSION     "0.1.0")
set(LOCAL_PROJECT_DESCRIPTION "Description")

# Header files (relative to "include" directory)
# set(HEADERS
#     header.hpp
# )

# Source files (relative to "src" directory)
# set(SOURCES
#     main.cpp
# )

# Source files (relative to "test" directory)
# set(TEST_SOURCES
# )

# Compiler definitions
set(DEFINES

)

# Compiler options
set(OPTIONS

)

# Project setup
project(${LOCAL_PROJECT_NAME}
        VERSION ${LOCAL_PROJECT_VERSION}
        DESCRIPTION ${LOCAL_PROJECT_DESCRIPTION}
        LANGUAGES CXX)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

option(RUN_CLANG_TIDY "Enable clang tidy." OFF)

if(RUN_CLANG_TIDY)
	set(CMAKE_CXX_CLANG_TIDY clang-tidy -checks=-*,clang-diagnostic-*,clang-analyzer-*,cppcoreguidelines-*,modernize-*,bugprone-*,misc-*,performance-*,readability-*)
endif()

# option(CLANG_TIME_TRACE "Enable clang profiling." ON)

# if(CLANG_TIME_TRACE)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -ftime-trace")
# endif()

# add_executable(${LOCAL_PROJECT_NAME})

# list(TRANSFORM HEADERS PREPEND "include/")
# list(TRANSFORM SOURCES PREPEND "src/")
# list(TRANSFORM TEST_SOURCES PREPEND "test/")

# target_include_directories(${LOCAL_PROJECT_NAME} PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/include)
# target_sources(${LOCAL_PROJECT_NAME} PRIVATE ${SOURCES} ${HEADERS})
# target_compile_definitions(${LOCAL_PROJECT_NAME} PRIVATE ${DEFINES})
# target_compile_options(${LOCAL_PROJECT_NAME} PRIVATE ${OPTIONS})

# set_target_properties(${LOCAL_PROJECT_NAME} PROPERTIES RUNTIME_OUTPUT_DIRECTORY "bin")

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

find_path(BOOST_HEADER_INCLUDE_DIRS "boost/uuid/uuid.hpp" "boost/uuid/uuid_generators.hpp" "boost/hana.hpp" "boost/hana/accessors.hpp")

find_package(protobuf CONFIG REQUIRED)
# target_link_libraries(main PRIVATE protobuf::libprotoc protobuf::libprotobuf protobuf::libprotobuf-lite)

find_package(Flatbuffers CONFIG REQUIRED)
# target_link_libraries(main PRIVATE flatbuffers::flatbuffers)

find_package(GTest CONFIG REQUIRED)
# target_link_libraries(main PRIVATE GTest::gmock GTest::gtest GTest::gmock_main GTest::gtest_main)

include(CTest)
include(GoogleTest)

##################
#    Sub-Dirs    #
##################
add_subdirectory(packages)
add_subdirectory(apps)

###################
#     Testing     #
###################

# add_executable(tests)
# target_sources(tests PRIVATE ${TEST_SOURCES})
# target_link_libraries(tests PRIVATE Catch2::Catch2WithMain)


# include(Catch)
# catch_discover_tests(tests)
