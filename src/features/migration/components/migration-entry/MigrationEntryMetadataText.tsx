/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MigrationMatch } from '@/features/migration/Migration.types.ts';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';

export const MigrationEntryMetadataText = (
    entry: Pick<MigrationMatch, 'artist' | 'author' | 'latestChapterNumber' | 'missingChapters'>,
) => {
    const { t } = useLingui();

    const latestChapterNumber = (entry.latestChapterNumber ?? 0) > 1 ? entry.latestChapterNumber : t`Unknown`;
    const isSameArtistAuthor = entry.artist === entry.author;

    const nodes = [
        entry.author ? (
            <Typography sx={{ display: 'inline-flex' }} key="author" variant="inherit">
                {entry.author}
            </Typography>
        ) : null,
        !isSameArtistAuthor && entry.artist ? (
            <Typography sx={{ display: 'inline-flex' }} key="artist" variant="inherit">
                {entry.artist}
            </Typography>
        ) : null,
        <Typography sx={{ display: 'inline-flex' }} key="latest-chapter-number" variant="inherit">
            {t`Latest: ${latestChapterNumber}`}
        </Typography>,
        entry.missingChapters ? (
            <Typography sx={{ display: 'inline-flex' }} key="missing-chapters" variant="inherit" color="warning">
                {t`Missing: ${entry.missingChapters}`}
            </Typography>
        ) : null,
    ]
        .filter((node) => node !== null)
        .map((node, index, array) => (
            <>
                {node}
                {index < array.length - 1 && '  -  '}
            </>
        ));

    return (
        <Typography variant="body2" color="textSecondary">
            {nodes}
        </Typography>
    );
};
