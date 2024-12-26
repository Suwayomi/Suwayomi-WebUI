/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { ComponentProps, memo } from 'react';
import { ProgressBarPosition } from '@/modules/reader/types/Reader.types.ts';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';
import { ReaderProgressBarSlot } from '@/modules/reader/components/overlay/progress-bar/ReaderProgressBarSlot';

const SLOT_SX_PROP: NonNullable<NonNullable<ComponentProps<typeof ReaderProgressBarSlot>['slotProps']>['box']>['sx'] = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'end',
    position: 'relative',
    backgroundColor: 'background.default',
};

const ProgressBarPagePoint = memo(({ isTrailingPage }: { isTrailingPage: boolean }) => (
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
));

export const ReaderProgressBarSlotMobile = memo(
    ({ pageName, isTrailingPage }: { pageName: string; isTrailingPage: boolean }) => (
        <ReaderProgressBarSlot
            pageName={pageName}
            progressBarPosition={ProgressBarPosition.BOTTOM}
            slotProps={{ box: { sx: SLOT_SX_PROP } }}
        >
            <ProgressBarPagePoint isTrailingPage={isTrailingPage} />
        </ReaderProgressBarSlot>
    ),
);
