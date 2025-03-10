/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { ComponentProps, ReactNode } from 'react';
import Stack from '@mui/material/Stack';
import { TypographyMaxLines } from '@/modules/core/components/TypographyMaxLines.tsx';

export const ChapterCardMetadata = ({
    title,
    secondaryText,
    ternaryText,
    infoIcons,
    slotProps,
}: {
    title: string;
    secondaryText?: string | null;
    ternaryText?: string | null;
    infoIcons?: ReactNode;
    slotProps?: {
        title?: ComponentProps<typeof TypographyMaxLines>;
        secondaryText?: ComponentProps<typeof TypographyMaxLines>;
        ternaryText?: ComponentProps<typeof TypographyMaxLines>;
    };
}) => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flexGrow: 1,
            flexShrink: 1,
            wordBreak: 'break-word',
        }}
    >
        <Stack
            sx={{
                flexDirection: 'row',
                gap: 0.5,
                alignItems: 'center',
            }}
        >
            {infoIcons}
            <TypographyMaxLines variant="h6" component="h3" {...slotProps?.title}>
                {title}
            </TypographyMaxLines>
        </Stack>
        {secondaryText && (
            <TypographyMaxLines variant="caption" display="block" lines={1} {...slotProps?.secondaryText}>
                {secondaryText}
            </TypographyMaxLines>
        )}
        {ternaryText && (
            <TypographyMaxLines variant="caption" display="block" lines={1} {...slotProps?.ternaryText}>
                {ternaryText}
            </TypographyMaxLines>
        )}
    </Box>
);
