set(THIS_NAME "PG_StdFmtLib")

# Header files (relative to "include/pg/serde" directory)
set(HEADERS
    stdfmt.hpp
)

# Source files (relative to "src" directory)
set(SOURCES
    lib.cpp
)

# Source files (relative to "test" directory)
# set(TEST_SOURCES
# )

list(TRANSFORM HEADERS PREPEND "include/pg/")
list(TRANSFORM SOURCES PREPEND "src/")
# list(TRANSFORM TEST_SOURCES PREPEND "test/")

add_library(${THIS_NAME} ${SOURCES} ${HEADERS})
target_include_directories(${THIS_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
target_link_libraries(${THIS_NAME} PRIVATE PG_UtilityLib nameof::nameof fmt::fmt)
# target_include_directories(${THIS_NAME} PRIVATE PG_Utility)
target_include_directories(${THIS_NAME} PRIVATE ${BOOST_HEADER_INCLUDE_DIRS})

include(GoogleTest)
add_subdirectory(tests)