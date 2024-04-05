/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { findIndexOfElement } from '@/components/util/findIndexOfElement.ts';

// fieldToSearch  string | any[]
export const findElement = <T>(
    elements: T[],
    fieldToSearch: string,
    fieldToMatch: unknown,
    isFieldToSearchArray?: boolean,
): T | undefined => {
    // let ElementFoundIndex: number;

    // if (isFieldToSearchArray) {
    //     ElementFoundIndex = elements.findIndex((element: T | any) =>
    //         element[fieldToSearch].some((field: any) => field === fieldToMatch),
    //     );
    // } else {
    //     // do a some() logic checking for boolean, so fieldToMatch fieldToMatch
    //     ElementFoundIndex = elements.findIndex((element: T | any) => element[fieldToSearch] === fieldToMatch);
    // }
    const index = findIndexOfElement(elements, fieldToSearch, fieldToMatch, isFieldToSearchArray);

    if (!index) {
        return undefined;
    }
    return elements[index];
};
