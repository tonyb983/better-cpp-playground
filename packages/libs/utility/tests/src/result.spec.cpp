// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

#include <algorithm>
#include <array>
#include <ranges>
#include <string>
#include <string_view>

#include <fmt/format.h>

#include <gtest/gtest.h>

#include <pg/util/result.hpp>

namespace {

namespace bws = cpp::bitwizeshift;

struct TestingError {
    std::string_view message;

    TestingError(): message("No error") { }
    TestingError(std::string_view message): message(message) { }
};

void iota(auto& v, int n) {
    std::ranges::generate(v, [&n]() mutable { return n++; });
}

template <typename T>
auto do_success_of(T input) -> cpp::result<T, TestingError> {
    return input;
}

auto do_success() -> cpp::result<int, TestingError> {
    return do_success_of(42);
}

auto int_to_string(int input) -> std::string {
    return std::to_string(input);
}

auto try_int_to_string(int input) -> cpp::result<std::string, TestingError> {
    return std::to_string(input);
}

auto fail_int_to_string(int) -> cpp::result<std::string, TestingError> {
    return cpp::failure("I refuse to convert this number to a string");
}

auto do_failure() -> cpp::result<int, TestingError> {
    return cpp::failure("Function returned failure");
}

void print(std::string_view comment, const auto& v) {
    fmt::print("{}", comment);
    for (int i: v) {
        fmt::print("{} ", i);
    }
    fmt::print("\n");
}

TEST(ResultTests, FailureHasError) {
    EXPECT_TRUE(do_failure().has_error());
}

TEST(ResultTests, SuccessHasNoError) {
    EXPECT_FALSE(do_success().has_error());
}

TEST(ResultTests, SuccessMapWorks) {
    auto result = do_success().map(int_to_string);
    EXPECT_EQ(result, "42");
}

TEST(ResultTests, SuccessFlatMapWorks) {
    auto result = do_success().flat_map(try_int_to_string);

    EXPECT_TRUE(result.has_value()) << "Result should have a value";
    EXPECT_EQ(result, "42") << "Result should contain the string '42'";
    if (result) {
        EXPECT_TRUE(true) << "Implicit conversion from result to bool succeeded";
    } else {
        EXPECT_TRUE(false) << "Implicit conversion to bool failed";
    }
}

TEST(ResultTests, MappingLotsOfNumbersWorks) {
#define let auto
    std::array<int, 100> numbers;
    iota(numbers, 0);
    // print("Numbers: ", numbers);
    std::ranges::for_each(numbers, [](auto& n) {
        if (n % 3 == 0) {
            cpp::result<std::string, TestingError> result = do_success_of(n).map(int_to_string);
            EXPECT_TRUE(result.has_value()) << "Result should have a value";
            EXPECT_EQ(result, std::to_string(n)) << "Result should contain the string of the number n";
        } else if (n % 3 == 1) {
            cpp::result<std::string, TestingError> result = do_success_of(n).flat_map(try_int_to_string);
            EXPECT_TRUE(result.has_value()) << "Result should have a value";
            EXPECT_EQ(result, std::to_string(n)) << "Result should contain the string of the number n";
        } else if (n % 3 == 2) {
            cpp::result<std::string, TestingError> result = do_success_of(n).flat_map(fail_int_to_string);
            EXPECT_TRUE(result.has_error()) << "Result should have an error";
            EXPECT_EQ(result.error().message, "I refuse to convert this number to a string")
              << "Result should contain bitchy error message";
        }
    });
}

}  // namespace