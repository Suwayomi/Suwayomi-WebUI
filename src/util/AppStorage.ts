/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

type GetItem = <T>(
    storage: typeof window.sessionStorage | typeof window.localStorage,
    key: string,
    defaultValue: T,
) => T;
type SetItem = <T>(storage: typeof window.sessionStorage | typeof window.localStorage, key: string, value: T) => void;

export type Storage = {
    getItem: <T>(key: string, defaultValue: T) => T;
    setItem: <T>(key: string, value: T) => void;
};

const getItem: GetItem = (storage, key, defaultValue) => {
    const item = storage.getItem(key);

    if (item !== null) {
        return JSON.parse(item);
    }

    storage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
};

const setItem: SetItem = (storage, key, value) => {
    storage.setItem(key, JSON.stringify(value));
};

const createStorage = (storage: typeof window.sessionStorage | typeof window.localStorage): Storage => ({
    getItem: (key, defaultValue) => getItem(storage, key, defaultValue),
    setItem: (key, value) => setItem(storage, key, value),
});

export const appStorage = {
    local: createStorage(window.localStorage),
    session: createStorage(window.sessionStorage),
};
