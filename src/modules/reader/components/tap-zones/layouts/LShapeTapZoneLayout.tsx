/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid2';
import { PreviousTapZone } from '@/modules/reader/components/tap-zones/PreviousTapZone.tsx';
import { NextTapZone } from '@/modules/reader/components/tap-zones/NextTapZone.tsx';
import { OverlayTapZone } from '@/modules/reader/components/tap-zones/OverlayTapZone.tsx';
import { TapZoneLayoutProps } from '@/modules/reader/types/TapZoneLayout.types.ts';

export const LShapeTapZoneLayout = ({ onClickOverlay, onClickPrevious, onClickNext }: TapZoneLayoutProps) => (
    <Grid container sx={{ width: '100%', height: '100%' }}>
        <Grid size={12}>
            <PreviousTapZone onClick={onClickPrevious} />
        </Grid>
        <Grid size={4}>
            <PreviousTapZone onClick={onClickPrevious} />
        </Grid>
        <Grid size={4}>
            <OverlayTapZone onClick={onClickOverlay} />
        </Grid>
        <Grid size={4}>
            <NextTapZone onClick={onClickNext} />
        </Grid>
        <Grid size={12}>
            <NextTapZone onClick={onClickNext} />
        </Grid>
    </Grid>
);
