/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, useContext } from 'react';
import { IReaderSettingsWithDefaultFlag } from '@/modules/reader/types/Reader.types.ts';
import { DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG } from '@/modules/reader/services/ReaderSettingsMetadata.ts';

type TReaderStateSettingsContext = {
    settings: IReaderSettingsWithDefaultFlag;
    setSettings: (settings: IReaderSettingsWithDefaultFlag) => void;
};

export const ReaderStateSettingsContext = createContext<TReaderStateSettingsContext>({
    settings: DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG,
    setSettings: () => undefined,
});

export const useReaderStateSettingsContext = () => useContext(ReaderStateSettingsContext);
