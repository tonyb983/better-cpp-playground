set(THIS_NAME "PG_DataLib")

# Header files (relative to "include/pg/data" directory)
set(HEADERS
    Note.hpp
    NoteDto.hpp
    Tag.hpp
)

# Source files (relative to "src" directory)
set(SOURCES
    Note.cpp
    NoteDto.cpp
    Tag.cpp
)

list(TRANSFORM HEADERS PREPEND "include/pg/data/")
list(TRANSFORM SOURCES PREPEND "src/")

add_library(${THIS_NAME} ${SOURCES} ${HEADERS})
target_include_directories(${THIS_NAME} PUBLIC include)
# target_link_libraries(${THIS_NAME} PRIVATE Boost::uuid)
target_include_directories(${THIS_NAME} PRIVATE ${BOOST_HEADER_INCLUDE_DIRS})
target_link_libraries(${THIS_NAME} PRIVATE fmt::fmt)

add_subdirectory(tests)

file(REAL_PATH "include" THIS_HEADERS BASE_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})
file(REAL_PATH "src" THIS_SOURCES BASE_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})
set(PG_ALL_DOCUMENTED_SOURCES "${PG_ALL_DOCUMENTED_SOURCES} ${THIS_HEADERS} ${THIS_SOURCES}" PARENT_SCOPE)
# file(REAL_PATH <path> <out-var> [BASE_DIRECTORY <dir>] [EXPAND_TILDE])
