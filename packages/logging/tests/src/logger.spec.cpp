// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

#include <pg/log/logger.hpp>

// #include <fmt/chrono.h>
#include <fmt/format.h>
#include <gsl/gsl>

#include <gtest/gtest.h>

namespace {

struct SomeStruct {};
class SomeClass {};

TEST(LoggerTests, CanGenerateTimestamps) {
    auto timestamp = pg::log::Logger<SomeStruct>::generate_timestamp();
    auto ts_str = pg::log::Logger<SomeStruct>::generate_timestamp_str();
    fmt::print("\t       Timestamp: {}\n", timestamp);
    fmt::print("\tTimestamp String: {}\n", ts_str);
    ASSERT_GT(timestamp.time_since_epoch().count(), 0);
}

TEST(LoggerTests, ContainsCorrectTypeNames) {
    // fmt::print(
    //     "Logger<SomeStruct>:\n\t      owner_type_name: {}\n\towner_type_name_short: {}\n\t owner_type_name_full: {}",
    //     pg::log::Logger<SomeStruct>::owner_type_name,
    //     pg::log::Logger<SomeStruct>::owner_type_name_short,
    //     pg::log::Logger<SomeStruct>::owner_type_name_full);

    // fmt::print(
    //     "Logger<SomeClass>:\n\t      owner_type_name: {}\n\towner_type_name_short: {}\n\t owner_type_name_full: {}",
    //     pg::log::Logger<SomeClass>::owner_type_name,
    //     pg::log::Logger<SomeClass>::owner_type_name_short,
    //     pg::log::Logger<SomeClass>::owner_type_name_full);

    ASSERT_EQ(pg::log::Logger<SomeStruct>::owner_type_name_short, "SomeStruct");
    ASSERT_EQ(pg::log::Logger<SomeStruct>::owner_type_name, "(anonymous namespace)::SomeStruct");
    ASSERT_EQ(pg::log::Logger<SomeStruct>::owner_type_name_full, "(anonymous namespace)::SomeStruct");

    ASSERT_EQ(pg::log::Logger<SomeClass>::owner_type_name_short, "SomeClass");
    ASSERT_EQ(pg::log::Logger<SomeClass>::owner_type_name, "(anonymous namespace)::SomeClass");
    ASSERT_EQ(pg::log::Logger<SomeClass>::owner_type_name_full, "(anonymous namespace)::SomeClass");
}

}  // namespace
