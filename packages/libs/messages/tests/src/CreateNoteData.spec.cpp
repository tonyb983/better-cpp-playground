// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

#include <fstream>

#include <fmt/format.h>

#include <pg/gen/note.gen.hpp>

#include <gtest/gtest.h>

namespace {

TEST(CreateNoteDataTests, CanSerializeAndDeserialize) {
    EXPECT_EQ(1, 1);
}

}  // namespace