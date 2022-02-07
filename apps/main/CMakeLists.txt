set(THIS_NAME "PG_MainApp")

# Header files (relative to "include" directory)
set(HEADERS
    
)

# Source files (relative to "src" directory)
set(SOURCES
    main.cpp
)

# Source files (relative to "test" directory)
# set(TEST_SOURCES
# )

# list(TRANSFORM HEADERS PREPEND "include/pg/main/")
list(TRANSFORM SOURCES PREPEND "src/")
# list(TRANSFORM TEST_SOURCES PREPEND "test/")

add_executable(${THIS_NAME} ${SOURCES})#  ${HEADERS})

target_link_libraries(${THIS_NAME} PRIVATE PG_StdFmtLib PG_UtilityLib fmt::fmt nameof::nameof)
# target_include_directories(${THIS_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
