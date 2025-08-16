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
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { ChapterReadInfo, ChapterSourceOrderInfo } from '@/features/chapter/Chapter.types.ts';

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
                {...MUIUtil.preventRippleProp()}
                variant="contained"
                size="small"
                sx={{ minWidth: 'unset', py: 0.5, px: 0.75 }}
                component={Link}
                to={`${mangaLinkTo}/chapter/${chapter.sourceOrder}`}
                state={Chapters.getReaderOpenChapterLocationState(chapter)}
                onClick={(e) => e.stopPropagation()}
            >
                <PlayArrowIcon />
            </Button>
        </CustomTooltip>
    );
};
