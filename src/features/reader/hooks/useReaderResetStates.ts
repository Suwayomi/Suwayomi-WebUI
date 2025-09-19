/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { TReaderStateSettingsContext } from '@/features/reader/Reader.types.ts';
import { DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG } from '@/features/reader/settings/ReaderSettingsMetadata.ts';
import { getReaderStore } from '@/features/reader/ReaderStore.ts';

export const useReaderResetStates = (setSettings: TReaderStateSettingsContext['setSettings']) => {
    useEffect(
        () => () => {
            getReaderStore().reset();

            setSettings(DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG);
        },
        [],
    );
};
