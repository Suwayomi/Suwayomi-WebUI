/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, useContext, ReactNode, useMemo, useState } from 'react';
import { TReaderTapZoneContext } from '@/features/reader/tap-zones/TapZoneLayout.types.ts';

export const ReaderTapZoneContext = createContext<TReaderTapZoneContext>({
    showPreview: false,
    setShowPreview: () => undefined,
});

export const useReaderTapZoneContext = () => useContext(ReaderTapZoneContext);

export const ReaderTapZoneContextProvider = ({ children }: { children: ReactNode }) => {
    const [showPreview, setShowPreview] = useState(false);

    const value = useMemo(() => ({ showPreview, setShowPreview }), [showPreview]);

    return <ReaderTapZoneContext.Provider value={value}>{children}</ReaderTapZoneContext.Provider>;
};
