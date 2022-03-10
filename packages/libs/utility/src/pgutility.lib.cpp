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

#include <pg/util/concepts.hpp>
#include <pg/util/debug.hpp>
#include <pg/util/describe.hpp>
#include <pg/util/guard.hpp>
#include <pg/util/lazy.hpp>
#include <pg/util/meta.hpp>
#include <pg/util/result.hpp>
#include <pg/util/static_warning.hpp>
#include <pg/util/Trait.hpp>
#include <pg/util/Value.hpp>

namespace pg::util {

void _pg_utility_noop() {
    auto guard = sg::make_scope_guard([]() {});

    pg::util::meta::are_same<int, bool, char>();
    pg::util::meta::is_any<int, bool, double>();
}
}  // namespace pg::util