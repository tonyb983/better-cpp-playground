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

#include <optional>
#include <string>
#include <string_view>
#include <tuple>
#include <variant>
#include <vector>

namespace pg::parse {
using String = std::string;
template <typename T>
using Option = std::optional<T>;
using Query = std::tuple<String, Option<String>>;
template <typename T>
using Vec = std::vector<T>;

struct Ip4Address {
    uint8_t octet1;
    uint8_t octet2;
    uint8_t octet3;
    uint8_t octet4;
};

struct Ip6Address {
    uint16_t octet1;
    uint16_t octet2;
    uint16_t octet3;
    uint16_t octet4;
    uint16_t octet5;
    uint16_t octet6;
    uint16_t octet7;
    uint16_t octet8;
};

struct Hostname {
    String value;
};

using Host = std::variant<Ip4Address, Ip6Address, Hostname>;

struct UserInfo {
    Option<String> username;
    Option<String> password;
};  // class UserInfo

struct Authority {
    Option<UserInfo> user_info;
    Option<Host> host;
    Option<String> port;
};  // class Authority

struct Uri {
    String scheme;
    String path;
    Option<Authority> authority;
    Vec<Query> queries;
    Option<String> fragment;
};  // class Uri

class PathParser {
  public:
    static auto parse_path(std::string_view input) -> Uri;
};  // class Tag

}  // namespace pg::parse