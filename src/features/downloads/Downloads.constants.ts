/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { d } from 'koration';

export const DOWNLOAD_AHEAD = {
    min: 2,
    max: 10,
    default: 2,
    step: 1,
};

export const DOWNLOAD_CONVERSION_COMPRESSION = {
    min: 0,
    max: 1,
    step: 0.01,
};

export const IMAGE_CONVERSION_CALL_TIMEOUT = {
    min: d(10).seconds.inWholeSeconds,
    max: d(10).minutes.inWholeSeconds,
    step: d(10).seconds.inWholeSeconds,
};

export const IMAGE_CONVERSION_CONNECT_TIMEOUT = {
    min: d(10).seconds.inWholeSeconds,
    max: d(10).minutes.inWholeSeconds,
    step: d(10).seconds.inWholeSeconds,
};
