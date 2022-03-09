// Copyright (c) 2022. Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

//
// Created by alexa on 2/10/2022.
//

#pragma once

#include <functional>
#include <memory>
#include <vector>

#include <fmt/format.h>
#include <nameof.hpp>

namespace pg::util {
struct InPlaceT {
    explicit InPlaceT() = default;
};
constexpr InPlaceT InPlace {};

template <typename T>
struct Value {
    template <typename U>
    struct is_derived: public std::integral_constant<bool, std::is_base_of<T, std::decay_t<U>>::value> { };

    Value() = default;

    // Copy constructors
    template <typename U, typename UU = std::decay_t<U>, typename = std::enable_if_t<is_derived<U>::value>>
    Value(const Value<U>& other): container_(other.container_),
                                  copy_container_(&Value::make_shared_helper<UU>) { }

    template <typename U, typename UU = std::decay_t<U>, typename = std::enable_if_t<is_derived<U>::value>>
    Value(const U& arg): container_(std::make_shared<UU>(arg)),
                         copy_container_(&Value::make_shared_helper<UU>) { }

    // Move constructors
    template <typename U, typename UU = std::decay_t<U>, typename = std::enable_if_t<is_derived<U>::value>>
    Value(Value<U>&& other)
        : container_(std::move(other.container_)),
          copy_container_(&Value::make_shared_helper<UU>) { }

    template <typename U, typename UU = std::decay_t<U>, typename = std::enable_if_t<is_derived<U>::value>>
    Value(U&& value)
        : container_(std::make_shared<UU>(std::forward<U>(value))),
          copy_container_(&Value::make_shared_helper<UU>) { }

    // Copy assignment
    template <typename U, typename UU = std::decay_t<U>, typename = std::enable_if_t<is_derived<U>::value>>
    Value& operator=(const Value<U>& other) {
        container_ = std::make_shared<UU>(*other.container_);
        copy_container_ = &Value::make_shared_helper<UU>;
        return *this;
    }

    template <typename U, typename UU = std::decay_t<U>, typename = std::enable_if_t<is_derived<U>::value>>
    Value& operator=(const U& value) {
        container_ = std::make_shared<UU>(value);
        copy_container_ = &Value::make_shared_helper<UU>;
        return *this;
    }

    // Move assignment
    template <typename U, typename UU = std::decay_t<U>, typename = std::enable_if_t<is_derived<U>::value>>
    Value& operator=(Value<U>&& other) {
        container_ = std::make_shared<UU>(std::move<std::shared_ptr<UU>>(*other.container_));
        copy_container_ = &Value::make_shared_helper<UU>;
        return *this;
    }

    template <typename U, typename UU = std::decay_t<U>, typename = std::enable_if_t<is_derived<U>::value>>
    Value& operator=(U&& value) {
        container_ = std::make_shared<UU>(std::forward<U>(value));
        copy_container_ = &Value::make_shared_helper<UU>;
        return *this;
    }

    template <typename... Args>
    Value(InPlaceT _in_place, Args&&... args)
        : container_(std::make_shared<T>(std::forward<Args>(args)...)),
          copy_container_(&Value::make_shared_helper<T>) { }

    template <typename U>
    [[nodiscard]] bool can_convert() const {
        // auto typed_container = std::dynamic_pointer_cast<const U>(container_);
        return static_cast<bool>(std::dynamic_pointer_cast<const U>(container_) != nullptr);
    }

    const T& operator*() const { return *container_; }

    const T& get() const { return *container_; }

    template <typename U>
    U* as() {
        if (container_ == nullptr) {
            return nullptr;
        }
        if (container_.use_count() != 1) {
            container_ = copy_container_(container_);
        }
        auto typed_container = std::dynamic_pointer_cast<U>(container_);
        if (typed_container == nullptr) {
            auto err_msg = fmt::format("Cannot cast from {} to {}", nameof::nameof_type<T>(), nameof::nameof_type<U>());
            throw std::runtime_error(err_msg);
        }
        return typed_container.get();
    }

    const T* operator->() const { return container_.get(); }

    T* operator->() {
        if (container_ == nullptr) {
            return nullptr;
        }
        if (container_.use_count() != 1) {
            container_ = copy_container_(container_);
        }
        return container_.get();
    }

    template <typename U>
    static std::shared_ptr<T> make_shared_helper(std::shared_ptr<T> input) {
        auto typed_container = std::static_pointer_cast<U>(input);
        return make_shared<U>(*typed_container);
    }

  private:
    std::shared_ptr<T> container_;

    std::function<std::shared_ptr<T>(std::shared_ptr<T>)> copy_container_;

    template <typename U>
    friend struct Value;
};

}  // namespace pg::util
