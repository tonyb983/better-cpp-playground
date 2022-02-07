set(THIS_NAME "PG_MessagesLib")

# Header files (relative to "include/pg/serde" directory)
set(HEADERS
    "include/pg/gen/note.gen.hpp"
)

# Source files (relative to "src" directory)
set(SOURCES
    "src/messages.lib.cpp"
)

add_library(${THIS_NAME} ${SOURCES} ${HEADERS})
target_include_directories(${THIS_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
# target_link_libraries(${THIS_NAME} PRIVATE Boost::uuid)
target_include_directories(${THIS_NAME} PRIVATE ${BOOST_HEADER_INCLUDE_DIRS})
target_link_libraries(${THIS_NAME} PRIVATE fmt::fmt flatbuffers::flatbuffers protobuf::libprotobuf)

add_subdirectory(tests)