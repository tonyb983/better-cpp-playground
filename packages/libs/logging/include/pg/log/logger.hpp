// Copyright (c) 2022. Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

#pragma once

#include <chrono>
#include <source_location>
#include <string>
#include <string_view>
#include <tuple>
#include <type_traits>
#include <utility>
#include <vector>

#include <boost/circular_buffer.hpp>
#include <fmt/chrono.h>
#include <fmt/format.h>
#include <nameof.hpp>

#include <nlohmann/json.hpp>

namespace pg::log {

enum class LogLevel { Debug, Info, Warning, Error, Fatal };

/**
 * @brief The stored record of a log.
 */
struct LogRecord {
    using String = std::string;
    using StringView = std::string_view;
    using DataType = nlohmann::json;
    using OptionalData = std::optional<DataType>;

    /**
     * @brief The formatted log
     */
    String log;
    /**
     * @brief The name of the logger who generated the log
     */
    String logger_name;
    /**
     * @brief The level of the log
     */
    LogLevel level;
    /**
     * @brief The raw message that was logged
     */
    String raw_msg;
    /**
     * @brief Any additional data that was sent with the log
     */
    OptionalData opt_data;

    /**
     * @brief Create `LogRecord` from it's parts. Includes no additional data. All strings will be moved.
     * @param log The formatted log that was created by the logger
     * @param logger_name The name of the logger that sent the log
     * @param level The level of the log
     * @param raw_msg The raw text that was sent when the log method was called
     */
    LogRecord(String log, String logger_name, LogLevel level, String raw_msg)
        : LogRecord(std::move(log), std::move(logger_name), level, std::move(raw_msg), nullptr) { }

    /**
     * @brief Create `LogRecord` from it's parts. All strings will be moved.
     * @param log The formatted log that was created by the logger
     * @param logger_name The name of the logger that sent the log
     * @param level The level of the log
     * @param raw_msg The raw text that was sent when the log method was called
     * @param opt_data Any additional data that was sent with the log
     */
    LogRecord(String log, String logger_name, LogLevel level, String raw_msg, DataType* opt_data)
        : log { std::move(log) },
          logger_name { std::move(logger_name) },
          level { level },
          raw_msg { std::move(raw_msg) } {
        if (opt_data == nullptr) {
            this->opt_data = std::nullopt;
        } else {
            const DataType& data_ref = *opt_data;
            this->opt_data = nlohmann::json { data_ref };
        }
    }

    /**
     * @brief Create `LogRecord` from it's parts. All strings will be copied. Includes no additional data.
     * @param log The formatted log that was created by the logger
     * @param logger_name The name of the logger that sent the log
     * @param level The level of the log
     * @param raw_msg The raw text that was sent when the log method was called
     * @param opt_data Any additional data that was sent with the log
     */
    LogRecord(StringView log, StringView logger_name, LogLevel level, StringView raw_msg, DataType* opt_data)
        : log { log },
          logger_name { logger_name },
          level { level },
          raw_msg { raw_msg } {
        if (opt_data == nullptr) {
            this->opt_data = std::nullopt;
        } else {
            const DataType& data_ref = *opt_data;
            this->opt_data = nlohmann::json { data_ref };
        }
    }

    /**
     * @brief Create `LogRecord` from it's parts. All strings will be copied. Includes no additional data.
     * @param log The formatted log that was created by the logger
     * @param logger_name The name of the logger that sent the log
     * @param level The level of the log
     * @param raw_msg The raw text that was sent when the log method was called
     */
    LogRecord(StringView log, StringView logger_name, LogLevel level, StringView raw_msg)
        : LogRecord(log, logger_name, level, raw_msg, nullptr) { }

    /**
     * @brief Default Copy Constructor
     */
    LogRecord(const LogRecord&) = default;
    /**
     * @brief Default Copy Assignment Operator
     */
    LogRecord& operator=(const LogRecord&) = default;
    /**
     * @brief Default Move Constructor
     */
    LogRecord(LogRecord&&) = default;
    /**
     * @brief Default Move Assignment Operator
     */
    LogRecord& operator=(LogRecord&&) = default;

