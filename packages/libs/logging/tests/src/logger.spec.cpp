// Copyright (c) 2022. Tony Barbitta
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

struct SomeStruct { };
class SomeClass { };

TEST(LoggerTests, CanGenerateTimestamps) {
    auto timestamp = pg::log::Logger<SomeStruct>::generate_timestamp();
    auto ts_str = pg::log::Logger<SomeStruct>::generate_timestamp_str();
    ASSERT_GT(timestamp.time_since_epoch().count(), 0);
}

TEST(LoggerTests, ContainsCorrectTypeNames) {
    ASSERT_EQ(pg::log::Logger<SomeStruct>::owner_type_name_short, "SomeStruct");
    ASSERT_EQ(pg::log::Logger<SomeStruct>::owner_type_name, "(anonymous namespace)::SomeStruct");
    ASSERT_EQ(pg::log::Logger<SomeStruct>::owner_type_name_full, "(anonymous namespace)::SomeStruct");

    ASSERT_EQ(pg::log::Logger<SomeClass>::owner_type_name_short, "SomeClass");
    ASSERT_EQ(pg::log::Logger<SomeClass>::owner_type_name, "(anonymous namespace)::SomeClass");
    ASSERT_EQ(pg::log::Logger<SomeClass>::owner_type_name_full, "(anonymous namespace)::SomeClass");
}

TEST(LoggerTests, ProperlySendsLogsToSink) {
    const size_t test_sink_capacity = 10;
    auto test_sink = std::make_shared<pg::log::TestLogSink>(test_sink_capacity);
    ASSERT_NE(test_sink, nullptr);
    ASSERT_EQ(test_sink->size(), 0);
    ASSERT_EQ(test_sink->capacity(), test_sink_capacity);
    ASSERT_TRUE(test_sink->empty());

    auto* logger = new pg::log::Logger(test_sink);
    ASSERT_NE(logger, nullptr);
    ASSERT_EQ(logger->sink_count(), 1);

    logger->info("Here is a log message");
    ASSERT_FALSE(test_sink->empty());
    ASSERT_FALSE(test_sink->full());
    ASSERT_EQ(test_sink->size(), 1);

    auto record = test_sink->get_log(0);
    ASSERT_EQ(record.raw_msg, "Here is a log message");
    ASSERT_TRUE(record.log.ends_with("]:[INFO]:[root] Here is a log message"));

    logger->error("Log Number 2");
    for (auto i = 0; i < 9; i++) {
        logger->warn(fmt::format("Auto-log #{}", i));
    }
    ASSERT_TRUE(test_sink->full());

    record = test_sink->get_log(0);
    ASSERT_EQ(record.raw_msg, "Log Number 2");
    ASSERT_TRUE(record.log.ends_with("]:[ERROR]:[root] Log Number 2"));
}

TEST(LoggerTests, ProperlySendsLogsToMultipleSinks) {
    const size_t test_sink_capacity = 10;
    auto test_sink = std::make_shared<pg::log::TestLogSink>(test_sink_capacity);
    ASSERT_NE(test_sink, nullptr);
    ASSERT_EQ(test_sink->size(), 0);
    ASSERT_EQ(test_sink->capacity(), test_sink_capacity);
    ASSERT_TRUE(test_sink->empty());
    auto test_sink2 = std::make_shared<pg::log::TestLogSink>(test_sink_capacity);
    ASSERT_NE(test_sink2, nullptr);
    ASSERT_EQ(test_sink2->size(), 0);
    ASSERT_EQ(test_sink2->capacity(), test_sink_capacity);
    ASSERT_TRUE(test_sink2->empty());

    auto* logger = new pg::log::Logger({ test_sink, test_sink2 });
    ASSERT_NE(logger, nullptr);
    ASSERT_EQ(logger->sink_count(), 2);

    logger->info("Here is a log message");
    ASSERT_FALSE(test_sink->empty());
    ASSERT_FALSE(test_sink->full());
    ASSERT_EQ(test_sink->size(), 1);
    ASSERT_FALSE(test_sink2->empty());
    ASSERT_FALSE(test_sink2->full());
    ASSERT_EQ(test_sink2->size(), 1);

    auto record = test_sink->get_log(0);
    auto record2 = test_sink2->get_log(0);
    ASSERT_EQ(record.raw_msg, "Here is a log message");
    ASSERT_EQ(record.raw_msg, record2.raw_msg);
    ASSERT_TRUE(record.log.ends_with("]:[INFO]:[root] Here is a log message"));
    ASSERT_TRUE(record2.log.ends_with("]:[INFO]:[root] Here is a log message"));

    logger->error("Log Number 2");
    for (auto i = 0; i < 9; i++) {
        logger->warn(fmt::format("Auto-log #{}", i));
    }
    ASSERT_TRUE(test_sink->full());
    ASSERT_TRUE(test_sink2->full());

    record = test_sink->get_log(0);
    record2 = test_sink->get_log(0);
    ASSERT_EQ(record.raw_msg, "Log Number 2");
    ASSERT_EQ(record2.raw_msg, record.raw_msg);
    ASSERT_TRUE(record.log.ends_with("]:[ERROR]:[root] Log Number 2"));
    ASSERT_TRUE(record2.log.ends_with("]:[ERROR]:[root] Log Number 2"));
}

TEST(LoggerTests, WorksWithAdditionalData) {
    const size_t test_sink_capacity = 10;
    auto test_sink = std::make_shared<pg::log::TestLogSink>(test_sink_capacity);
    ASSERT_NE(test_sink, nullptr);
    auto logger = std::make_unique<pg::log::Logger<void>>(test_sink);
    ASSERT_NE(logger, nullptr);
    ASSERT_EQ(logger->sink_count(), 1);

    nlohmann::json data = { { "value1", 100 },       { "value2", 100.1 },
                            { "flag1", false },      { "nothing", nullptr },
                            { "list", { 1, 0, 2 } }, { "object", { { "currency", "USD" }, { "value", 42.99 } } } };
    // fmt::print("Data: {}", data.dump(2));
    ASSERT_EQ(data, data);

    logger->info("Here is a message with data", &data);

    ASSERT_EQ(test_sink->size(), 1);
    auto record = test_sink->get_log(0);
    ASSERT_EQ(record.raw_msg, "Here is a message with data");
    ASSERT_TRUE(record.has_data());
    ASSERT_EQ(record.opt_data.value(), data);
    data["value1"] = 10000;
    // Make sure record.opt_data isnt pointing to data.
    ASSERT_NE(record.opt_data.value(), data);
    auto patch = nlohmann::json::diff(data, record.opt_data.value());
    fmt::print("Patch: {}", patch.dump(2));
}

}  // namespace
