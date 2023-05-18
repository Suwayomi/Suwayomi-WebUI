/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

function getItem<T>(key: string, defaultValue: T): T {
    const item = window.localStorage.getItem(key);

    if (item !== null) {
        return JSON.parse(item);
    }

    window.localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
}

function setItem<T>(key: string, value: T): void {
    window.localStorage.setItem(key, JSON.stringify(value));
}

export default { getItem, setItem };
