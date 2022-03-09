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

#include <memory>

#include <pg/util/guard.hpp>

#include <gtest/gtest.h>

namespace {
struct Number {
    size_t value;
};

TEST(ScopeGuardTests, ScopeGuardWorksNormally) {
    auto* number = new std::shared_ptr<Number>(new Number { 0 });

    EXPECT_EQ(0, number->get()->value);

    {
        auto guard = sg::make_scope_guard([&number] { number->get()->value += 1; });
    }

    EXPECT_EQ(1, number->get()->value);
}

struct ScopeGuardTestFailure: std::runtime_error {
    ScopeGuardTestFailure() : std::runtime_error("ScopeGuardTestFailure") {}
};

TEST(ScopeGuardTests, ScopeGuardWorksWithException) {
    auto* number = new std::shared_ptr<Number>(new Number { 0 });

    EXPECT_EQ(0, number->get()->value);

    EXPECT_THROW(
        {
            auto guard = sg::make_scope_guard([&number] { ASSERT_EQ(1, number->get()->value); });
            number->get()->value += 1;
            throw ScopeGuardTestFailure();
        },
        ScopeGuardTestFailure);

    EXPECT_EQ(1, number->get()->value);
}

}  // namespace