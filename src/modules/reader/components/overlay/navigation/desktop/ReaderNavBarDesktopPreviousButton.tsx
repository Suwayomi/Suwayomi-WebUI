/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { ComponentProps } from 'react';
import { useGetOptionForDirection } from '@/theme.tsx';
import { ReaderNavBarDesktopNextPreviousButton } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktopNextPreviousButton.tsx';

export const ReaderNavBarDesktopPreviousButton = (
    props: ComponentProps<typeof ReaderNavBarDesktopNextPreviousButton>,
) => {
    const getOptionForDirection = useGetOptionForDirection();

    return (
        <ReaderNavBarDesktopNextPreviousButton {...props}>
            {getOptionForDirection(<KeyboardArrowLeftIcon />, <KeyboardArrowRightIcon />)}
        </ReaderNavBarDesktopNextPreviousButton>
    );
};
