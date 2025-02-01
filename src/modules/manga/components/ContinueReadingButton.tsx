/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Link } from 'react-router-dom';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { ChapterReadInfo, Chapters, ChapterSourceOrderInfo } from '@/modules/chapter/services/Chapters.ts';

export const ContinueReadingButton = ({
    showContinueReadingButton,
    chapter,
    mangaLinkTo,
}: {
    showContinueReadingButton: boolean;
    chapter?: (ChapterSourceOrderInfo & ChapterReadInfo) | null;
    mangaLinkTo: string;
}) => {
    const { t } = useTranslation();

    if (!showContinueReadingButton || !chapter) {
        return null;
    }

    const { sourceOrder } = chapter;
    const isFirstChapter = sourceOrder === 1;

    return (
        <CustomTooltip title={t(isFirstChapter ? 'global.button.start' : 'global.button.resume')}>
            <Button
                variant="contained"
                size="small"
                sx={{ minWidth: 'unset', py: 0.5, px: 0.75 }}
                component={Link}
                to={`${mangaLinkTo}/chapter/${chapter.sourceOrder}`}
                state={Chapters.getReaderOpenChapterLocationState(chapter)}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <PlayArrowIcon />
            </Button>
        </CustomTooltip>
    );
};
