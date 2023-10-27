/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Link } from 'react-router-dom';
import { PlayArrow } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { StyledFab } from '@/components/util/StyledFab';

interface ResumeFABProps {
    chapterIndex: number;
    mangaId: number;
}

export function ResumeFab(props: ResumeFABProps) {
    const { t } = useTranslation();

    const { chapterIndex, mangaId } = props;
    return (
        <StyledFab component={Link} variant="extended" color="primary" to={`/manga/${mangaId}/chapter/${chapterIndex}`}>
            <PlayArrow />
            {chapterIndex === 1 ? t('global.button.start') : t('global.button.resume')}
        </StyledFab>
    );
}
