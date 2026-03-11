/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// Thin wrapper around @tony.ganchev/eslint-plugin-header that removes
// `meta.defaultOptions`. The defaults are already applied in the rule's
// `normalizeOptions()`, but oxlint validates `defaultOptions` against the
// schema independently (unlike ESLint which merges first), causing a load
// failure.

"use strict";

const plugin = require("@tony.ganchev/eslint-plugin-header");

const { defaultOptions, ...meta } = plugin.rules.header.meta;

module.exports = {
    meta: { name: "eslint-plugin-header" },
    rules: {
        header: {
            ...plugin.rules.header,
            meta,
        },
    },
};
