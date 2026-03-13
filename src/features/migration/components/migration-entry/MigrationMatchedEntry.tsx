/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MangaIdInfo } from '@/features/manga/Manga.types.ts';
import type { MigrationMatch } from '@/features/migration/Migration.types.ts';
import { MigrationEntryCard } from '@/features/migration/components/migration-entry/MigrationEntryCard.tsx';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { MigrationEntryCardContent } from '@/features/migration/components/migration-entry/MigrationEntryCardContent.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { ListCardAvatar } from '@/base/components/lists/cards/ListCardAvatar.tsx';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import { MigrationEntryMetadataText } from '@/features/migration/components/migration-entry/MigrationEntryMetadataText.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CardActionArea from '@mui/material/CardActionArea';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';

export const MigrationMatchedEntry = ({
    sourceMangaId,
    entry,
}: {
    sourceMangaId: MangaIdInfo['id'];
    entry: MigrationMatch;
}) => {
    const { t } = useLingui();

    return (
        <MigrationEntryCard sx={{ mb: 1 }}>
            <CardActionArea onClick={() => MigrationManager.selectMatch(sourceMangaId, entry.id, entry.sourceId)}>
                <MigrationEntryCardContent>
                    {(() => (
                        <>
                            <Link
                                component={RouterLink}
                                to={AppRoutes.manga.path(entry.id)}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ListCardAvatar
                                    iconUrl={Mangas.getThumbnailUrl(entry)}
                                    alt={entry.title}
                                    slots={{
                                        avatarProps: {
                                            sx: {
                                                width: 'unset',
                                                height: 80,
                                                aspectRatio: '3 / 4',
                                            },
                                        },
                                    }}
                                />
                            </Link>
                            <Stack sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="overline" color="textSecondary">
                                    {entry.sourceTitle}
                                </Typography>
                                <Link
                                    component={RouterLink}
                                    to={AppRoutes.manga.path(entry.id)}
                                    sx={{ textDecoration: 'none', color: 'inherit', width: 'max-content' }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <TypographyMaxLines variant="h6" component="h3" title={entry.title}>
                                        {entry.title}
                                    </TypographyMaxLines>
                                </Link>
                                <MigrationEntryMetadataText {...entry} />
                            </Stack>
                        </>
                    ))()}
                    {(() => (
                        <Button
                            variant="outlined"
                            {...MUIUtil.preventRippleProp({
                                onClick: () => MigrationManager.selectMatch(sourceMangaId, entry.id, entry.sourceId),
                            })}
                        >{t`Select`}</Button>
                    ))()}
                </MigrationEntryCardContent>
            </CardActionArea>
        </MigrationEntryCard>
    );
};
