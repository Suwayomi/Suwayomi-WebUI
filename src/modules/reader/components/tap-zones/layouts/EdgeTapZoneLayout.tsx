/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { OverlayTapZone } from '@/modules/reader/components/tap-zones/OverlayTapZone.tsx';
import { PreviousTapZone } from '@/modules/reader/components/tap-zones/PreviousTapZone.tsx';
import { NextTapZone } from '@/modules/reader/components/tap-zones/NextTapZone.tsx';
import { TapZoneLayoutProps } from '@/modules/reader/types/TapZoneLayout.types.ts';

export const EdgeTapZoneLayout = ({ onClickOverlay, onClickPrevious, onClickNext }: TapZoneLayoutProps) => (
    <Stack sx={{ flexDirection: 'row', width: '100%', height: '100%' }}>
        <NextTapZone onClick={onClickNext} sx={{ flexBasis: 'calc(100% / 3)', width: undefined }} />
        <Stack sx={{ flexBasis: 'calc(100% / 3)' }}>
            <OverlayTapZone onClick={onClickOverlay} sx={{ height: '60%' }} />
            <PreviousTapZone onClick={onClickPrevious} sx={{ height: '40%' }} />
        </Stack>
        <NextTapZone onClick={onClickNext} sx={{ flexBasis: 'calc(100% / 3)', width: undefined }} />
    </Stack>
);
