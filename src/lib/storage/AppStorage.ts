/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* oxlint-disable max-classes-per-file */
import { jsonSaveParse } from '@/lib/HelperFunctions.ts';
import { SubpathUtil } from '@/lib/utils/SubpathUtil.ts';

const THIRD_PARTY_KEYS = ['mui-mode'];

const getKey = (key: string): string => {
    if (THIRD_PARTY_KEYS.includes(key)) {
        return key;
    }

    return `suwayomi_webui_${SubpathUtil.getSubpath()}_${key}`;
};

export class Storage {
    constructor(private readonly storage: typeof window.localStorage) {}

    parseValue<T>(value: string | null, defaultValue: T): T {
        if (value === null) {
            return defaultValue;
        }

        const parsedValue = jsonSaveParse(value);

        if (value === 'null' || value === 'undefined') {
            return parsedValue;
        }

        return parsedValue ?? (value as T);
    }

    getItem(key: string): string | null {
        const valueForNewKey = this.storage.getItem(getKey(key));

        if (valueForNewKey) {
            return valueForNewKey;
        }

        // TODO - deprecated - remove code below this after next stable release (current v20260726.01)
        const valueForOldKey = this.storage.getItem(key);

        if (valueForOldKey) {
            this.storage.setItem(getKey(key), valueForOldKey);
            this.storage.removeItem(key);
        }

        return valueForOldKey;
    }

    getItemParsed<T>(key: string, defaultValue: T): T {
        return this.parseValue(this.getItem(key), defaultValue);
    }

    setItem(key: string, value: unknown, emitEvent: boolean = true): void {
        const currentValue = this.getItem(key);
        const actualKey = getKey(key);

        const fireEvent = (valueToStore: string | undefined) => {
            if (!emitEvent) {
                return;
            }

            window.dispatchEvent(
                new StorageEvent('storage', {
                    key: actualKey,
                    oldValue: currentValue,
                    newValue: valueToStore,
                }),
            );
        };

        if (value === undefined) {
            this.storage.removeItem(actualKey);
            fireEvent(undefined);
            return;
        }

        const stringify = typeof value !== 'string';
        const valueToStore = stringify ? JSON.stringify(value) : value;

        this.storage.setItem(actualKey, valueToStore);
        fireEvent(valueToStore as string);
    }

    setItemIfMissing(key: string, value: unknown, emitEvent?: boolean): void {
        if (this.getItem(key) === null) {
            this.setItem(key, value, emitEvent);
        }
    }
}

export class AppStorage {
    static readonly local: Storage = new Storage(window.localStorage);

    static readonly session: Storage = new Storage(window.sessionStorage);

    static getKey(key: string): string {
        return getKey(key);
    }
}
