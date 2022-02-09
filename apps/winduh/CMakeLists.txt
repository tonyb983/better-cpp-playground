set(THIS_NAME "PG_WinduhApp")

# Header files (relative to "include" directory)
set(HEADERS
    
)

# Source files (relative to "src" directory)
set(SOURCES
    wmain.cpp
)

# list(TRANSFORM HEADERS PREPEND "include/pg/main/")
list(TRANSFORM SOURCES PREPEND "src/")

add_executable(${THIS_NAME} WIN32 ${SOURCES} ${HEADERS})

# set_target_properties(${THIS_NAME} PROPERTIES RUNTIME_OUTPUT_DIRECTORY "../bin")
set_target_properties(${THIS_NAME} PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${PG_BUILT_BIN_DIR}")

target_link_libraries(${THIS_NAME} PRIVATE PG_StdFmtLib fmt::fmt nameof::nameof Microsoft.GSL::GSL)
# target_include_directories(${THIS_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
