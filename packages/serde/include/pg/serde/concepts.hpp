// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

#include <concepts>
#include <type_traits>
#include <vector>

#include <nlohmann/json.hpp>

namespace pg::serde {

using JsonType = nlohmann::json;

template<typename T>
concept Serializer = std::same_as<T, T>;

template<typename T>
concept Deserializer = std::same_as<T, T>;

/// @brief Serialize a value using the given serializer
/// @tparam T The type of value being serialized
/// @tparam TSerializer The serializer type
/// @param ser The serializer (as ref)
/// @param value The value being serialized (as const ref)
/// @return void Nothing
template<typename T, typename TSerializer>
auto serialize(TSerializer& ser, const T& value) -> void;

/**
 * @brief Deserialize a value using the given deserializer.
 * @tparam T The type of value being deserialized
 * @tparam TDeserializer The deserializer type
 * @param de The deserializer (as const ref)
 * @param value The value in which to deserialize (as ref)
 * @return void Nothing
 */
template<typename T, typename TDeserializer>
auto deserialize(const TDeserializer& de, T& value) -> void;

/**
 * @brief Serialize a value using the the nlohmann json library.
 * @tparam T The type of value being serialized
 * @param json The json object (as ref) 
 * @param value The value being serialized (as const ref)
 */
template<typename T, class J>
auto serialize(typename std::enable_if<std::is_same<J, JsonType>::value, void>::type& json, const T& value) -> void;

template<typename T>
auto from_json(const JsonType& json, T& value) -> void;

template<typename T>
auto to_json(JsonType& json, const T& value) -> void;

template<typename T>
concept HasToJson = requires(const T& value) {
    { value.to_json() } -> std::same_as<JsonType>;
};

template<typename T>
concept HasFromJson = requires(T& value) {
    { T::from_json(JsonType {}) } -> std::same_as<T>;
};

template<typename T, typename TSer>
concept Serializable = requires(TSer& ser, const T& value) {
    { serde::serialize(ser, value) };
};

template<typename T, typename TDe>
concept Deserializable = requires(const TDe& de, T& value) {
    { serde::deserialize<T>(de, value) };
};

namespace detail {
    struct SomeValueType {
        int value;
        bool flag;
        float pi;

        [[nodiscard]] auto to_json() const -> JsonType {
            return JsonType { { "value", this->value }, { "flag", this->flag }, { "pi", this->pi } };
        }

        [[nodiscard]] static auto from_json(const JsonType& json) -> SomeValueType {
            auto n = SomeValueType {};
            json.at("value").get_to(n.value);
            json.at("flag").get_to(n.flag);
            json.at("pi").get_to(n.pi);
            return n;
        }
    };

    static_assert(HasToJson<SomeValueType>, "SomeValueType must be serializable to json");
    static_assert(HasFromJson<SomeValueType>, "SomeValueType must be deserializable from json");
}  // namespace detail

}  // namespace pg::serde
