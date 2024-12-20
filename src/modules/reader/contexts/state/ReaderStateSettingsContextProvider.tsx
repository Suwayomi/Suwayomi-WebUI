/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useMemo, useState } from 'react';
import { ReaderStateSettingsContext } from '@/modules/reader/contexts/state/ReaderStateSettingsContext.tsx';
import { DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG } from '@/modules/reader/services/ReaderSettingsMetadata.ts';
import { TReaderStateSettingsContext } from '@/modules/reader/types/Reader.types.ts';

export const ReaderStateSettingsContextProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<TReaderStateSettingsContext['settings']>(
        DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG,
    );

    const value = useMemo(() => ({ settings, setSettings }), [settings]);

    return <ReaderStateSettingsContext.Provider value={value}>{children}</ReaderStateSettingsContext.Provider>;
};
