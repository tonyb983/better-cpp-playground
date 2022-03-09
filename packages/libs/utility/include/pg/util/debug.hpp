// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

#pragma once

#include <concepts>
#include <optional>
#include <string>
#include <type_traits>

#include <fmt/format.h>
#include <nameof.hpp>

#include <pg/util/describe.hpp>

namespace pg::util {

template <typename T>
concept Debuggable = fmt::is_formattable<T>::value;

class PgDebug {
  public:
    template <typename T>
    static std::string type_and_value(T& input, std::optional<std::string_view> label = std::nullopt) requires
      fmt::is_formattable<T>::value {
        if (label.has_value()) {
            return fmt::format("{}: {} ({})", label->data(), input, describe<T>());
        } else {
            return fmt::format("{} ({})", input, describe<T>());
        }
    }
};

namespace detail {
    /// Testing Compile-time Failure.
    /// Source:
    /// https://stackoverflow.com/questions/7282350/how-to-unit-test-deliberate-compilation-errors-of-template-code
    /// Arbitrary restrictions in order to test:
    /// if T != double -> zero args
    template <typename T>
    void func() {};
    /// if T == double -> arbitrary args.
    template <std::same_as<double>... T>
    void func(T... as) {};
    template <typename T, typename... a>
    constexpr bool applies_to_func = requires(a... as) {
        func<T>(as...);
    };
}  // namespace detail

template <typename T>
constexpr bool can_be_pg_debugged = requires(T v) {
    PgDebug::type_and_value(v);
};

template <typename T>
constexpr bool cannot_be_pg_debugged = !requires(T v) {
    PgDebug::type_and_value(v);
};

}  // namespace pg::util