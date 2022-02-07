set(THIS_NAME "PG_SerdeLib")

# Header files (relative to "include/pg/serde" directory)
set(HEADERS
    de.hpp
    ser.hpp
)

# Source files (relative to "src" directory)
set(SOURCES
    de.cpp
    ser.cpp
)

list(TRANSFORM HEADERS PREPEND "include/pg/serde/")
list(TRANSFORM SOURCES PREPEND "src/")

add_library(${THIS_NAME} ${SOURCES} ${HEADERS})
target_include_directories(${THIS_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
# target_link_libraries(${THIS_NAME} PRIVATE Boost::uuid)
target_include_directories(${THIS_NAME} PRIVATE ${BOOST_HEADER_INCLUDE_DIRS})
target_link_libraries(${THIS_NAME} PRIVATE fmt::fmt)

add_subdirectory(tests)