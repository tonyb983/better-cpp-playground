set(THIS_NAME "PG_LoggingLib")

# Header files (relative to "include/pg/log" directory)
set(HEADERS
        logger.hpp
        )

# Source files (relative to "src" directory)
set(SOURCES
        logging.lib.cpp
        )

list(TRANSFORM HEADERS PREPEND "include/pg/log/")
list(TRANSFORM SOURCES PREPEND "src/")

add_library(${THIS_NAME} ${SOURCES} ${HEADERS})
target_include_directories(${THIS_NAME} PUBLIC include)

# Internal dependencies
target_link_libraries(${THIS_NAME} PRIVATE PG_UtilityLib)

# External dependencies
target_link_libraries(${THIS_NAME} PRIVATE fmt::fmt nameof::nameof Microsoft.GSL::GSL)
target_link_libraries(${THIS_NAME} PRIVATE nlohmann_json nlohmann_json::nlohmann_json)
target_include_directories(${THIS_NAME} PRIVATE ${BOOST_HEADER_INCLUDE_DIRS})

add_subdirectory(tests)

file(REAL_PATH "include" THIS_HEADERS BASE_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})
file(REAL_PATH "src" THIS_SOURCES BASE_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})
set(PG_ALL_DOCUMENTED_SOURCES "${PG_ALL_DOCUMENTED_SOURCES} ${THIS_HEADERS} ${THIS_SOURCES}" PARENT_SCOPE)
# file(REAL_PATH <path> <out-var> [BASE_DIRECTORY <dir>] [EXPAND_TILDE])
