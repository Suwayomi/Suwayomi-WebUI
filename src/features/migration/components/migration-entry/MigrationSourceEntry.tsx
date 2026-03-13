/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { TMigrationEntry } from '@/features/migration/Migration.types.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import { MigrationEntryMetadataText } from '@/features/migration/components/migration-entry/MigrationEntryMetadataText.tsx';
import { MigrationEntryStatusIndicator } from '@/features/migration/components/migration-entry/MigrationEntryStatusIndicator.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { ListCardAvatar } from '@/base/components/lists/cards/ListCardAvatar.tsx';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';

export const MigrationSourceEntry = (entry: TMigrationEntry) => {
    const {
        mangaId,
        mangaThumbnailUrl,
        mangaTitle,
        sourceTitle,
        mangaArtist,
        mangaAuthor,
        latestChapterNumber,
        searchMatches,
        status,
    } = entry;

    const { t } = useLingui();
    const isTabletWidth = MediaQuery.useIsTabletWidth();

    if (isTabletWidth) {
        return (
            <Stack sx={{ flexDirection: 'row', gap: 1, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Stack>
                    <Typography variant="overline" color="textSecondary">{t`Source entry - ${sourceTitle}`}</Typography>
                    <TypographyMaxLines variant="h6" component="h3" title={mangaTitle}>
                        {mangaTitle}
                    </TypographyMaxLines>
                    <MigrationEntryMetadataText
                        artist={mangaArtist}
                        author={mangaAuthor}
                        latestChapterNumber={latestChapterNumber}
                    />
                </Stack>
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <MigrationEntryStatusIndicator status={status} hasResults={!!searchMatches.length} />
                </Box>
            </Stack>
        );
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '400px' }}>
            <Link component={RouterLink} to={AppRoutes.manga.path(mangaId)}>
                <ListCardAvatar
                    iconUrl={Mangas.getThumbnailUrl({ ...entry, thumbnailUrl: mangaThumbnailUrl })}
                    alt={mangaTitle}
                    slots={{
                        avatarProps: {
                            sx: {
                                width: 'unset',
                                height: 112,
                                aspectRatio: '3 / 4',
                            },
                        },
                    }}
                />
            </Link>
            <Stack sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="overline" color="textSecondary">{t`Source entry - ${sourceTitle}`}</Typography>
                <Link
                    component={RouterLink}
                    to={AppRoutes.manga.path(mangaId)}
                    sx={{ textDecoration: 'none', color: 'inherit' }}
                >
                    <TypographyMaxLines variant="h6" component="h3" title={mangaTitle}>
                        {mangaTitle}
                    </TypographyMaxLines>
                </Link>
                <MigrationEntryMetadataText
                    artist={mangaArtist}
                    author={mangaAuthor}
                    latestChapterNumber={latestChapterNumber}
                />
            </Stack>
        </Box>
    );
};
