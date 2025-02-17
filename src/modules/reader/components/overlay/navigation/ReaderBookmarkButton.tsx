/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'react-i18next';
import { memo } from 'react';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { actionToTranslationKey, ChapterAction, Chapters } from '@/modules/chapter/services/Chapters.ts';
import { TChapterReader } from '@/modules/chapter/Chapter.types.ts';

const BaseReaderBookmarkButton = ({ id, isBookmarked }: Pick<TChapterReader, 'id' | 'isBookmarked'>) => {
    const { t } = useTranslation();

    const bookmarkAction: Extract<ChapterAction, 'unbookmark' | 'bookmark'> = isBookmarked ? 'unbookmark' : 'bookmark';

    return (
        <CustomTooltip title={t(actionToTranslationKey[bookmarkAction].action.single)}>
            <IconButton onClick={() => Chapters.performAction(bookmarkAction, [id], {})} color="inherit">
                {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
        </CustomTooltip>
    );
};

export const ReaderBookmarkButton = memo(BaseReaderBookmarkButton);
