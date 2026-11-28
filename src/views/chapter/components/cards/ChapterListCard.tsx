/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useMemo, type ComponentProps } from 'react';
import { ChapterCard } from '@/views/chapter/components/cards/ChapterCard.tsx';

import { Chapters } from '@/controllers/chapter/services/Chapters.ts';
import { applyStyles } from '@/utils/base/ApplyStyles.ts';
import { MissingChaptersInfoSeparator } from '@/views/chapter/components/MissingChaptersInfoSeparator.tsx';

type ChapterCardProps = ComponentProps<typeof ChapterCard>;

export const ChapterListCard = ({
    index,
    isSortDesc,
    chapters,
    ...chapterCardProps
}: Omit<ChapterCardProps, 'chapter'> & {
    index: number;
    isSortDesc: boolean;
    chapters: ChapterCardProps['chapter'][];
}) => {
    const missingChaptersGap = useMemo(
        () => Chapters.getGapToPrevious(index, isSortDesc, chapters),
        [index, isSortDesc, chapters],
    );
    const areChaptersMissing = missingChaptersGap > 0;

    return (
        <Stack sx={applyStyles(!isSortDesc, { flexDirection: 'column-reverse' })}>
            <ChapterCard {...chapterCardProps} chapter={chapters[index]} />
            {areChaptersMissing && <MissingChaptersInfoSeparator missingChaptersGap={missingChaptersGap} />}
        </Stack>
    );
};
