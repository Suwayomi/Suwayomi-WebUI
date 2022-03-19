/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/**
 * "Clone an object by parsing and stringifying it."
 * 
 * The function takes an object as an argument and returns a new object that is a deep copy of the
 * original
 * @param {T} obj - The object to be cloned.
 * @returns The original object is being cloned and returned.
 */
export default function cloneObject<T extends object>(obj: T) {
    return JSON.parse(JSON.stringify(obj)) as T;
}
