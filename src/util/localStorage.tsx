/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/**
 * Get the item from the local storage with the given key, or set it to the default value if it doesn't
 * exist.
 * @param {string} key - The key to use when storing the item.
 * @param {T} defaultValue - The default value to return if the key is not found.
 * @returns The value of the key, or the default value if the key does not exist.
 */
function getItem<T>(key: string, defaultValue: T) : T {
    try {
        const item = window.localStorage.getItem(key);

        if (item !== null) {
            return JSON.parse(item);
        }

        window.localStorage.setItem(key, JSON.stringify(defaultValue));

        /* eslint-disable no-empty */
    } finally { }
    return defaultValue;
}

/**
 * Set the value of a key in local storage.
 * @param {string} key - The key of the item to be set.
 * @param {T} value - The value to be stored in the local storage.
 */
function setItem<T>(key: string, value: T): void {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));

        // eslint-disable-next-line no-empty
    } finally { }
}

export default { getItem, setItem };
