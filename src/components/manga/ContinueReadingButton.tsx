/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { Button, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import { Link } from 'react-router-dom';

export const ContinueReadingButton = ({
    showContinueReadingButton,
    isLatestChapterRead,
    nextChapterIndexToRead,
    mangaLinkTo,
}: {
    showContinueReadingButton: boolean;
    isLatestChapterRead: boolean;
    nextChapterIndexToRead: number;
    mangaLinkTo: string;
}) => {
    const { t } = useTranslation();

    const isFirstChapter = nextChapterIndexToRead === 1;

    if (!showContinueReadingButton || isLatestChapterRead) {
        return null;
    }

    return (
        <Tooltip title={t(isFirstChapter ? 'global.button.start' : 'global.button.resume')}>
            <Button
                variant="contained"
                size="small"
                sx={{ minWidth: 'unset' }}
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
