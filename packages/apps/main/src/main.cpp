// Copyright (c) 2022. Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

#include <pg/stdfmt.hpp>
#include <pg/types.hpp>
#include <pg/util/debug.hpp>

using namespace pg::types;

auto main() -> i32 {
    fmt::print("Hello from Main App!\n");
    auto something = fmt::format("Number is {}", 100);
    fmt::print("{}\n", pg::util::PgDebug::type_and_value(something, "something"));
    auto coll = std::vector<i32> { 1, 2, 3, 4, 6 };
    fmt::print("Collection: {}\n", coll);

    auto opt = std::make_optional(6);
    fmt::print("Optional: {}\n", opt);
    opt.reset();
    fmt::print("Optional: {}\n", opt);

    auto var = std::variant<i32, f64, String> { "Hello" };
    fmt::print("Variant: {}\n", var);
    var = 6;
    fmt::print("Variant: {}\n", var);

    return 0;
}
