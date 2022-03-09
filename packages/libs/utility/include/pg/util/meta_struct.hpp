// Copyright (c) 2022. Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//
// Content Borrowed From: https://github.com/google/cpp-from-the-sky-down/blob/master/meta_struct_20/cppcon_version/meta_struct.h

#pragma once

#include <algorithm>
#include <cstddef>
#include <optional>
#include <string_view>
#include <type_traits>

namespace ftsd {
namespace internal_meta_struct {

    struct no_init_fixed_string {};

    template <std::size_t N>
    struct fixed_string {
        constexpr fixed_string(const char (&foo)[N + 1]) {
            std::copy_n(foo, N + 1, data);
        }
        constexpr static auto from_string_view(std::string_view s) {
            fixed_string<N> fs{no_init_fixed_string{}};
            std::copy(s.begin(), s.end(), fs.data);
            return fs;
        }
        constexpr std::string_view sv() const { return std::string_view(data); }
        auto operator<=>(const fixed_string&) const = default;
        char data[N + 1] = {};

        constexpr fixed_string(no_init_fixed_string) : data{} {};

        constexpr std::size_t size()const { return N; }
    };
    template <std::size_t N>
    fixed_string(const char (&str)[N]) -> fixed_string<N - 1>;

    template <fixed_string Tag, typename T>
    struct tag_and_value {
        T value;
    };

    template <typename... Members>
    struct meta_struct_impl;


    template <typename... Members>
    struct meta_struct;

    template <typename... Members>
    meta_struct(Members...) -> meta_struct<Members...>;

    template <>
    struct meta_struct_impl<> {};



    template <>
    struct meta_struct<>:meta_struct_impl<> {};

    struct no_conversion {};
    template <typename... TagsAndValues>
    struct parms : TagsAndValues... {
        constexpr operator no_conversion() const { return no_conversion{}; }
    };

    template <typename... TagsAndValues>
    parms(TagsAndValues...) -> parms<TagsAndValues...>;

    template <typename T>
    struct default_init {
        constexpr default_init() = default;
        auto operator<=>(const default_init&) const = default;
        constexpr auto operator()() const {
            if constexpr (std::is_default_constructible_v<T>) {
                return T{};
            }
        }
    };

    template <fixed_string Tag,typename T, typename Self, typename F>
    constexpr auto call_init(Self&, F& f) requires(requires {
        { f() } -> std::convertible_to<T>;
    }) {
        return f();
    }

    template <fixed_string Tag,typename T, typename Self, typename F>
    constexpr auto call_init(Self& self, F& f) requires(requires {
        { f(self) } -> std::convertible_to<T>;
    }) {
        return f(self);
    }

    template <fixed_string Tag,typename T, typename Self, typename F>
    constexpr auto call_init(Self& self, F& f) requires(requires {
        { f() } -> std::same_as<void>;
    }) {
        static_assert(!std::is_same_v<decltype(f()), void>,
                      "Required argument not specified");
    }

    inline constexpr auto required = [] {};

    template <fixed_string Tag, typename T, auto Init = default_init<T>(),
              meta_struct Attributes = {}>
    struct member {
        constexpr static auto tag() { return Tag; }
        constexpr static auto init() { return Init; }
        constexpr static auto attributes() { return Attributes; }
        using element_type = T;
        T value;
        template <typename Self, typename OtherT>
        constexpr member(Self&, tag_and_value<Tag, OtherT> tv)
            : value(std::move(tv.value)) {}

        template <typename Self>
        constexpr member(Self& self, no_conversion)
            : value(call_init<Tag,T>(self, Init)) {}
        template <typename Self>
        constexpr member(Self& self,
                         tag_and_value<Tag, std::optional<std::remove_reference_t<T>>>
                           tv_or) requires(!std::is_reference_v<T>)
            : value(tv_or.value.has_value() ? std::move(*tv_or.value)
                                            : call_init<Tag,T>(self, Init)) {}

        template <typename Self, typename OtherT, auto OtherInit,
                  auto OtherAttributes>
        requires(std::is_convertible_v<OtherT, T>) constexpr member(
          Self&, const member<Tag, OtherT, OtherInit, OtherAttributes>& other)
            : value(other.value) {}

