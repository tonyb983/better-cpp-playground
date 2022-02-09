// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

#pragma once

#include <chrono>
#include <source_location>
#include <string>
#include <string_view>
#include <vector>

#include <fmt/chrono.h>
#include <fmt/format.h>
#include <nameof.hpp>

namespace pg::log {

    enum class LogLevel { Debug, Info, Warning, Error, Fatal };

    namespace detail {
        auto log_level_to_string(LogLevel level) -> ::std::string_view {
            switch (level) {
                case LogLevel::Debug:
                    return "DEBUG";
                case LogLevel::Info:
                    return "INFO";
                case LogLevel::Warning:
                    return "WARNING";
                case LogLevel::Error:
                    return "ERROR";
                case LogLevel::Fatal:
                    return "FATAL";
            }
        }
    }  // namespace detail

    class LogSink {
      public:
        // No Copying
        LogSink(const LogSink&) = delete;
        LogSink& operator=(const LogSink&) = delete;
        virtual ~LogSink() = default;

        virtual void recv_log(std::string_view logger_name, LogLevel level, std::string_view msg) = 0;

      protected:
        LogSink() = default;

        LogSink(LogSink&&) = default;
        LogSink& operator=(LogSink&&) = default;
    };

    template<typename T>
    class Logger {
      public:
        using OwnerType = T;
        using Timestamp = std::chrono::system_clock::time_point;

        Logger() = default;
        Logger(Logger&&) noexcept = default;
        Logger(const Logger&) = default;
        Logger& operator=(Logger&&) noexcept = default;
        Logger& operator=(const Logger&) = default;
        ~Logger() = default;

        [[nodiscard]] static auto generate_timestamp() -> Timestamp {
            return std::chrono::system_clock::now();
        }

        [[nodiscard]] static auto generate_timestamp_str() -> std::string {
            return fmt::format("{:%Y%m%d_%H%M%S}", Logger::generate_timestamp());
        }

        virtual void log(LogLevel level, const char* message) {
            auto ts = std::chrono::system_clock::now();
        };

        constexpr static std::string_view owner_type_name { nameof::nameof_type<OwnerType>() };
        constexpr static std::string_view owner_type_name_full { nameof::nameof_full_type<OwnerType>() };
        constexpr static std::string_view owner_type_name_short { nameof::nameof_short_type<OwnerType>() };
        std::string name;
    };

}  // namespace pg::log