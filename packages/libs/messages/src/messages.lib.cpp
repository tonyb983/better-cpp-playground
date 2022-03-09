// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// #include <flatbuffers/util.h>

#include <fstream>

#include <pg/gen/note.gen.hpp>

namespace pg::msg {

void do_nothing() {
    using namespace pg::gen;

    constexpr static int BUFFER_SIZE = 1024;

    flatbuffers::FlatBufferBuilder builder { BUFFER_SIZE };

    auto title = builder.CreateString("Note Title 1");
    auto content = builder.CreateString("Here is the content for the first note, it is awesome!");
    std::vector<std::string> tag_d = { "tag1", "tag2", "tag3" };
    auto tags = builder.CreateVectorOfStrings(tag_d);

    CreateNoteDataBuilder create_builder { builder };
    create_builder.add_title(title);
    create_builder.add_content(content);
    create_builder.add_tags(tags);
    auto create = create_builder.Finish();

    builder.Finish(create);

    auto* buf_ptr = builder.GetBufferPointer();
    auto buf_size = builder.GetSize();

    std::fstream outfile { "create_note.bin", std::ios::out | std::ios::binary };
    outfile.write(reinterpret_cast<const char*>(buf_ptr), buf_size);
}

}  // namespace pg::msg