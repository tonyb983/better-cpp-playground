set(THIS_NAME "PG_UtilityLib")

# Header files (relative to "include/pg/serde" directory)
set(HEADERS
    meta.hpp
    guard.hpp
)

# Source files (relative to "src" directory)
set(SOURCES
    lib.cpp
)

# Source files (relative to "test" directory)
# set(TEST_SOURCES
# )

list(TRANSFORM HEADERS PREPEND "include/pg/util/")
list(TRANSFORM SOURCES PREPEND "src/")
# list(TRANSFORM TEST_SOURCES PREPEND "test/")

add_library(${THIS_NAME} ${SOURCES} ${HEADERS})
target_include_directories(${THIS_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
target_include_directories(${THIS_NAME} PRIVATE ${BOOST_HEADER_INCLUDE_DIRS})
target_link_libraries(${THIS_NAME} PRIVATE fmt::fmt)

add_subdirectory(tests)