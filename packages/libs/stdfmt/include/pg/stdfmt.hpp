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

#pragma once

#include <cassert>
#include <optional>
#include <type_traits>
#include <variant>

#include <fmt/format.h>
#include <nameof.hpp>


template <typename T>
struct fmt::formatter<std::optional<T>, std::enable_if_t<fmt::is_formattable<T>::value, char>>
    : fmt::formatter<std::string> {
    template <typename FormatCtx>
    auto format(const std::optional<T>& opt, FormatCtx& ctx) {
        return opt ? formatter<std::string>::format(fmt::format("{}({})", NAMEOF_TYPE_EXPR(opt), *opt), ctx)
                   : formatter<std::string>::format(fmt::format("{}(None)", NAMEOF_TYPE_EXPR(opt)), ctx);
    }
};

template <typename... Ts>
struct fmt::formatter<std::variant<Ts...>>: fmt::dynamic_formatter<> {
    auto format(const std::variant<Ts...>& v, fmt::format_context& ctx) {
        return std::visit(
          [&](const auto& val) {
              return dynamic_formatter<>::format(fmt::format("{}({})", NAMEOF_TYPE_EXPR(v), val), ctx);
          },
          v);
    }
};

auto get_type_and_value(auto value) -> std::string {
    return fmt::format("{}({})", NAMEOF_TYPE_EXPR(value), value);
}

auto print_type_and_value(auto value) -> void {
    fmt::print("{}", get_type_and_value(value));
}