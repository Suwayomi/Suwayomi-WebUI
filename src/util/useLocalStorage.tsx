/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, {
    useState,
    Dispatch,
    SetStateAction,
    useReducer,
    Reducer,
} from 'react';
import storage from './localStorage';

// eslint-disable-next-line max-len
/**
 * It takes a key, a default value, and a function that will be called when the value changes
 * @param {string} key - The key to store the value under in localStorage.
 * @param {T} defaultValue - The default value to use when the key is not found in local
 * storage.
 * @returns The first element is the value of the local storage. The second element is a function that
 * will set the value of the local storage.
 */
export default function useLocalStorage<T>(
    key: string,
    defaultValue: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
    const initialState = defaultValue instanceof Function ? defaultValue() : defaultValue;
    const [storedValue, setStoredValue] = useState<T>(
        storage.getItem(key, initialState),
    );

    const setValue = ((value: T | ((prevState: T) => T)) => {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        storage.setItem(key, valueToStore);
    }) as React.Dispatch<React.SetStateAction<T>>;

    return [storedValue, setValue];
}

/**
 * It takes a reducer, a key, and a default state. It uses the key to get the current state from local
 * storage, and if it doesn't find it, it uses the default state. It then passes the state and action
 * to the reducer, and stores the new state in local storage
 * @param reducer - The reducer function that takes the previous state and an action and returns the
 * new state.
 * @param {string} key - The key to use when storing the state in localStorage.
 * @param {S} defaultState - The default state of the reducer.
 * @returns A reducer function.
 */
export function useReducerLocalStorage<S, A>(
    reducer: Reducer<S, A>,
    key: string,
    defaultState: S | (() => S),
) {
    const [storedValue, setValue] = useLocalStorage(key, defaultState);
    return useReducer((state: S, action: A): S => {
        const newState = reducer(state, action);
        setValue(newState);
        return newState;
    }, storedValue);
}
