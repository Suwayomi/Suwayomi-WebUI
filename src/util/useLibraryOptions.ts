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
    unread: NullAndUndefined<boolean>
    setUnread: (unread: NullAndUndefined<boolean>) => void
    query: NullAndUndefined<string>
    setQuery: (query: NullAndUndefined<string>) => void
    active: boolean
}

export default function useLibraryOptions(): IUseLibraryOptions {
    const [searchQuery, setSearchQuery] = useQueryParams({
        unread: BooleanParam,
        query: StringParam,
    });
    const { unread, query } = searchQuery;
    const setUnread = (newUnread: NullAndUndefined<boolean>) => {
        setSearchQuery(Object.assign(searchQuery, { unread: newUnread }), 'replace');
    };
    const setQuery = (newQuery: NullAndUndefined<string>) => {
        setSearchQuery(Object.assign(searchQuery, { query: newQuery }), 'replace');
    };
    // eslint-disable-next-line eqeqeq
    const active = !(unread == undefined);
    return {
        unread, setUnread, active, query, setQuery,
    };
}
