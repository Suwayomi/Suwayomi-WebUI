/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { findIndexOfElement } from '@/components/util/findIndexOfElement.ts';

export const getPartialList = <T>(
    elementId: number,
    allEmenets: T[],
    halfOfList: 'first' | 'second' = 'first',
    indexOffset: number = 1,
): T[] => {
    const index = findIndexOfElement(allEmenets, 'id', elementId);
    if (!index) {
        return [] as T[];
    }
    if (halfOfList === 'second') {
        if (index + indexOffset > allEmenets.length - 1) {
            return [] as T[];
        }
        return allEmenets.slice(index + indexOffset);
    }

    return allEmenets.slice(0, index - indexOffset);
};