    ~LogRecord() = default;

    /**
     * @brief Creates a clone of this `LogRecord` using the Copy Constructor.
     * @return A clone of `this` `LogRecord`
     */
    auto clone() -> LogRecord {
        auto cloned = LogRecord(*this);
        return cloned;
    }

    /**
     * @brief Whether this `LogRecord` has any additional data associated with it.
     * @return **true** if additional data was sent with the log, **false** otherwise.
     */
    [[nodiscard]] auto has_data() const -> bool { return opt_data.has_value(); }
};

namespace detail {
    constexpr inline auto log_level_to_string(LogLevel level) -> ::std::string_view {
        switch (level) {
        case LogLevel::Debug: return "DEBUG";
        case LogLevel::Info: return "INFO";
        case LogLevel::Warning: return "WARNING";
        case LogLevel::Error: return "ERROR";
        case LogLevel::Fatal: return "FATAL";
        }
    }
}  // namespace detail

class LogSink {
  public:
    // No Copying
    LogSink(const LogSink&) = delete;
    LogSink& operator=(const LogSink&) = delete;
    virtual ~LogSink() = default;

    virtual void recv_log(const LogRecord& log) = 0;

  protected:
    LogSink() = default;

    LogSink(LogSink&&) = default;
    LogSink& operator=(LogSink&&) = default;
};

class TestLogSink: public LogSink {
  public:
    using CollectionType = boost::circular_buffer<LogRecord>;
    const size_t DEFAULT_SIZE = 100;

    TestLogSink() = default;
    explicit TestLogSink(size_t size): logs_ { size } { }

    void recv_log(const LogRecord& record) override { logs_.push_back(record); }

    [[nodiscard]] auto get_log(size_t idx) -> LogRecord& { return logs_.at(idx); }

    [[nodiscard]] auto empty() const noexcept -> bool { return this->logs_.empty(); }
    [[nodiscard]] auto full() const noexcept -> bool { return this->logs_.full(); }
    [[nodiscard]] auto size() const noexcept -> size_t { return this->logs_.size(); }
    [[nodiscard]] auto capacity() const noexcept -> size_t { return this->logs_.capacity(); }

  private:
    CollectionType logs_ { DEFAULT_SIZE };
};

class ConsoleLogSink: public LogSink {
  public:
    void recv_log(const LogRecord& record) override { fmt::print("{}", record.log); }
};

template <typename T>
concept LogSinkType = std::is_base_of_v<LogSink, T>;

using RootMarker = std::void_t<>;
/**
 * @brief A logger.
 * @tparam T The type that owners the logger.
 */
template <typename T = RootMarker>
class Logger {
  public:
    using OwnerType = T;
    using Timestamp = std::chrono::system_clock::time_point;
    using String = std::string;
    using StringView = std::string_view;
    using LogSinkPtr = std::shared_ptr<LogSink>;
    using DataPtr = nlohmann::json*;

    Logger() = default;
    explicit Logger(String name) noexcept: name_ { std::move(name) } { }
    Logger(String name, std::vector<LogSinkPtr> sinks): name_ { std::move(name) }, sinks_ { std::move(sinks) } { }
    Logger(String name, std::vector<LogSinkPtr>&& sinks): name_ { std::move(name) }, sinks_ { std::move(sinks) } { }
    explicit Logger(std::vector<LogSinkPtr> sinks): sinks_ { std::move(sinks) } { }
    explicit Logger(LogSinkPtr sink): sinks_ { sink } { }
    Logger(Logger&&) noexcept = default;
    Logger(const Logger&) = default;
    Logger& operator=(Logger&&) noexcept = default;
    Logger& operator=(const Logger&) = default;
    virtual ~Logger() = default;

