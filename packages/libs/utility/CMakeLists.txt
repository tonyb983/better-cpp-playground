set(THIS_NAME "PG_UtilityLib")

# Header files (relative to "include/pg/serde" directory)
set(HEADERS
        concepts.hpp
        describe.hpp
        debug.hpp
        meta.hpp
        meta_struct.hpp
        guard.hpp
        result.hpp
        static_warning.hpp
        Trait.hpp
        Value.hpp)

# Source files (relative to "src" directory)
set(SOURCES
        pgutility.lib.cpp
)

list(TRANSFORM HEADERS PREPEND "include/pg/util/")
list(TRANSFORM SOURCES PREPEND "src/")

add_library(${THIS_NAME} ${SOURCES} ${HEADERS})
target_include_directories(${THIS_NAME} PUBLIC include)
target_include_directories(${THIS_NAME} PRIVATE ${BOOST_HEADER_INCLUDE_DIRS})
target_link_libraries(${THIS_NAME} PRIVATE fmt::fmt)
target_link_libraries(${THIS_NAME} PRIVATE nameof::nameof)

add_subdirectory(tests)

file(REAL_PATH "include" THIS_HEADERS BASE_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})
file(REAL_PATH "src" THIS_SOURCES BASE_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})
set(PG_ALL_DOCUMENTED_SOURCES "${PG_ALL_DOCUMENTED_SOURCES} ${THIS_HEADERS} ${THIS_SOURCES}" PARENT_SCOPE)