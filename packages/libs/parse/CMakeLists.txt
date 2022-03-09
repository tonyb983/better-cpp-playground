set(THIS_NAME "PG_ParseLib")

# Header files (relative to "include/pg/data" directory)
set(HEADERS
    "path.hpp"
)

# Source files (relative to "src" directory)
set(SOURCES
    "path.cpp"
)

list(TRANSFORM HEADERS PREPEND "include/pg/parse/")
list(TRANSFORM SOURCES PREPEND "src/")

add_library(${THIS_NAME} ${SOURCES} ${HEADERS})
target_include_directories(${THIS_NAME} PUBLIC include)
target_link_libraries(${THIS_NAME} PRIVATE PG_UtilityLib)
target_link_libraries(${THIS_NAME} PRIVATE fmt::fmt)
target_link_libraries(${THIS_NAME} PRIVATE stx::stx)

# target_link_libraries(${THIS_NAME} PRIVATE Boost::uuid)
# target_include_directories(${THIS_NAME} PRIVATE ${BOOST_HEADER_INCLUDE_DIRS})

add_subdirectory(tests)

file(REAL_PATH "include" THIS_HEADERS BASE_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})
file(REAL_PATH "src" THIS_SOURCES BASE_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})
set(PG_ALL_DOCUMENTED_SOURCES "${PG_ALL_DOCUMENTED_SOURCES} ${THIS_HEADERS} ${THIS_SOURCES}" PARENT_SCOPE)
