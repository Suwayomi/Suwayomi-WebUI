/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { ProgressBarPosition } from '@/modules/reader/types/Reader.types.ts';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';
import { ReaderProgressBarSlot } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBarSlot';

export const ReaderProgressBarSlotMobile = ({
    pageName,
    isTrailingPage,
}: {
    pageName: string;
    isTrailingPage: boolean;
}) => (
    <ReaderProgressBarSlot
        pageName={pageName}
        progressBarPosition={ProgressBarPosition.BOTTOM}
        slotProps={{
            box: {
                sx: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'end',
                    position: 'relative',
                    backgroundColor: 'background.default',
                },
            },
        }}
    >
        <Box
            sx={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                right: '2px',
                width: '2px',
                height: '2px',
                borderRadius: 100,
                backgroundColor: 'background.paper',
                ...applyStyles(isTrailingPage, {
                    backgroundColor: 'primary.main',
                }),
                zIndex: 1,
            }}
        />
    </ReaderProgressBarSlot>
);
