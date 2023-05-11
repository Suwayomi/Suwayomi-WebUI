/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useState, Dispatch, SetStateAction, useReducer, Reducer, useCallback } from 'react';
import storage from 'util/localStorage';

export default function useLocalStorage<T>(key: string, defaultValue: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
    const initialState = defaultValue instanceof Function ? defaultValue() : defaultValue;
    const [storedValue, setStoredValue] = useState<T>(storage.getItem(key, initialState));

    const setValue = useCallback<React.Dispatch<React.SetStateAction<T>>>(
        (value) => {
            setStoredValue((prevValue) => {
                // Allow value to be a function so we have same API as useState
                const valueToStore = value instanceof Function ? value(prevValue) : value;
                storage.setItem(key, valueToStore);
                return valueToStore;
            });
        },
        [key],
    );

    return [storedValue, setValue];
}

export function useReducerLocalStorage<S, A>(reducer: Reducer<S, A>, key: string, defaultState: S | (() => S)) {
    const [storedValue, setValue] = useLocalStorage(key, defaultState);
    return useReducer((state: S, action: A): S => {
        const newState = reducer(state, action);
        setValue(newState);
        return newState;
    }, storedValue);
}
