/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Fab } from '@mui/material';
import { Link } from 'react-router-dom';
import { PlayArrow } from '@mui/icons-material';

interface ResumeFABProps{
    chapter: IChapter
    mangaId: string
}

/**
 * It returns a link to the current chapter, and the current page
 * @param {ResumeFABProps} props - ResumeFABProps
 * @returns A link to the chapter page.
 */
export default function ResumeFab(props: ResumeFABProps) {
    const { chapter: { index, lastPageRead }, mangaId } = props;
    return (
        <Fab
            sx={{ position: 'fixed', bottom: '2em', right: '3em' }}
            component={Link}
            variant="extended"
            color="primary"
            to={`/manga/${mangaId}/chapter/${index}/page/${lastPageRead}`}
        >
            <PlayArrow />
            {index === 1 ? 'Start' : 'Resume' }
        </Fab>
    );
}
