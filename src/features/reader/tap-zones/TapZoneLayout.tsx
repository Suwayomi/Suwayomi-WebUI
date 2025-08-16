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
import { useReaderTapZoneContext } from '@/features/reader/tap-zones/ReaderTapZoneContext.tsx';
import { ReaderTapZoneService } from '@/features/reader/tap-zones/ReaderTapZoneService.ts';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { useResizeObserver } from '@/base/hooks/useResizeObserver.tsx';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { IReaderSettings, ReadingDirection } from '@/features/reader/Reader.types.ts';
import { withPropsFrom } from '@/base/hoc/withPropsFrom.tsx';
import { NavbarContextType } from '@/features/navigation-bar/NavigationBar.types.ts';
import { TReaderTapZoneContext } from '@/features/reader/tap-zones/TapZoneLayout.types.ts';

const CANVAS_ID = 'reader-tap-zone-layout-canvas';

const BaseTapZoneLayout = ({
    readerNavBarWidth,
    showPreview,
    tapZoneLayout,
    tapZoneInvertMode,
    readingDirection,
}: Pick<NavbarContextType, 'readerNavBarWidth'> &
    Pick<TReaderTapZoneContext, 'showPreview'> &
    Pick<IReaderSettings, 'tapZoneLayout' | 'tapZoneInvertMode' | 'readingDirection'>) => {
    const theme = useTheme();

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
    }, [canvas, showPreview]);

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

export const TapZoneLayout = withPropsFrom(
    BaseTapZoneLayout,
    [useNavBarContext, useReaderTapZoneContext, ReaderService.useSettingsWithoutDefaultFlag],
    ['readerNavBarWidth', 'showPreview', 'tapZoneLayout', 'tapZoneInvertMode', 'readingDirection'],
);
