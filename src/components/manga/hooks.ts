/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { mutate } from 'swr';
import requestManager, { RequestManager } from '@/lib/requests/RequestManager.ts';

export const useRefreshManga = (mangaId: string) => {
    const [fetchingOnline, setFetchingOnline] = useState(false);

    const handleRefresh = useCallback(async () => {
        setFetchingOnline(true);
        await Promise.all([
            requestManager.getMangaFetch(mangaId).response.then((res) => {
                mutate(`${RequestManager.API_VERSION}manga/${mangaId}`, res, { revalidate: false });
            }),
            requestManager.getMangaChapters(mangaId, true).response.then((res) =>
                mutate(`${RequestManager.API_VERSION}manga/${mangaId}/chapters`, res, {
                    revalidate: false,
                }),
            ),
        ]).finally(() => setFetchingOnline(false));
    }, [mangaId]);

    return [handleRefresh, { loading: fetchingOnline }] as const;
};

export const useDebounce = <Value>(value: Value, delay: number): Value => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};
