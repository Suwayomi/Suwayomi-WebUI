/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// adopted from: https://github.com/tachiyomiorg/tachiyomi/blob/master/app/src/main/java/eu/kanade/tachiyomi/widget/EmptyView.kt

import { useMemo } from 'react';
import Typography from '@mui/material/Typography';
import { SxProps, Theme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const ERROR_FACES = ['(･o･;)', 'Σ(ಠ_ಠ)', 'ಥ_ಥ', '(˘･_･˘)', '(；￣Д￣)', '(･Д･。'];

function getRandomErrorFace() {
    const randIndex = Math.floor(Math.random() * ERROR_FACES.length);
    return ERROR_FACES[randIndex];
}

export interface EmptyViewProps {
    message: string;
    messageExtra?: JSX.Element | string;
    retry?: () => void;
    noFaces?: boolean;
    sx?: SxProps<Theme>;
}

export function EmptyView({ message, messageExtra, retry, noFaces, sx }: EmptyViewProps) {
    const { t } = useTranslation();

    const errorFace = useMemo(() => getRandomErrorFace(), []);

    return (
        <Stack
            sx={{
                p: 2,
                textAlign: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '-webkit-fill-available',
                maxWidth: '100%',
                minHeight: '100%',
                pointerEvents: 'none',
                ...sx,
            }}
        >
            {!noFaces && (
                <Typography variant="h3" gutterBottom sx={{ pointerEvents: 'all' }}>
                    {errorFace}
                </Typography>
            )}
            <Typography variant="h5" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-line', pointerEvents: 'all' }}>
                {message}
            </Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-line', pointerEvents: 'all' }}>
                {messageExtra}
            </Typography>
            {retry && (
                <Button onClick={retry} sx={{ pointerEvents: 'all' }}>
                    {t('global.button.retry')}
                </Button>
            )}
        </Stack>
    );
}
