/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode } from 'react';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import type { MangaLocationState } from '@/features/manga/Manga.types.ts';
import type { SourceIdInfo } from '@/features/source/Source.types.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { SourceContentType } from '@/lib/graphql/generated/graphql-base.types.ts';

export const SearchLink = ({
    query,
    sourceId,
    contentType,
    mode,
    children,
}: {
    query: string;
    sourceId: SourceIdInfo['id'] | undefined;
    contentType?: SourceContentType;
    mode: MangaLocationState['mode'] | 'source.global-search';
    children?: ReactNode;
}) => {
    const link = (() => {
        const isSourceMode = mode === 'source' && sourceId !== undefined;
        if (isSourceMode) {
            return AppRoutes.sources.children.browse.path(sourceId, query);
        }

        if (mode === 'source.global-search') {
            return AppRoutes.sources.children.searchAll.path(query, contentType);
        }

        return contentType === SourceContentType.LightNovel
            ? AppRoutes.library.children.lightNovel.path(undefined, query)
            : AppRoutes.library.path(undefined, query);
    })();

    return (
        <Link component={RouterLink} to={link} sx={{ textDecoration: 'none', color: 'inherit' }}>
            {children ?? query}
        </Link>
    );
};
