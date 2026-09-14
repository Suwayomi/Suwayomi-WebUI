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

const SEARCH_HISTORY_STORAGE_KEY = 'searchHistory';

/** Keeping more than this around only pushes the useful entries out of the suggestions. */
const MAX_ENTRIES = 10;

/** Long enough for any realistic search, short enough to not fill up the local storage with a pasted wall of text. */
const MAX_ENTRY_LENGTH = 100;

const areEntriesEqual = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();

/**
 * The queries that were actually submitted, most recent first, shared by every search input of the app, so that a
 * search in the library can be repeated in a source without typing it again.
 */
export const useSearchHistory = (): {
    history: string[];
    addToHistory: (query: string) => void;
    removeFromHistory: (query: string) => void;
} => {
    const [history, setHistory] = useLocalStorage<string[]>(SEARCH_HISTORY_STORAGE_KEY, STABLE_EMPTY_ARRAY);

    const addToHistory = useCallback(
        (query: string) => {
            const trimmedQuery = query.trim();

            if (!trimmedQuery || trimmedQuery.length > MAX_ENTRY_LENGTH) {
                return;
            }

            setHistory((previousHistory = []) =>
                [trimmedQuery, ...previousHistory.filter((entry) => !areEntriesEqual(entry, trimmedQuery))].slice(
                    0,
                    MAX_ENTRIES,
                ),
            );
        },
        [setHistory],
    );

    const removeFromHistory = useCallback(
        (query: string) => {
            setHistory((previousHistory = []) => previousHistory.filter((entry) => !areEntriesEqual(entry, query)));
        },
        [setHistory],
    );

    return { history, addToHistory, removeFromHistory };
};
