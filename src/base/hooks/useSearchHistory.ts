/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useLocalStorage } from '@/base/hooks/useStorage.tsx';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { baseCleanup } from '@/base/utils/Strings.ts';

const SEARCH_HISTORY_STORAGE_KEY = 'searchHistory';

/** Long enough for any realistic search, short enough to not fill up the local storage with a pasted wall of text. */
const MAX_ENTRY_LENGTH = 100;

const areEntriesEqual = (a: string, b: string): boolean => baseCleanup(a) === baseCleanup(b);

/**
 * The queries that were actually submitted for a given "key", most recent first, so that the searches of e.g. the
 * library stay separate from the ones of the source browse.
 */
export const useSearchHistory = (
    key: string,
    maxSize = 10,
): {
    history: string[];
    addToHistory: (query: string) => void;
    removeFromHistory: (query: string) => void;
} => {
    const [history, setHistory] = useLocalStorage<string[]>(
        `${SEARCH_HISTORY_STORAGE_KEY}::${key}`,
        STABLE_EMPTY_ARRAY,
    );

    const addToHistory = useCallback(
        (query: string) => {
            const trimmedQuery = query.slice(0, MAX_ENTRY_LENGTH).trim();

            if (!trimmedQuery) {
                return;
            }

            setHistory((previousHistory = []) =>
                [trimmedQuery, ...previousHistory.filter((entry) => !areEntriesEqual(entry, trimmedQuery))].slice(
                    0,
                    maxSize,
                ),
            );
        },
        [setHistory, maxSize],
    );

    const removeFromHistory = useCallback(
        (query: string) => {
            setHistory((previousHistory = []) => previousHistory.filter((entry) => !areEntriesEqual(entry, query)));
        },
        [setHistory],
    );

    return { history, addToHistory, removeFromHistory };
};
