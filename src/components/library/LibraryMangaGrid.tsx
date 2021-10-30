/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import MangaGrid, { IMangaGridProps } from 'components/MangaGrid';
import useLibraryOptions, { NullAndUndefined } from 'util/useLibraryOptions';

const FILTERED_OUT_MESSAGE = 'There are no Manga matching this filter';

function unreadFilter(unread: NullAndUndefined<boolean>, { unreadCount }: IMangaCard): boolean {
    switch (unread) {
        case true:
            return !!unreadCount && unreadCount >= 1;
        case false:
            return unreadCount === 0;
        default:
            return true;
    }
}

function filterManga(mangas: IMangaCard[]): IMangaCard[] {
    const { unread } = useLibraryOptions();
    return mangas
        .filter((manga) => unreadFilter(unread, manga));
}

export default function LibraryMangaGrid(props: IMangaGridProps) {
    const {
        mangas, isLoading, hasNextPage, lastPageNum, setLastPageNum, message,
    } = props;

    const { active } = useLibraryOptions();
    const filteredManga = filterManga(mangas);
    const showFilteredOutMessage = active && filteredManga.length === 0 && mangas.length > 0;

    return (
        <MangaGrid
            mangas={filteredManga}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            lastPageNum={lastPageNum}
            setLastPageNum={setLastPageNum}
            message={showFilteredOutMessage ? FILTERED_OUT_MESSAGE : message}
        />
    );
}
