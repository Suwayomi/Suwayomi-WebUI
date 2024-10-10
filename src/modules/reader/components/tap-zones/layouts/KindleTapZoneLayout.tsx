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

export const KindleTapZoneLayout = ({ onClickOverlay, onClickPrevious, onClickNext }: TapZoneLayoutProps) => (
    <Stack sx={{ flexDirection: 'row', flexWrap: 'wrap', width: '100%', height: '100%' }}>
        <OverlayTapZone onClick={onClickOverlay} sx={{ flexBasis: '100%', height: '25%' }} />
        <PreviousTapZone onClick={onClickPrevious} sx={{ flexBasis: '35%', height: '75%', overflow: 'hidden' }} />
        <NextTapZone onClick={onClickNext} sx={{ flexBasis: '65%', height: '75%', overflow: 'hidden' }} />
    </Stack>
);
