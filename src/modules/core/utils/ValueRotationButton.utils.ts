/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export const getNextRotationValue = <Value>(
    indexOfValue: number,
    values: Value[],
    isDefaultable?: boolean,
): Value | undefined => {
    const nextValueIndex = (indexOfValue + 1) % values.length;
    const wasLastValue = nextValueIndex === 0;

    const isDefaultNextValue = !!isDefaultable && wasLastValue;
    if (isDefaultNextValue) {
        return undefined;
    }

    return values[(indexOfValue + 1) % values.length];
};
