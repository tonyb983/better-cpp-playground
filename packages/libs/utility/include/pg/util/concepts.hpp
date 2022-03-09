// Copyright (c) 2022. Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

//
// Created by alexa on 2/10/2022.
//

#pragma once
#ifndef PLAYGROUND_CONCEPTS_HPP
#define PLAYGROUND_CONCEPTS_HPP

#include <concepts>

namespace pg::util {

template <typename T>
concept Cloneable = requires(const T& value) {
    { value.clone() } -> std::same_as<std::remove_cvref_t<T>>;
};

}

#endif  // PLAYGROUND_CONCEPTS_HPP
