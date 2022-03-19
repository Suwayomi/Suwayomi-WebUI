/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BooleanParam, useQueryParam, StringParam } from 'use-query-params';

/* A type definition for the object that is returned by the function `useLibraryOptions`. */
interface IUseLibraryOptions {
    downloaded: NullAndUndefined<boolean>
    setDownloaded: (downloaded: NullAndUndefined<boolean>) => void
    unread: NullAndUndefined<boolean>
    setUnread: (unread: NullAndUndefined<boolean>) => void
    query: NullAndUndefined<string>
    setQuery: (query: NullAndUndefined<string>) => void
    active: boolean
    activeSort: boolean
    sorts: NullAndUndefined<string>
    setSorts: (sorts: NullAndUndefined<string>) => void
    sortDesc: NullAndUndefined<boolean>
    setSortDesc: (sortDesc: NullAndUndefined<boolean>) => void
}

/**
 * It returns a set of query parameters that can be used to filter the library
 * @returns The useLibraryOptions hook returns a set of values that are used to control the library.
 */
export default function useLibraryOptions(): IUseLibraryOptions {
    const [downloaded, setDownloaded] = useQueryParam('downloaded', BooleanParam);
    const [unread, setUnread] = useQueryParam('unread', BooleanParam);
    const [query, setQuery] = useQueryParam('query', StringParam);
    const [sorts, setSorts] = useQueryParam('sorts', StringParam);
    const [sortDesc, setSortDesc] = useQueryParam('sortDesc', BooleanParam);

    // eslint-disable-next-line eqeqeq
    const active = !(unread == undefined) || !(downloaded == undefined);
    // eslint-disable-next-line eqeqeq
    const activeSort = (sortDesc != undefined) || (sorts != undefined);
    return {
        downloaded,
        setDownloaded,
        unread,
        setUnread,
        query,
        setQuery,
        active,
        activeSort,
        sorts,
        setSorts,
        sortDesc,
        setSortDesc,
    };
}
