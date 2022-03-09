set(THIS_NAME "PG_MainApp")

# Header files (relative to "include" directory)
set(HEADERS
    
)

# Source files (relative to "src" directory)
set(SOURCES
    main.cpp
)

# list(TRANSFORM HEADERS PREPEND "include/pg/main/")
list(TRANSFORM SOURCES PREPEND "src/")

add_executable(${THIS_NAME} ${SOURCES} ${HEADERS})
set_target_properties(${THIS_NAME} PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${PG_BUILT_BIN_DIR}")

target_link_libraries(${THIS_NAME} PRIVATE PG_StdFmtLib PG_UtilityLib fmt::fmt nameof::nameof)
# target_include_directories(${THIS_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
