/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export const HIDDEN_CATEGORIES_SESSION_KEY = 'suwayomi.hidden-categories.unlocked';
export const HIDDEN_CATEGORIES_UNLOCKED_AT_SESSION_KEY = 'suwayomi.hidden-categories.unlocked-at';

export const hashHiddenCategoryPassword = async (password: string): Promise<string> => {
    if (!globalThis.crypto?.subtle) {
        throw new Error('The Web Crypto API is unavailable');
    }

    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};
