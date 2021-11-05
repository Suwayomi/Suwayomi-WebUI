/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BooleanParam, useQueryParams, StringParam } from 'use-query-params';

export type NullAndUndefined<T> = T | null | undefined;

interface IUseLibraryOptions {
    downloaded: NullAndUndefined<boolean>
    setDownloaded: (downloaded: NullAndUndefined<boolean>)=>void
    unread: NullAndUndefined<boolean>
    setUnread: (unread: NullAndUndefined<boolean>) => void
    query: NullAndUndefined<string>
    setQuery: (query: NullAndUndefined<string>) => void
    active: boolean
}

export default function useLibraryOptions(): IUseLibraryOptions {
    const [searchQuery, setSearchQuery] = useQueryParams({
        downloaded: BooleanParam,
        unread: BooleanParam,
        query: StringParam,
    });
    const { downloaded, unread, query } = searchQuery;
    const setDownloaded = (newDownloaded: NullAndUndefined<boolean>) => {
        setSearchQuery(Object.assign(searchQuery, { downloaded: newDownloaded }), 'replace');
    };
    const setUnread = (newUnread: NullAndUndefined<boolean>) => {
        setSearchQuery(Object.assign(searchQuery, { unread: newUnread }), 'replace');
    };
    const setQuery = (newQuery: NullAndUndefined<string>) => {
        setSearchQuery(Object.assign(searchQuery, { query: newQuery }), 'replace');
    };
    // eslint-disable-next-line eqeqeq
    const active = !(unread == undefined) && !(downloaded == undefined);
    return {
        downloaded, setDownloaded, unread, setUnread, active, query, setQuery,
    };
}
