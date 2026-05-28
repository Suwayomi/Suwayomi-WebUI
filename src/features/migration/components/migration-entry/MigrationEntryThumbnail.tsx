/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import FavoriteIcon from '@mui/icons-material/Favorite';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { ListCardAvatar } from '@/base/components/lists/cards/ListCardAvatar.tsx';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import type { MigrationMatch } from '@/features/migration/Migration.types.ts';
import type { Theme } from '@mui/material/styles';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';

export const MigrationEntryThumbnail = ({
    entry,
    height,
}: {
    entry: MigrationMatch;
    height: ReturnType<Theme['applyStyles']>['height'];
}) => {
    const { id, title } = entry;

    const { t } = useLingui();

    return (
        <Stack sx={{ position: 'relative' }}>
            <Link component={RouterLink} to={AppRoutes.manga.path(id)} onClick={(e) => e.stopPropagation()}>
                <ListCardAvatar
                    iconUrl={Mangas.getThumbnailUrl(entry)}
                    alt={title}
                    slots={{
                        avatarProps: {
                            sx: {
                                width: 'unset',
                                height,
                                aspectRatio: '3 / 4',
                                filter: entry.inLibrary ? 'brightness(0.4)' : undefined,
                            },
                        },
                    }}
                />
            </Link>
            {entry.inLibrary && (
                <CustomTooltip title={t`In Library`}>
                    <Stack
                        sx={{
                            position: 'absolute',
                            top: 2.5,
                            left: 2.5,
                            p: 0.5,
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                        }}
                    >
                        <FavoriteIcon color="primary" sx={{ fontSize: 15 }} />
                    </Stack>
                </CustomTooltip>
            )}
        </Stack>
    );
};
