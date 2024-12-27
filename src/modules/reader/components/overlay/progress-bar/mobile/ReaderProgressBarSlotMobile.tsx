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

const START_END_GAP = '4px';
const POINT_SIZE = '3px';
const ProgressBarPagePoint = memo(
    ({
        isTrailingPage,
        pagesIndex,
        totalPages,
    }: {
        isTrailingPage: boolean;
        pagesIndex: number;
        totalPages: number;
    }) => {
        const isFirstPage = pagesIndex === 0;
        const isLastPage = pagesIndex === totalPages - 1;

        const left = `${(pagesIndex / (totalPages - 1)) * 100}%`;

        return (
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left,
                    ...applyStyles(isFirstPage, {
                        left: START_END_GAP,
                    }),
                    ...applyStyles(isLastPage, {
                        left: `calc(${left} - ${START_END_GAP})`,
                    }),
                    transform: 'translate(-50%, -50%)',
                    width: POINT_SIZE,
                    height: POINT_SIZE,
                    borderRadius: 100,
                    backgroundColor: 'background.paper',
                    ...applyStyles(isTrailingPage, {
                        backgroundColor: 'primary.main',
                    }),
                    zIndex: 1,
                }}
            />
        );
    },
);

export const ReaderProgressBarSlotMobile = memo(
    ({
        pageName,
        isTrailingPage,
        pagesIndex,
        totalPages,
    }: {
        pageName: string;
        isTrailingPage: boolean;
        pagesIndex: number;
        totalPages: number;
    }) => (
        <ReaderProgressBarSlot
            pageName={pageName}
            progressBarPosition={ProgressBarPosition.BOTTOM}
            slotProps={{ box: { sx: SLOT_SX_PROP } }}
        >
            <ProgressBarPagePoint isTrailingPage={isTrailingPage} pagesIndex={pagesIndex} totalPages={totalPages} />
        </ReaderProgressBarSlot>
    ),
);
