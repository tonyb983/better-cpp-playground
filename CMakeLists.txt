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

# if(CLANG_TIME_TRACE)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} --coverage")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -ftime-trace -fprofile-arcs -ftest-coverage -Wno-dev")
# endif()

set(PG_BUILT_BIN_DIR ${CMAKE_BINARY_DIR}/bin)

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

find_path(BOOST_HEADER_INCLUDE_DIRS "boost/uuid/uuid.hpp" "boost/uuid/uuid_generators.hpp" "boost/hana.hpp" "boost/hana/accessors.hpp")

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

# Disable the multitude of unnecessary targets added by CTest
set_property(GLOBAL PROPERTY CTEST_TARGETS_ADDED 1)
include(CTest)
include(GoogleTest)

##################
#    Sub-Dirs    #
##################
add_subdirectory(packages)
add_subdirectory(apps)
