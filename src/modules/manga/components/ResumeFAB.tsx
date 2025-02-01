/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Link } from 'react-router-dom';
import PlayArrow from '@mui/icons-material/PlayArrow';
import { useTranslation } from 'react-i18next';
import { StyledFab } from '@/modules/core/components/buttons/StyledFab.tsx';
import {
    ChapterMangaInfo,
    ChapterReadInfo,
    Chapters,
    ChapterSourceOrderInfo,
} from '@/modules/chapter/services/Chapters.ts';

export function ResumeFab({ chapter }: { chapter: ChapterMangaInfo & ChapterSourceOrderInfo & ChapterReadInfo }) {
    const { t } = useTranslation();

    const { sourceOrder } = chapter;
    return (
        <StyledFab
            component={Link}
            variant="extended"
            color="primary"
            to={Chapters.getReaderUrl(chapter)}
            state={Chapters.getReaderOpenChapterLocationState(chapter)}
        >
            <PlayArrow />
            {sourceOrder === 1 ? t('global.button.start') : t('global.button.resume')}
        </StyledFab>
    );
}
