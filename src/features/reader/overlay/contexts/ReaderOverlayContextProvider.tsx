/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useMemo, useState } from 'react';
import { ReaderOverlayContext } from '@/features/reader/overlay/contexts/ReaderOverlayContext.tsx';

export const ReaderOverlayContextProvider = ({ children }: { children: ReactNode }) => {
    const [isVisible, setIsVisible] = useState(false);

    const value = useMemo(() => ({ isVisible, setIsVisible }), [isVisible]);

    return <ReaderOverlayContext.Provider value={value}>{children}</ReaderOverlayContext.Provider>;
};
