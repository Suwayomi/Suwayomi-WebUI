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
    entry: Pick<MigrationMatch, 'artist' | 'author' | 'latestChapterNumber'>,
) => {
    const { t } = useLingui();

    const latestChapterNumber = (entry.latestChapterNumber ?? 0) > 1 ? entry.latestChapterNumber : t`Unknown`;
    const latestChapter = t`Latest: ${latestChapterNumber}`;

    const artist = entry.artist ? `${entry.artist} - ` : '';
    const author = entry.author ? `${entry.author} - ` : '';
    const isSameArtistAuthor = artist === author;
    const artistAuthor = isSameArtistAuthor ? artist : `${artist}${author}`;

    return (
        <Typography variant="body2" color="textSecondary">
            {artistAuthor}
            {latestChapter}
        </Typography>
    );
};
