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

#include <string>
#include <utility>
#include <vector>

#include <boost/hana.hpp>

namespace pg::serde {

class Serializer {
  public:
    template<typename T>
    void serialize(const T& value) {
        boost::hana::for_each(boost::hana::accessors<T>(), [&](auto accessor) { serialize(accessor(value)); });
    }

    auto serialize_int(const int& value) -> std::vector<char> {
        return std::vector<char> { static_cast<char>(value >> 24),
                                   static_cast<char>(value >> 16),
                                   static_cast<char>(value >> 8),
                                   static_cast<char>(value) };
    }
};

}  // namespace pg::serde