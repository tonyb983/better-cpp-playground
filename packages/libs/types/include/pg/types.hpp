
#pragma once
#include <array>
#include <cstdint>
#include <functional>
#include <memory>
#include <mutex>
#include <optional>
#include <shared_mutex>
#include <source_location>
#include <span>
#include <string>
#include <string_view>
#include <tuple>
#include <utility>
#include <variant>
#include <vector>

#include <fmt/chrono.h>
#include <fmt/color.h>
#include <fmt/format.h>
#include <fmt/ranges.h>

#include <parallel_hashmap/phmap.h>
#include <stx/option.h>
#include <stx/result.h>

namespace pg::types {

using u8 = std::uint8_t;
using u16 = std::uint16_t;
using u32 = std::uint32_t;
using u64 = std::uint64_t;
using usize = std::size_t;

using i8 = std::int8_t;
using i16 = std::int16_t;
using i32 = std::int32_t;
using i64 = std::int64_t;
using isize = std::ptrdiff_t;

using f32 = float;
using f64 = double;

using String = std::string;
using StringView = std::string_view;

template <typename T>
using Option = std::optional<T>;
constexpr inline auto None = std::nullopt;

template <typename T>
using Vec = std::vector<T>;

template <typename Key, typename Value>
using HashMap = phmap::parallel_flat_hash_map<Key, Value>;

template <typename T>
using HashSet = phmap::parallel_flat_hash_set<T>;

template <typename T>
constexpr inline bool is_reference = std::is_reference<T>::value;

/// `Ref` is an alias for `std::reference_wrapper`
/// `Ref` can be mutable and immutable depending on the const-qualifier for `T`
/// To offer stronger guarantees prefer `ConstRef` and `MutRef`
template <typename T>
using Ref = std::reference_wrapper<T>;

/// `ConstRef` is an always-const `Ref`.
template <typename T>
using ConstRef = std::reference_wrapper<std::add_const_t<std::remove_reference_t<T>>>;

/// `MutRef` is an always-mutable `Ref`
template <typename T>
using MutRef = std::reference_wrapper<std::remove_const_t<std::remove_reference_t<T>>>;

template <typename T>
using Unique = std::unique_ptr<T>;

template <typename T>
using Rc = std::shared_ptr<T>;

template <typename T>
using Arc = std::atomic<std::shared_ptr<T>>;

using Mutex = std::mutex;
using RwLock = std::shared_mutex;
using RwReadLock = std::shared_lock<RwLock>;
using RwWriteLock = std::unique_lock<RwLock>;

}  // namespace pg::types