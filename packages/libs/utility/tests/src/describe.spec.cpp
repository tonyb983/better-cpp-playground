// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

#include <string>
#include <string_view>

#include <fmt/format.h>

#include <gtest/gtest.h>

#include <pg/util/describe.hpp>

namespace {

TEST(DescribeTests, ItWorks) {
    EXPECT_EQ(pg::util::describe<int>(), "int");
    EXPECT_EQ(pg::util::describe<double>(), "double");
    EXPECT_EQ(pg::util::describe<std::string>(), "std::basic_string<char>");
    EXPECT_EQ(pg::util::describe<std::string_view>(), "std::basic_string_view<char>");
}

}  // namespace