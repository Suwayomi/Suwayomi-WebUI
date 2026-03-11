/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useShallow } from 'zustand/react/shallow';

type UseBoundStoreAny<S> = <T>(selector: (state: S) => T) => T;

type StoreHook<State> = {
    <T>(selector: (state: State) => T): T;
    <Key extends keyof State>(key: Key): State[Key];
    <Key extends keyof State>(...keys: Key[]): Pick<State, Key>;
};

export class ZustandUtil {
    static createKeySelector<State, Key extends keyof State>(keys: Key[]): (state: State) => Pick<State, Key> {
        return (state) => {
            const result = {} as Pick<State, Key>;

            for (const key of keys) {
                result[key] = state[key];
            }

            return result;
        };
    }

    static createStoreHook<FullState extends object, SliceKey extends keyof FullState>(
        store: UseBoundStoreAny<FullState>,
        sliceKey: SliceKey,
    ): StoreHook<FullState[SliceKey]>;
    static createStoreHook<State>(store: UseBoundStoreAny<State>): StoreHook<State>;
    static createStoreHook<State>(
        store: UseBoundStoreAny<State>,
        sliceKey?: keyof State,
    ): StoreHook<State[keyof State] | State> {
        return ((...args: unknown[]) => {
            let selector: (state: State) => unknown;

            if (typeof args[0] === 'function') {
                const fn = args[0] as (state: unknown) => unknown;
                selector = sliceKey !== undefined ? (state: State) => fn(state[sliceKey]) : fn;
            } else if (args.length === 1) {
                const key = args[0];
                selector =
                    sliceKey !== undefined
                        ? (state: State) => (state[sliceKey] as Record<PropertyKey, unknown>)[key as PropertyKey]
                        : (state: State) => (state as Record<PropertyKey, unknown>)[key as PropertyKey];
            } else {
                const pickSelector = ZustandUtil.createKeySelector<Record<PropertyKey, unknown>, PropertyKey>(
                    args as PropertyKey[],
                );
                selector =
                    sliceKey !== undefined
                        ? (state: State) => pickSelector(state[sliceKey] as Record<PropertyKey, unknown>)
                        : (pickSelector as (state: State) => unknown);
            }

            return store(useShallow(selector));
        }) as StoreHook<State[keyof State] | State>;
    }

    static createActionName(...names: string[]) {
        const storeAndSlices = names.slice(0, -1);
        const action = names.slice(-1)[0];

        return `${storeAndSlices.join(':')}/${action}`;
    }

    static createActionNameCreator(
        name: string,
        parentCreator: typeof ZustandUtil.createActionName = ZustandUtil.createActionName,
    ): typeof ZustandUtil.createActionName {
        return (...names: string[]) => parentCreator(name, ...names);
    }
}
