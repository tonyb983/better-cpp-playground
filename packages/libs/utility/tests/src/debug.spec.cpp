// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

#include <string>
#include <string_view>

#include <fmt/format.h>

#include <gtest/gtest.h>

#include <pg/util/debug.hpp>

namespace {

using namespace pg::util;

TEST(ValueDebuggerTests, FormattableValueDifferentFormats) {
    auto text = std::string { "Cool string bro." };
    auto result_reg = PgDebug::type_and_value(text);
    EXPECT_EQ(result_reg, "Cool string bro. (std::basic_string<char>)");
}

TEST(ValueDebuggerTests, LabeledFormattableValues) {
    auto text = std::string { "Interesting Text!" };
    auto result_reg = PgDebug::type_and_value(text, "variable 'text'");
    EXPECT_EQ(result_reg, "variable 'text': Interesting Text! (std::basic_string<char>)");
}

struct Unformattable {
    int* value;
};

TEST(ValueDebuggerTests, UnformattableValue) {
    auto value = Unformattable { new int { 42 } };
    static_assert(!can_be_pg_debugged<decltype(value)>);
    static_assert(can_be_pg_debugged<std::string>);
    static_assert(cannot_be_pg_debugged<decltype(value)>);
    static_assert(!cannot_be_pg_debugged<std::string>);
}

}  // namespace