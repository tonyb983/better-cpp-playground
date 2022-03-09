// Copyright 2022 Tony Barbitta
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#include <optional>
#include <variant>

#include <fmt/format.h>

#include <pg/stdfmt.hpp>

#include <gtest/gtest.h>

namespace {

TEST(StdFmtTests, FormatsOptionalCorrectly) {
    auto opt_one = std::optional<int> { 1 };
    auto opt_none = std::optional<int> {};
    auto str = fmt::format("{}", opt_one);
    EXPECT_EQ(str, "std::optional<int>(1)");
    str = fmt::format("{}", opt_none);
    EXPECT_EQ(str, "std::optional<int>(None)");
}

TEST(StdFmtTests, FormatsVariantCorrectly) {
    EXPECT_EQ(fmt::format("{}", std::variant<int, std::string> { 1 }), "std::variant<int, std::basic_string<char>>(1)");
    EXPECT_EQ(
        fmt::format("{}", std::variant<int, std::string> { std::string { "hello" } }),
        "std::variant<int, std::basic_string<char>>(hello)");
}

}  // namespace