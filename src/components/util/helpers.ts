/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// eslint-disable-next-line import/prefer-default-export
export const pluralize = (count: number, input: string | { one: string; many: string }) => {
    if (typeof input === 'string') {
        return `${input}${count === 1 ? '' : 's'}`;
    }
    return input[count === 1 ? 'one' : 'many'];
};

export const interpolate = (count: number, input: { one: string; many: string }) => {
    const text = count === 1 ? input.one : input.many;
    return text.replaceAll('%count%', count.toString());
};
