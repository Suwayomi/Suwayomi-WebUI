/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { TReaderStateSettingsContext } from '@/features/reader/Reader.types.ts';
import { DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG } from '@/features/reader/settings/ReaderSettingsMetadata.ts';

export const ReaderStateSettingsContext = createContext<TReaderStateSettingsContext>({
    settings: DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG,
    setSettings: () => undefined,
});

export const useReaderStateSettingsContext = () => useContext(ReaderStateSettingsContext);

export const ReaderStateSettingsContextProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<TReaderStateSettingsContext['settings']>(
        DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG,
    );

    const value = useMemo(() => ({ settings, setSettings }), [settings]);

    return <ReaderStateSettingsContext.Provider value={value}>{children}</ReaderStateSettingsContext.Provider>;
};
