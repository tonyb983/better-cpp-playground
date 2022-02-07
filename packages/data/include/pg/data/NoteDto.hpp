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
#include <utility>
#include <vector>

#include <boost/uuid/uuid.hpp>
#include <boost/uuid/uuid_generators.hpp>

namespace pg::data {

struct CreateNote {
    std::optional<std::string> title;
    std::optional<std::string> content;
    std::optional<std::vector<std::string>> tags;

    CreateNote() = default;
    CreateNote(
        std::optional<std::string> title,
        std::optional<std::string> content,
        std::optional<std::vector<std::string>> tags)
        : title(std::move(title)),
          content(std::move(content)),
          tags(std::move(tags)) {}
};  // struct CreateNote

/**
 * Update Note DTO
 * 
 * Used to update an existing note.
 */
struct UpdateNote {
  private:
    boost::uuids::uuid id_;
    std::optional<std::string> title_;
    std::optional<std::string> content_;
    std::optional<std::vector<std::string>> tags_;

  public:
    UpdateNote() = delete;
    UpdateNote(boost::uuids::uuid id) : id_ { id } {}
    UpdateNote(boost::uuids::uuid id, std::string title, std::string content, std::vector<std::string> tags)
        : id_ { id },
          title_ { std::move(title) },
          content_ { std::move(content) },
          tags_ { std::move(tags) } {}
    UpdateNote(
        boost::uuids::uuid id,
        std::optional<std::string> title,
        std::optional<std::string> content,
        std::optional<std::vector<std::string>> tags)
        : id_ { id },
          title_ { std::move(title) },
          content_ { std::move(content) },
          tags_ { std::move(tags) } {}

    /** Get the target id for this update. */
    auto id() const -> boost::uuids::uuid {
        return this->id_;
    }

    /** 
     * Title will be `some` if the note title should be changed, `none` if it should remain unchanged.
     */
    auto title() const -> std::optional<std::string> {
        return this->title_;
    }

    /**
     * Content will be `some` if the note content should be changed, `none` if it should remain unchanged.
     */
    auto content() const -> std::optional<std::string> {
        return this->content_;
    }

    /** 
     * Tags will be `some` if the note tags should be changed, `none` if they should remain unchanged.
     */
    auto tags() const -> std::optional<std::vector<std::string>> {
        return this->tags_;
    }
};  // struct UpdateNote

struct DeleteNote {
  private:
    boost::uuids::uuid id_;

  public:
    DeleteNote() = delete;
    DeleteNote(boost::uuids::uuid id) : id_ { id } {}

    /** Get the target id for this delete. */
    auto id() const -> boost::uuids::uuid {
        return this->id_;
    }
};  // struct DeleteNote

}  // namespace pg::data