/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import MangaGrid, { IMangaGridProps } from 'components/MangaGrid';

const FILTERED_OUT_MESSAGE = 'There are no Manga matching this filter';

/**
 * It takes in an array of manga cards and returns an array of manga cards
 * @param {IMangaCard[]} mangas - The array of manga cards to filter.
 * @returns An array of manga cards.
 */
function filterManga(mangas: IMangaCard[]): IMangaCard[] {
    return mangas;
}

/**
 * This function is a React component that renders a grid of manga
 * @param {IMangaGridProps} props - IMangaGridProps
 * @returns A component that renders a grid of manga.
 */
export default function SourceMangaGrid(props: IMangaGridProps) {
    const {
        mangas, isLoading, hasNextPage, lastPageNum,
        setLastPageNum, message, messageExtra, gridLayout,
    } = props;

    const filteredManga = filterManga(mangas);
    const showFilteredOutMessage = filteredManga.length === 0 && mangas.length > 0;

    return (
        <MangaGrid
            mangas={filteredManga}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            lastPageNum={lastPageNum}
            setLastPageNum={setLastPageNum}
            message={showFilteredOutMessage ? FILTERED_OUT_MESSAGE : message}
            messageExtra={messageExtra}
            gridLayout={gridLayout}
        />
    );
}
