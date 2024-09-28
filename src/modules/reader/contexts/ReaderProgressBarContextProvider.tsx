/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useMemo, useState } from 'react';
import { ReaderProgressBarContext } from '@/modules/reader/contexts/ReaderProgressBarContext.tsx';

export const ReaderProgressBarContextProvider = ({ children }: { children: ReactNode }) => {
    const [isMaximized, setIsMaximized] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const value = useMemo(
        () => ({ isMaximized, setIsMaximized, isDragging, setIsDragging }),
        [isMaximized, isDragging],
    );

    return <ReaderProgressBarContext.Provider value={value}>{children}</ReaderProgressBarContext.Provider>;
};
