/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MutableRefObject, useEffect } from 'react';
import { TReaderOverlayContext } from '@/features/reader/overlay/ReaderOverlay.types.ts';
import { TReaderTapZoneContext } from '@/features/reader/tap-zones/TapZoneLayout.types.ts';

export const useReaderHideOverlayOnUserScroll = (
    isOverlayVisible: boolean,
    setIsOverlayVisible: TReaderOverlayContext['setIsVisible'],
    showPreview: TReaderTapZoneContext['showPreview'],
    setShowPreview: TReaderTapZoneContext['setShowPreview'],
    scrollElementRef: MutableRefObject<HTMLDivElement | null>,
) => {
    useEffect(() => {
        const handleScroll = () => {
            if (isOverlayVisible) {
                setIsOverlayVisible(false);
            }

            if (showPreview) {
                setShowPreview(false);
            }
        };

        scrollElementRef.current?.addEventListener('wheel', handleScroll);
        scrollElementRef.current?.addEventListener('touchmove', handleScroll);
        return () => {
            scrollElementRef.current?.removeEventListener('wheel', handleScroll);
            scrollElementRef.current?.removeEventListener('touchmove', handleScroll);
        };
    }, [isOverlayVisible, showPreview]);
};
