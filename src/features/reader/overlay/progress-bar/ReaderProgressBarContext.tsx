/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, useContext, ReactNode, useMemo, useState } from 'react';
import { TReaderProgressBarContext } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.types.ts';

export const ReaderProgressBarContext = createContext<TReaderProgressBarContext>({
    isMaximized: false,
    setIsMaximized: () => undefined,
    isDragging: false,
    setIsDragging: () => undefined,
});

export const useReaderProgressBarContext = () => useContext(ReaderProgressBarContext);

export const ReaderProgressBarContextProvider = ({ children }: { children: ReactNode }) => {
    const [isMaximized, setIsMaximized] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const value = useMemo(
        () => ({ isMaximized, setIsMaximized, isDragging, setIsDragging }),
        [isMaximized, isDragging],
    );

    return <ReaderProgressBarContext.Provider value={value}>{children}</ReaderProgressBarContext.Provider>;
};
