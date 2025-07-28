/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// eslint-disable-next-line max-classes-per-file
import { jsonSaveParse } from '@/lib/HelperFunctions.ts';

export class Storage {
    constructor(private readonly storage: typeof window.localStorage) {}

    parseValue<T>(value: string | null, defaultValue: T): T {
        if (value === null) {
            return defaultValue;
        }

        return jsonSaveParse(value) ?? (value as T);
    }

    getItem(key: string): string | null {
        return this.storage.getItem(key);
    }

    getItemParsed<T>(key: string, defaultValue: T): T {
        return this.parseValue(this.getItem(key), defaultValue);
    }

    setItem(key: string, value: unknown, emitEvent: boolean = true): void {
        const currentValue = this.getItem(key);

        const fireEvent = (valueToStore: string | undefined) => {
            if (!emitEvent) {
                return;
            }

            window.dispatchEvent(
                new StorageEvent('storage', {
                    key,
                    oldValue: currentValue,
                    newValue: valueToStore,
                }),
            );
        };

        if (value === undefined) {
            this.storage.removeItem(key);
            fireEvent(undefined);
            return;
        }

        const stringify = typeof value !== 'string';
        const valueToStore = stringify ? JSON.stringify(value) : value;

        this.storage.setItem(key, valueToStore);
        fireEvent(valueToStore as string);
    }
}

export class AppStorage {
    static readonly local: Storage = new Storage(window.localStorage);

    static readonly session: Storage = new Storage(window.sessionStorage);
}