        template <typename Self, typename OtherT, auto OtherInit,
                  auto OtherAttributes>
        requires(std::is_convertible_v<OtherT, T>) constexpr member(
          Self&, member<Tag, OtherT, OtherInit, OtherAttributes>&& other)
            : value(std::move(other.value)) {}

        template <typename OtherT, auto OtherInit, auto OtherAttributes>
        requires(std::is_convertible_v<OtherT, T>) constexpr member& operator=(
          const member<Tag, OtherT, OtherInit, OtherAttributes>& other) {
            value = other.value;
            return *this;
        }

        template <typename OtherT, auto OtherInit, auto OtherAttributes>
        requires(std::is_convertible_v<OtherT, T>) constexpr member& operator=(
          member<Tag, OtherT, OtherInit, OtherAttributes>&& other) {
            value = std::move(other.value);
            return *this;
        }

        constexpr member(member&&) = default;
        constexpr member(const member&) = default;

        constexpr member& operator=(member&&) = default;
        constexpr member& operator=(const member&) = default;

        auto operator<=>(const member&) const = default;
    };

    template <typename... Members>
    struct meta_struct_impl: Members... {
        template <typename... Args>
        constexpr meta_struct_impl(parms<Args...> p)
            : Members(*this, std::move(p))... {}

        constexpr meta_struct_impl() : Members(*this, no_conversion{})... {}
        constexpr meta_struct_impl(meta_struct_impl&&) = default;
        constexpr meta_struct_impl(const meta_struct_impl&) = default;
        constexpr meta_struct_impl& operator=(meta_struct_impl&&) = default;
        constexpr meta_struct_impl& operator=(const meta_struct_impl&) = default;

        template <typename... OtherMembers>
        constexpr meta_struct_impl(meta_struct_impl<OtherMembers...>&& other)
            : Members(*this, std::move(other))... {};
        template <typename... OtherMembers>
        constexpr meta_struct_impl(const meta_struct_impl<OtherMembers...>& other)
            : Members(*this, other)... {};

        template <typename... OtherMembers>
        constexpr meta_struct_impl& operator=(
          meta_struct_impl<OtherMembers...>&& other) {
            ((static_cast<Members&>(*this) = std::move(other)), ...);
            return *this;
        };

        template <typename... OtherMembers>
        constexpr meta_struct_impl& operator=(
          const meta_struct_impl<OtherMembers...>& other) {
            ((static_cast<Members&>(*this) = other), ...);
            return *this;
        };

        constexpr operator no_conversion() const { return no_conversion{}; }

        auto operator<=>(const meta_struct_impl&) const = default;
    };

    template <typename... Members>
    struct meta_struct : meta_struct_impl<Members...> {
        using super = meta_struct_impl<Members...>;
        template <typename... TagsAndValues>
        constexpr meta_struct(TagsAndValues... tags_and_values)
            : super(parms(std::move(tags_and_values)...)) {}

        constexpr meta_struct() = default;
        constexpr meta_struct(meta_struct&&) = default;
        constexpr meta_struct(const meta_struct&) = default;
        constexpr meta_struct& operator=(meta_struct&&) = default;
        constexpr meta_struct& operator=(const meta_struct&) = default;

        template <typename... OtherMembers>
        constexpr meta_struct(meta_struct<OtherMembers...>&& other)
            : super(std::move(other)) {}

        template <typename... OtherMembers>
        constexpr meta_struct(const meta_struct<OtherMembers...>& other)
            : super(other) {}

        template <typename... OtherMembers>
        constexpr meta_struct& operator=(meta_struct<OtherMembers...>&& other) {
            static_cast<super&>(*this) = std::move(other);
            return *this;
        }

        template <typename... OtherMembers>
        constexpr meta_struct& operator=(const meta_struct<OtherMembers...>& other) {
            static_cast<super&>(*this) = other;
            return *this;
        }

        auto operator<=>(const meta_struct&) const = default;
    };

    template <fixed_string Tag>
    struct arg_type {
        template <typename T>
        constexpr auto operator=(T t) const {
            return member<Tag, T>(*this, tag_and_value<Tag, T>(std::move(t)));
        }
    };

    template <fixed_string Tag>
    inline constexpr auto arg = arg_type<Tag>{};

    template <typename F, typename... Members>
    constexpr decltype(auto) meta_struct_apply(F&& f,
                                               meta_struct_impl<Members...>& m) {
        return std::forward<F>(f)(static_cast<Members&>(m)...);
    }

