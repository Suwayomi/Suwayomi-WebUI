/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// eslint-disable-next-line max-classes-per-file
export class Storage {
    constructor(private readonly storage: typeof window.localStorage) {}

    parseValue<T>(value: string | null, defaultValue: T): T {
        if (value === null) {
            return defaultValue;
        }

        return JSON.parse(value);
    }

    getItem(key: string): string | null {
        return this.storage.getItem(key);
    }

    getItemParsed<T>(key: string, defaultValue: T): T {
        return this.parseValue(this.getItem(key), defaultValue);
    }

    setItem(key: string, value: unknown, emitEvent: boolean = true): void {
        const fireEvent = (valueToStore: string | undefined) => {
            if (!emitEvent) {
                return;
            }

            window.dispatchEvent(
                new StorageEvent('storage', {
                    key,
                    oldValue: this.getItem(key),
                    newValue: valueToStore,
                }),
            );
        };

        if (value === undefined) {
            this.storage.removeItem(key);
            fireEvent(undefined);
            return;
        }

        const valueToStore = JSON.stringify(value);

        this.storage.setItem(key, valueToStore);
        fireEvent(valueToStore);
    }
}

export class AppStorage {
    static readonly local: Storage = new Storage(window.localStorage);

    static readonly session: Storage = new Storage(window.sessionStorage);
}
