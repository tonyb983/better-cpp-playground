// Copyright (c) 2022. Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

//
// Created by alexa on 2/10/2022.
//

#pragma once
#ifndef PLAYGROUND_TRAIT_HPP
#define PLAYGROUND_TRAIT_HPP

#include <functional>
#include <memory>

namespace pg::util {

struct Trait {
  public:
    Trait(const Trait& trait) = default;
    Trait(Trait&& trait) = default;
    Trait& operator=(const Trait& trait) = default;
    Trait& operator=(Trait&& trait) = default;
    virtual ~Trait() = default;

    template <typename T>
    explicit Trait(T input): container_ { std::make_shared<Model<T>>(std::move(input)) } { }

    template <typename T>
    T cast() {
        auto typed_container = std::static_pointer_cast<const Model<T>>(container_);
        return typed_container->data_;
    }

  private:
    struct TraitInner {
        // All need to be explicitly defined just to make the destructor virtual
        TraitInner() = default;
        TraitInner(const TraitInner& inner) = default;
        TraitInner(TraitInner&& inner) = default;
        TraitInner& operator=(const TraitInner& inner) = default;
        TraitInner& operator=(TraitInner&& inner) = default;
        virtual ~TraitInner() = default;
    };

    template <typename T>
    struct Model: public TraitInner {
        explicit Model(T input): data_ { std::move(input) } { }
        T data_;
    };

    std::shared_ptr<const TraitInner> container_;
};

} // namespace pg::util

#endif  // PLAYGROUND_TRAIT_HPP
