/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useLingui } from '@lingui/react/macro';
import type { MigrationEntry } from '@/features/migration/Migration.types.ts';
import { MigrationEntryStatus } from '@/features/migration/Migration.types.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { MigrationStatusBadge } from '@/features/migration/components/MigrationStatusBadge.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ListCardAvatar } from '@/base/components/lists/cards/ListCardAvatar.tsx';

export const MigrationEntryRow = ({ entry }: { entry: MigrationEntry }) => {
    const { t } = useLingui();

    const isExcluded = entry.status === MigrationEntryStatus.EXCLUDED;
    const hasResults = entry.searchResults.length > 0;

    const handleMatchChange = (targetMangaId: number) => {
        const result = entry.searchResults.find((r) => r.mangaId === targetMangaId);
        if (result) {
            MigrationManager.selectMatch(entry.mangaId, result.mangaId, result.sourceId);
        }
    };

    return (
        <Card sx={{ opacity: isExcluded ? 0.5 : 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1, '&:last-child': { pb: 1 } }}>
                {/* Source manga info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                    <ListCardAvatar
                        iconUrl={requestManager.getValidImgUrlFor(entry.mangaThumbnailUrl ?? '')}
                        alt={entry.mangaTitle}
                        slots={{ spinnerImageProps: { ignoreQueue: true } }}
                    />
                    <Typography variant="body2" noWrap title={entry.mangaTitle}>
                        {entry.mangaTitle}
                    </Typography>
                </Box>

                {/* Arrow */}
                {hasResults && <ArrowForwardIcon color="action" fontSize="small" />}

                {/* Match selector */}
                {hasResults && (
                    <Box sx={{ minWidth: 200, maxWidth: 300 }}>
                        <Select
                            size="small"
                            fullWidth
                            value={entry.selectedMatchMangaId ?? ''}
                            onChange={(e) => handleMatchChange(Number(e.target.value))}
                            disabled={isExcluded}
                        >
                            {entry.searchResults.map((result) => (
                                <MenuItem key={result.mangaId} value={result.mangaId}>
                                    <Typography variant="body2" noWrap>
                                        {result.title}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                )}

                {/* Status */}
                <MigrationStatusBadge status={entry.status} />

                {/* Error info */}
                {entry.error && (
                    <Typography variant="caption" color="error" sx={{ maxWidth: 150 }} noWrap title={entry.error}>
                        {entry.error}
                    </Typography>
                )}

                {/* Exclude/include toggle */}
                <IconButton
                    size="small"
                    onClick={() =>
                        isExcluded
                            ? MigrationManager.includeManga(entry.mangaId)
                            : MigrationManager.excludeManga(entry.mangaId)
                    }
                    title={isExcluded ? t`Include` : t`Exclude`}
                >
                    {isExcluded ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                </IconButton>
            </CardContent>
        </Card>
    );
};
