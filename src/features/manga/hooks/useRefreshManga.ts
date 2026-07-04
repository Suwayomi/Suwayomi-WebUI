/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { CombinedGraphQLErrors } from '@apollo/client';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { baseCleanup } from '@/base/utils/Strings.ts';

export const useRefreshManga = (mangaId: string) => {
    const [fetchingOnline, setFetchingOnline] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const handleRefresh = useCallback(async () => {
        setFetchingOnline(true);
        setError(null);

        const handleError = (e: unknown) => {
            if (CombinedGraphQLErrors.is(e) && baseCleanup(e.message) === 'no chapters found') {
                return;
            }

            setError(e);
        };

        try {
            const { error: tmpError } = await requestManager.refreshManga(mangaId, {
                awaitRefetchQueries: true,
            }).response;

            handleError(tmpError);
        } catch (e) {
            handleError(e);
        } finally {
            setFetchingOnline(false);
        }
    }, [mangaId]);

    return [handleRefresh, { loading: fetchingOnline, error }] as const;
};
