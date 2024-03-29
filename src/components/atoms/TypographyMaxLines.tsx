/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import styled from '@emotion/styled';
import { Typography, TypographyProps } from '@mui/material';

export const TypographyMaxLines = styled(Typography, {
    shouldForwardProp: (prop) => prop !== 'lines',
})<{
    lines?: number;
}>(({ lines = 2 }) => ({
    lineHeight: '1.5rem',
    maxHeight: '3rem',
    display: '-webkit-box',
    WebkitLineClamp: `${lines}`,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
})) as React.FC<TypographyProps & { lines?: number }>;
