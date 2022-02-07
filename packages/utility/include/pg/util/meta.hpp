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

#include <type_traits>

namespace pg {
namespace utility {
    namespace meta {

        template<class T, class... Ts>
        struct is_any: std::disjunction<std::is_same<T, Ts>...> {};

        template<class T, class... Ts>
        struct are_same: std::conjunction<std::is_same<T, Ts>...> {};

    }  // namespace meta
}  // namespace utility
}  // namespace pg