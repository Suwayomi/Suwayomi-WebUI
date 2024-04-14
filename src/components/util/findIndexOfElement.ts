/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 *
 * @param elements The array that will be search
 * @param fieldToSearch The key of the elements that will be search
 * @param fieldToMatch The value the fieldToSearch key needs to match
 * @param isFieldToSearchArray Whether the key of the fieldToSearch is an array or not. Default to false
 * @example findIndexOfElement(mangas, "id", passedManga.id)
 * @returns The index of the element if found, or undefine if not found.
 */
export const findIndexOfElement = <T>(
    elements: T[],
    fieldToSearch: string,
    fieldToMatch: unknown,
    isFieldToSearchArray: boolean = false,
): number | undefined => {
    let elementFoundIndex: number;

    if (isFieldToSearchArray) {
        elementFoundIndex = elements.findIndex((element: T | any) =>
            element[fieldToSearch].some((field: any) => field === fieldToMatch),
        );
    } else {
        // do a some() logic checking for boolean, so fieldToMatch fieldToMatch
        elementFoundIndex = elements.findIndex((element: T | any) => element[fieldToSearch] === fieldToMatch);
    }
    return elementFoundIndex;
};
