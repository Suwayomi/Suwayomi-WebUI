/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { IReaderSettings } from '@/features/reader/Reader.types.ts';
import { getReaderAutoScrollStore, useReaderAutoScrollStore } from '@/features/reader/stores/ReaderStore.ts';

export const useReaderAutoScroll = (isOverlayVisible: boolean, isStaticNav: IReaderSettings['isStaticNav']): void => {
    const { isPaused } = useReaderAutoScrollStore((state) => ({
        isPaused: state.autoScroll.isPaused,
    }));

    useEffect(() => {
        const { pause, resume } = getReaderAutoScrollStore();

        if (isOverlayVisible && !isStaticNav) {
            pause();
            return;
        }

        resume();
    }, [isOverlayVisible, isPaused, isStaticNav]);
};
