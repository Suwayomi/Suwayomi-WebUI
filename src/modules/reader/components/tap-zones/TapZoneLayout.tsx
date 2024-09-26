/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { ReactElement, useRef } from 'react';
import { TapZoneLayouts, TapZoneLayoutProps } from '@/modules/reader/types/TapZoneLayout.types.ts';
import { EdgeTapZoneLayout } from '@/modules/reader/components/tap-zones/layouts/EdgeTapZoneLayout.tsx';
import { StandardTapZoneLayout } from '@/modules/reader/components/tap-zones/layouts/StandardTapZoneLayout.tsx';
import { KindleTapZoneLayout } from '@/modules/reader/components/tap-zones/layouts/KindleTapZoneLayout.tsx';
import { LShapeTapZoneLayout } from '@/modules/reader/components/tap-zones/layouts/LShapeTapZoneLayout.tsx';

const TAP_ZONE_LAYOUT_TO_COMPONENT: Record<TapZoneLayouts, (props: TapZoneLayoutProps) => ReactElement> = {
    [TapZoneLayouts.EDGE]: EdgeTapZoneLayout,
    [TapZoneLayouts.STANDARD]: StandardTapZoneLayout,
    [TapZoneLayouts.KINDLE]: KindleTapZoneLayout,
    [TapZoneLayouts.L_SHAPE]: LShapeTapZoneLayout,
};

export const TapZoneLayout = ({
    showPreview,
    layout,
    ...tapZoneProps
}: TapZoneLayoutProps & {
    showPreview: boolean;
    layout: TapZoneLayouts;
}) => {
    const TapZoneLayoutComponent = TAP_ZONE_LAYOUT_TO_COMPONENT[layout];

    const tapZoneRef = useRef<HTMLDivElement | null>(null);
    const isRightClickSimulationActiveRef = useRef(false);

    return (
        <Stack
            ref={tapZoneRef}
            sx={{
                position: 'fixed',
                top: 0,
                width: '100%',
                height: '100%',
                opacity: Number(showPreview),
                transition: (theme) => `opacity 0.${theme.transitions.duration.shortest}s`,
            }}
            onContextMenu={(e) => {
                if (!tapZoneRef.current) {
                    return;
                }

                if (isRightClickSimulationActiveRef.current) {
                    return;
                }

                isRightClickSimulationActiveRef.current = true;
                tapZoneRef.current.style.pointerEvents = 'none';

                tapZoneRef.current.dispatchEvent(
                    new MouseEvent('contextmenu', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        clientX: e.clientX,
                        clientY: e.clientY,
                    }),
                );

                setTimeout(() => {
                    isRightClickSimulationActiveRef.current = false;
                    tapZoneRef.current!.style.pointerEvents = 'auto';
                }, 5);
            }}
        >
            <TapZoneLayoutComponent {...tapZoneProps} />
        </Stack>
    );
};
