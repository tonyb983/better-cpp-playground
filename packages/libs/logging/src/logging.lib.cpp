// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

#include <pg/log/logger.hpp>

namespace pg::log {
void _pg_logging_noop() {
    auto* logger = new Logger();
    logger->info("Here is a bullshit log message from _pg_logging_noop");
}
}  // namespace pg::log