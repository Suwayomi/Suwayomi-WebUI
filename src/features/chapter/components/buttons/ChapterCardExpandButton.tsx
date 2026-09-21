/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { plural } from '@lingui/core/macro';
import Button from '@mui/material/Button';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import { useTheme } from '@mui/material/styles';

export const ChapterCardExpandButton = ({
    count,
    expanded,
    setExpanded,
}: {
    count: number;
    expanded: boolean;
    setExpanded: (state: boolean) => void;
}) => {
    const theme = useTheme();

    return (
        <Button
            sx={MUIUtil.mergeSx(
                {
                    maxWidth: 'fit-content',
                    justifyContent: 'flex-start',
                },
                theme.typography.caption,
            )}
            variant="text"
            size="small"
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            {...MUIUtil.preventRippleProp()}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setExpanded(!expanded);
            }}
        >
            <TypographyMaxLines lines={1} variant="caption" sx={{ textAlign: 'start' }}>
                {plural(count, {
                    one: 'Show # more chapter',
                    other: 'Show # more chapters',
                })}
            </TypographyMaxLines>
        </Button>
    );
};
