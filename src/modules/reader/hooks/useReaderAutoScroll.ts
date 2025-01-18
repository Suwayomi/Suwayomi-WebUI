/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { useAutomaticScrolling } from '@/modules/core/hooks/useAutomaticScrolling.ts';

export const useReaderAutoScroll = (
    isOverlayVisible: boolean,
    automaticScrolling: ReturnType<typeof useAutomaticScrolling>,
): void => {
    useEffect(() => {
        if (isOverlayVisible) {
            automaticScrolling.pause();
            return;
        }

        automaticScrolling.resume();
    }, [isOverlayVisible, automaticScrolling.isPaused]);
};