    template <typename F, typename... Members>
    constexpr decltype(auto) meta_struct_apply(
      F&& f, const meta_struct_impl<Members...>& m) {
        return std::forward<F>(f)(static_cast<const Members&>(m)...);
    }

    template <typename F, typename... Members>
    constexpr decltype(auto) meta_struct_apply(F&& f,
                                               meta_struct_impl<Members...>&& m) {
        return std::forward<F>(f)(static_cast<Members&&>(m)...);
    }

    template <typename MetaStructImpl>
    struct apply_static_impl;

    template <typename... Members>
    struct apply_static_impl<meta_struct_impl<Members...>> {
        template <typename F>
        constexpr static decltype(auto) apply(F&& f) {
            return f(static_cast<Members*>(nullptr)...);
        }
    };

    template <typename MetaStruct, typename F>
    constexpr auto meta_struct_apply(F&& f) {
        return apply_static_impl<typename MetaStruct::super>::apply(
          std::forward<F>(f));
    }

    template <typename MetaStruct, typename F>
    constexpr void meta_struct_for_each(F&& f,MetaStruct&& ms) {
        meta_struct_apply(
          [&](auto&... m) mutable {
              (std::forward<F>(f)(m), ...);
          },
          std::forward<MetaStruct>(ms));
    }

    template <fixed_string tag, typename T, auto Init, auto Attributes>
    constexpr decltype(auto) get_impl(member<tag, T, Init, Attributes>& m) {
        return (m.value);
    }

    template <fixed_string tag, typename T, auto Init, auto Attributes>
    constexpr decltype(auto) get_impl(const member<tag, T, Init, Attributes>& m) {
        return (m.value);
    }

    template <fixed_string tag, typename T, auto Init, auto Attributes>
    constexpr decltype(auto) get_impl(member<tag, T, Init, Attributes>&& m) {
        return std::move(m.value);
    }

    template <fixed_string tag, typename MetaStruct>
    constexpr decltype(auto) get(MetaStruct&& s) {
        return get_impl<tag>(std::forward<MetaStruct>(s));
    }

    template <fixed_string tag, typename T, auto Init, auto Attributes>
    constexpr member<tag, T, Init, Attributes> get_member_impl(
      const member<tag, T, Init, Attributes>& m);

    template <fixed_string Tag, typename MetaStruct>
    constexpr auto get_attributes(MetaStruct&& s) {
        return decltype(get_member_impl(s))::attributes();
    }

    template <fixed_string Tag, typename MetaStruct>
    constexpr auto get_attributes() {
        return decltype(get_member_impl<Tag>(
          std::declval<MetaStruct&>()))::attributes();
    }

    template <fixed_string tag, typename T, auto Init, auto Attributes>
    constexpr std::true_type has_impl(const member<tag, T, Init, Attributes>&);

    template <fixed_string tag, typename T, auto Init, auto Attributes>
    constexpr std::false_type has_impl(no_conversion);

    template <fixed_string tag, typename MetaStruct>
    constexpr bool has(MetaStruct&& s) {
        return decltype(has_impl<tag>(s))::value;
    }

    template <fixed_string tag, typename MetaStruct>
    constexpr bool has() {
        return decltype(has_impl<tag>(std::declval<MetaStruct&>()))::value;
    }

    template <typename... Members>
    constexpr std::size_t meta_struct_size_impl(const meta_struct<Members...>*) {
        return sizeof...(Members);
    }

    template <typename... Members>
    constexpr std::size_t meta_struct_size(const meta_struct<Members...>&) {
        return sizeof...(Members);
    }

    template <typename MetaStruct>
    constexpr std::size_t meta_struct_size() {
        return meta_struct_size_impl(static_cast<const MetaStruct*>(nullptr));
    }

}  // namespace internal_meta_struct
using internal_meta_struct::arg;
using internal_meta_struct::fixed_string;
using internal_meta_struct::get;
using internal_meta_struct::get_attributes;
using internal_meta_struct::has;
using internal_meta_struct::member;
using internal_meta_struct::meta_struct;
using internal_meta_struct::meta_struct_apply;
using internal_meta_struct::meta_struct_size;
using internal_meta_struct::required;
using internal_meta_struct::default_init;

}  // namespace ftsd