    /**
     * @brief Generate a timestamp for a log message
     * @return A std::chrono::system_clock::timepoint representing now
     */
    [[nodiscard]] static auto generate_timestamp() -> Timestamp { return std::chrono::system_clock::now(); }

    /**
     * @brief Converts the output of `generate_timestamp` to a timestamp string
     * @return A string containing the timestamp
     */
    [[nodiscard]] static auto generate_timestamp_str() -> String {
        return fmt::format("{:%Y%m%d_%H%M%S}", Logger::generate_timestamp());
    }

    /**
     * @brief Generates the log message prefix using `generate_timestamp_str`, the `LogLevel`, and the logger name
     * @param lvl The level of the log
     * @return A string containing the log prefix
     */
    virtual auto generate_prefix(LogLevel lvl) -> String {
        return fmt::format("[{}]:[{}]:[{}]", generate_timestamp_str(), detail::log_level_to_string(lvl), this->name_);
    }

    virtual void log(LogLevel level, StringView message, DataPtr data) {
        auto prefix = this->generate_prefix(level);
        auto log_msg = fmt::format("{} {}", prefix, message);
        auto record = LogRecord { log_msg, name_, level, message, data };
        std::for_each(sinks_.begin(), sinks_.end(), [&](const std::shared_ptr<LogSink>& sink) {
            sink->recv_log(record);
        });
    }

    /**
     * @brief Log a message at `Info` level
     * @param msg The message to log
     * @param data Any additional data that should be saved with the log
     */
    inline void info(StringView msg, DataPtr data = nullptr) { this->log(LogLevel::Info, msg, data); }
    /**
     * @brief Log a message at `Warning` level
     * @param msg The message to log
     * @param data Any additional data that should be saved with the log
     */
    inline void warn(StringView msg, DataPtr data = nullptr) { this->log(LogLevel::Warning, msg, data); }
    /**
     * @brief Log a message at `Error` level
     * @param msg The message to log
     * @param data Any additional data that should be saved with the log
     */
    inline void error(StringView msg, DataPtr data = nullptr) { this->log(LogLevel::Error, msg, data); }
    /**
     * @brief Log a message at `Debug` level
     * @param msg The message to log
     * @param data Any additional data that should be saved with the log
     */
    inline void debug(StringView msg, DataPtr data = nullptr) { this->log(LogLevel::Debug, msg, data); }
    /**
     * @brief Log a message at `Fatal` level
     * @param msg The message to log
     * @param data Any additional data that should be saved with the log
     */
    inline void fatal(StringView msg, DataPtr data = nullptr) { this->log(LogLevel::Fatal, msg, data); }
    /**
     * @brief Log a message if `condition` is false
     * @param msg The message to log (if assertion fails)
     * @param data Any additional data that should be saved with the log (if assertion fails)
     */
    inline void assertion(bool condition, StringView msg, DataPtr data = nullptr) {
        if (!condition) {
            this->fatal(msg, data);
        }
    }

    constexpr static std::string_view owner_type_name { nameof::nameof_type<OwnerType>() };
    constexpr static std::string_view owner_type_name_full { nameof::nameof_full_type<OwnerType>() };
    constexpr static std::string_view owner_type_name_short { nameof::nameof_short_type<OwnerType>() };

    [[nodiscard]] auto name() const noexcept -> StringView { return name_; }

    void add_sink(const std::shared_ptr<LogSink>& sink) { sinks_.emplace_back(sink); }

    /**
     * @brief Clears all sinks that this logger reports to and returns the number that were removed
     * @return [size_t] The number of sinks that were removed
     */
    auto clear_sinks() -> size_t {
        auto start = sinks_.size();
        sinks_.clear();
        return start - sinks_.size();
    }

    [[nodiscard]] auto sink_count() const noexcept -> size_t { return sinks_.size(); }

  private:
    std::string name_ { owner_type_name_short == "void" ? "root" : owner_type_name_short };
    std::vector<std::shared_ptr<LogSink>> sinks_;
};

}  // namespace pg::log