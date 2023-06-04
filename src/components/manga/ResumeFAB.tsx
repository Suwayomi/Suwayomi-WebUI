/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { PlayArrow } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { IChapter } from '@/typings';
import { BACK } from '@/util/useBackTo';
import StyledFab from '@/components/util/StyledFab';

interface ResumeFABProps {
    chapter: IChapter;
    mangaId: string;
}

export default function ResumeFab(props: ResumeFABProps) {
    const { t } = useTranslation();

    const {
        chapter: { index, lastPageRead },
        mangaId,
    } = props;
    return (
        <StyledFab
            component={Link}
            variant="extended"
            color="primary"
            to={`/manga/${mangaId}/chapter/${index}/page/${lastPageRead}`}
            state={{ backLink: BACK }}
        >
            <PlayArrow />
            {index === 1 ? t('global.button.start') : t('global.button.resume')}
        </StyledFab>
    );
}
