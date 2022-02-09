set(THIS_NAME "PG_LoggingTests")

# Source files (relative to "src" directory)
set(SOURCES
    logger.spec.cpp
)

list(TRANSFORM SOURCES PREPEND "src/")

add_executable(${THIS_NAME} ${SOURCES})
target_link_libraries(${THIS_NAME} PRIVATE PG_LoggingLib)
target_link_libraries(${THIS_NAME} PRIVATE GTest::gtest_main) #GTest::gmock_main GTest::gmock GTest::gtest 
target_link_libraries(${THIS_NAME} PRIVATE fmt::fmt)
target_link_libraries(${THIS_NAME} PRIVATE Microsoft.GSL::GSL)

include(GoogleTest)
gtest_discover_tests(${THIS_NAME})
