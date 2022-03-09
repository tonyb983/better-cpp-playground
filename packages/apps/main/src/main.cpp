// Copyright (c) 2022. Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

#include <optional>
#include <sstream>
#include <vector>

#include <fmt/format.h>
#include <fmt/ranges.h>
#include <nameof.hpp>

#include <pg/stdfmt.hpp>

auto main() -> int {
    fmt::print("Hello from Main App!\n");
    auto something = fmt::format("Number is {}", 100);
    fmt::print("nameof_short_type = {}\n", nameof::nameof_short_type<decltype(something)>());
    fmt::print("      nameof_type = {}\n", nameof::nameof_type<decltype(something)>());
    fmt::print(" nameof_full_type = {}\n", nameof::nameof_full_type<decltype(something)>());
    auto coll = std::vector<int> { 1, 2, 3, 4, 6 };
    fmt::print("Collection: {}\n", coll);

    auto opt = std::make_optional(6);
    fmt::print("Optional: {}\n", opt);
    opt.reset();
    fmt::print("Optional: {}\n", opt);

    auto var = std::variant<int, double, std::string> { "Hello" };
    fmt::print("Variant: {}\n", var);
    var = 6;
    fmt::print("Variant: {}\n", var);

    return 0;
}
