set(THIS_NAME "PG_MessagesTests")

# Source files (relative to "src" directory)
set(SOURCES
    CreateNoteData.spec.cpp
)

list(TRANSFORM SOURCES PREPEND "src/")

add_executable(${THIS_NAME} ${SOURCES})
target_link_libraries(${THIS_NAME} PRIVATE PG_MessagesLib)
target_link_libraries(${THIS_NAME} PRIVATE GTest::gtest_main) #GTest::gmock_main GTest::gmock GTest::gtest 
target_link_libraries(${THIS_NAME} PRIVATE fmt::fmt flatbuffers::flatbuffers protobuf::libprotobuf)

include(GoogleTest)
gtest_discover_tests(${THIS_NAME})
