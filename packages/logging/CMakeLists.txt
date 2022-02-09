set(THIS_NAME "PG_LoggingLib")

# Header files (relative to "include/pg/log" directory)
set(HEADERS
    logger.hpp
)

# Source files (relative to "src" directory)
set(SOURCES
    pglog.cpp
)

list(TRANSFORM HEADERS PREPEND "include/pg/log/")
list(TRANSFORM SOURCES PREPEND "src/")

add_library(${THIS_NAME} ${SOURCES} ${HEADERS})
target_include_directories(${THIS_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
target_link_libraries(${THIS_NAME} PRIVATE fmt::fmt)
target_link_libraries(${THIS_NAME} PRIVATE nameof::nameof)
target_link_libraries(${THIS_NAME} PRIVATE Microsoft.GSL::GSL)

add_subdirectory(tests)
