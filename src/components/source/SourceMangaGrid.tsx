/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import MangaGrid, { IMangaGridProps } from '@/components/MangaGrid';
import { TPartialManga } from '@/typings.ts';

function filterManga(mangas: TPartialManga[]): TPartialManga[] {
    return mangas;
}

export default function SourceMangaGrid(props: IMangaGridProps) {
    const { t } = useTranslation();
    const { mangas, isLoading, hasNextPage, loadMore, message, messageExtra, gridLayout } = props;

    const filteredManga = filterManga(mangas);
    const showFilteredOutMessage = filteredManga.length === 0 && mangas.length > 0;

    return (
        <MangaGrid
            mangas={filteredManga}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            loadMore={loadMore}
            message={showFilteredOutMessage ? t('manga.error.label.no_matches') : message}
            messageExtra={messageExtra}
            gridLayout={gridLayout}
            inLibraryIndicator
        />
    );
}
