/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useLayoutEffect } from 'react';
import { StringParam, useQueryParam } from 'use-query-params';
import { useTranslation } from 'react-i18next';
import { GridLayout, useLibraryOptionsContext } from '@/components/context/LibraryOptionsContext';
import { IMangaGridProps, MangaGrid } from '@/components/MangaGrid';

interface LibraryMangaGridProps
    extends Required<Pick<IMangaGridProps, 'isSelectModeActive' | 'selectedMangaIds' | 'handleSelection' | 'mangas'>>,
        Pick<IMangaGridProps, 'retry' | 'message' | 'messageExtra'> {
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

    useLayoutEffect(() => {
        document.body.style.overflowY = options.gridLayout === GridLayout.List ? 'auto' : 'scroll';
        return () => {
            document.body.style.overflowY = 'auto';
        };
    }, []);

    return (
        <MangaGrid
            gridWrapperProps={{ sx: { p: 1 } }}
            {...gridProps}
            hasNextPage={false}
            loadMore={() => undefined}
            message={showFilteredOutMessage ? t('library.error.label.no_matches') : message}
            messageExtra={showFilteredOutMessage ? undefined : messageExtra}
            gridLayout={options.gridLayout}
        />
    );
};
