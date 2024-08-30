/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import { Link } from 'react-router-dom';

export const ContinueReadingButton = ({
    showContinueReadingButton,
    nextChapterIndexToRead,
    mangaLinkTo,
}: {
    showContinueReadingButton: boolean;
    nextChapterIndexToRead?: number;
    mangaLinkTo: string;
}) => {
    const { t } = useTranslation();

    const isFirstChapter = nextChapterIndexToRead === 1;

    if (!showContinueReadingButton || nextChapterIndexToRead === undefined) {
        return null;
    }

    return (
        <Tooltip title={t(isFirstChapter ? 'global.button.start' : 'global.button.resume')}>
            <Button
                variant="contained"
                size="small"
                sx={{ minWidth: 'unset', py: 0.5, px: 0.75 }}
                component={Link}
                to={`${mangaLinkTo}chapter/${nextChapterIndexToRead}`}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <PlayArrowIcon />
            </Button>
        </Tooltip>
    );
};
