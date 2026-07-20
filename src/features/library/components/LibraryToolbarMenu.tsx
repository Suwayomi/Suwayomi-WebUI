/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import FilterList from '@mui/icons-material/FilterList';
import IconButton from '@mui/material/IconButton';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { LibraryOptionsPanel } from '@/features/library/components/LibraryOptionsPanel.tsx';
import { getCategoryMetadata } from '@/features/category/services/CategoryMetadata.ts';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import type { GetMangasBaseQuery, GetMangasBaseQueryVariables } from '@/lib/graphql/generated/graphql.ts';
import { GET_MANGAS_BASE } from '@/lib/graphql/manga/MangaQuery.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { assertIsDefined } from '@/base/Asserts.ts';

export const LibraryToolbarMenu = ({
    category,
}: {
    category: ComponentProps<typeof LibraryOptionsPanel>['category'];
}) => {
    const { t } = useLingui();

    const [open, setOpen] = useState(false);
    const options = getCategoryMetadata(category);
    const active =
        options.hasDownloadedChapters != null ||
        options.hasUnreadChapters != null ||
        options.hasReadChapters != null ||
        options.hasBookmarkedChapters != null ||
        options.hasDuplicateChapters != null ||
        Object.values(options.hasStatus).some((hasStatus) => hasStatus != null) ||
        Object.values(options.hasTrackerBinding).some((trackerFilterStatus) => trackerFilterStatus != null) ||
        Object.values(options.hasSource).some((sourceFilterStatus) => sourceFilterStatus != null);

    return (
        <>
            <CustomTooltip title={t`Open random entry`}>
                <IconButton
                    onClick={async () => {
                        try {
                            const mangasResponse = await requestManager.getMangas<
                                GetMangasBaseQuery,
                                GetMangasBaseQueryVariables
                            >(GET_MANGAS_BASE, {
                                condition: { inLibrary: true },
                            }).response;

                            const randomManga =
                                mangasResponse.data?.mangas.nodes[
                                    Math.floor(Math.random() * mangasResponse.data?.mangas.totalCount)
                                ];

                            assertIsDefined(randomManga);

                            ReactRouter.navigate(AppRoutes.manga.path(randomManga.id));
                        } catch (e) {
                            makeToast(t`Could not open random entry`, 'error', getErrorMessage(e));
                        }
                    }}
                    color={active ? 'warning' : 'inherit'}
                >
                    <ShuffleIcon />
                </IconButton>
            </CustomTooltip>
            <CustomTooltip title={t`Settings`}>
                <IconButton onClick={() => setOpen(!open)} color={active ? 'warning' : 'inherit'}>
                    <FilterList />
                </IconButton>
            </CustomTooltip>
            <LibraryOptionsPanel category={category} open={open} onClose={() => setOpen(false)} />
        </>
    );
};
