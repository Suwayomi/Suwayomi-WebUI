/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid2';
import { OverlayTapZone } from '@/modules/reader/components/tap-zones/OverlayTapZone.tsx';
import { PreviousTapZone } from '@/modules/reader/components/tap-zones/PreviousTapZone.tsx';
import { NextTapZone } from '@/modules/reader/components/tap-zones/NextTapZone.tsx';
import { TapZoneLayoutProps } from '@/modules/reader/types/TapZoneLayout.types.ts';

export const StandardTapZoneLayout = ({ onClickOverlay, onClickPrevious, onClickNext }: TapZoneLayoutProps) => (
    <Grid container sx={{ width: '100%', height: '100%' }}>
        <Grid size={4} sx={{ height: '100%' }}>
            <PreviousTapZone onClick={onClickPrevious} />
        </Grid>
        <Grid size={4} sx={{ height: '100%' }}>
            <OverlayTapZone onClick={onClickOverlay} />
        </Grid>
        <Grid size={4} sx={{ height: '100%' }}>
            <NextTapZone onClick={onClickNext} />
        </Grid>
    </Grid>
);
