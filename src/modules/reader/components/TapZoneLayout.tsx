/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { useCallback, useLayoutEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useReaderTapZoneContext } from '@/modules/reader/contexts/ReaderTapZoneContext.tsx';
import { ReaderTapZoneService } from '@/modules/reader/services/ReaderTapZoneService.ts';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { ReadingDirection } from '@/modules/reader/types/Reader.types.ts';

const CANVAS_ID = 'reader-tap-zone-layout-canvas';

export const TapZoneLayout = () => {
    const theme = useTheme();
    const { readerNavBarWidth } = useNavBarContext();
    const { showPreview } = useReaderTapZoneContext();
    const { tapZoneLayout, readingDirection, tapZoneInvertMode } = ReaderService.useSettings();

    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [tapZoneLayoutElement, setTapZoneLayoutElement] = useState<HTMLDivElement | null>(null);
    useResizeObserver(
        tapZoneLayoutElement,
        useCallback(() => {
            setWidth(tapZoneLayoutElement?.clientWidth ?? 0);
            setHeight(tapZoneLayoutElement?.clientHeight ?? 0);
        }, [tapZoneLayoutElement]),
    );

    const canvas = ReaderTapZoneService.getOrCreateCanvas(tapZoneLayout, width, height, theme.typography.h3, {
        vertical: tapZoneInvertMode.vertical,
        horizontal: tapZoneInvertMode.horizontal,
        isRTL: readingDirection === ReadingDirection.RTL,
    });

    useLayoutEffect(() => {
        const canvasContainerElement = document.getElementById(CANVAS_ID);
        canvasContainerElement?.replaceChildren(canvas);
    }, [canvas]);

    return (
        <Box
            ref={setTapZoneLayoutElement}
            sx={{
                position: 'fixed',
                top: 0,
                left: readerNavBarWidth,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
            }}
        >
            {showPreview && <div id={CANVAS_ID} />}
        </Box>
    );
};
