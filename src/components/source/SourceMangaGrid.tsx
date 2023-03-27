/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import MangaGrid, { IMangaGridProps } from 'components/MangaGrid';
import { IMangaCard } from 'typings';
import { useTranslation } from 'react-i18next';

function filterManga(mangas: IMangaCard[]): IMangaCard[] {
    return mangas;
}

export default function SourceMangaGrid(props: IMangaGridProps) {
    const { t } = useTranslation();
    const { mangas, isLoading, hasNextPage, lastPageNum, setLastPageNum, message, messageExtra, gridLayout } = props;

    const filteredManga = filterManga(mangas);
    const showFilteredOutMessage = filteredManga.length === 0 && mangas.length > 0;

    return (
        <MangaGrid
            mangas={filteredManga}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            lastPageNum={lastPageNum}
            setLastPageNum={setLastPageNum}
            message={showFilteredOutMessage ? t('manga.error.label.no_matches') : message}
            messageExtra={messageExtra}
            gridLayout={gridLayout}
            inLibraryIndicator
        />
    );
}
