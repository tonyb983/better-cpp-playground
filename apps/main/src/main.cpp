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
#include <sstream>
#include <vector>

#include <fmt/format.h>
#include <fmt/ranges.h>

#include <pg/stdfmt.hpp>

auto main() -> int {
    fmt::print("Hello from Main App!");
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
