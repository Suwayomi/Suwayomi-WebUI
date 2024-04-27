/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useEffect } from 'react';
import { StringParam, useQueryParam } from 'use-query-params';
import { useTranslation } from 'react-i18next';
import { TManga } from '@/typings';
import { useLibraryOptionsContext } from '@/components/context/LibraryOptionsContext';
import { IMangaGridProps, MangaGrid } from '@/components/MangaGrid';

interface LibraryMangaGridProps
    extends Required<Pick<IMangaGridProps, 'isSelectModeActive' | 'selectedMangaIds' | 'handleSelection'>>,
        Pick<IMangaGridProps, 'retry' | 'message' | 'messageExtra'> {
    mangas: TManga[];
    showFilteredOutMessage: boolean;
    isLoading: boolean;
}

export const LibraryMangaGrid: React.FC<LibraryMangaGridProps> = ({
    showFilteredOutMessage,
    message,
    messageExtra,
    ...gridProps
}) => {
    const { t } = useTranslation();

    const [query] = useQueryParam('query', StringParam);
    const { options } = useLibraryOptionsContext();
    const { unread, downloaded } = options;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [query, unread, downloaded]);

    return (
        <MangaGrid
            {...gridProps}
            hasNextPage={false}
            loadMore={() => undefined}
            message={showFilteredOutMessage ? t('library.error.label.no_matches') : message}
            messageExtra={showFilteredOutMessage ? undefined : messageExtra}
            gridLayout={options.gridLayout}
        />
    );
};
