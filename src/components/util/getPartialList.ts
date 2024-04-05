/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { findIndexOfElement } from '@/components/util/findIndexOfElement.ts';

/**
 *@description This function takes a element's id and a list of the same element, and it return either the first
 of second half of the list using the element id as the pivot point.
 * @param elementId The Id of the emeent to be use as pivot.
 * @param allElements The list of elements to be firtered.
 * @param halfOfList There part of the list to be return. Either the first half or the second.
 * @param indexOffset The offsett to set for the index. By default set to 1, so the first have will not include the pivot element
 * and the second half will include the first element.
 * @returns The first of the second half of a list using the elementId passed as the pivots.
 */
export const getPartialList = <T>(
    elementId: number,
    allElements: T[],
    halfOfList: 'first' | 'second' = 'first',
    indexOffset: number = 1,
): T[] => {
    const index = findIndexOfElement(allElements, 'id', elementId);
    if (index === undefined) {
        return [] as T[];
    }
    if (halfOfList === 'second') {
        if (index + indexOffset > allElements.length - 1) {
            return [] as T[];
        }
        return allElements.slice(index + indexOffset);
    }

    return allElements.slice(0, index + indexOffset);
};
