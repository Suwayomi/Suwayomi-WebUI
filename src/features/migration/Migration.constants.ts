/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { SortBy, SortOrder } from '@/features/migration/Migration.types.ts';

export const sortByToTranslation: Record<SortBy, MessageDescriptor> = {
    [SortBy.SOURCE_NAME]: msg`By source name`,
    [SortBy.MANGA_COUNT]: msg`By manga count`,
};

export const sortOrderToTranslation: Record<SortBy, MessageDescriptor> = {
    [SortOrder.ASC]: msg`Ascending`,
    [SortOrder.DESC]: msg`Descending`,
};

export const DEFAULT_SORT_SETTINGS = {
    sortBy: SortBy.SOURCE_NAME,
    sortOrder: SortOrder.ASC,
};
