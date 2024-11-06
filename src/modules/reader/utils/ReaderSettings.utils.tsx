/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { IReaderSettings, ReaderPageScaleMode, ReadingMode } from '@/modules/reader/types/Reader.types.ts';
import { DEFAULT_READER_PROFILE } from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { ValueToDisplayData } from '@/modules/core/Core.types.ts';

export const isOffsetDoubleSpreadPagesEditable = (readingMode: IReaderSettings['readingMode']): boolean =>
    readingMode === ReadingMode.DOUBLE_PAGE;

export const createProfileValueToDisplayData = (
    profiles: string[],
    setIcon: boolean = false,
): ValueToDisplayData<string> =>
    Object.fromEntries(
        profiles.map((profile) => [
            profile,
            {
                isTitleString: profile !== DEFAULT_READER_PROFILE,
                title: profile === DEFAULT_READER_PROFILE ? 'global.label.standard' : profile,
                icon: setIcon ? <ManageAccountsIcon /> : null,
            },
        ]),
    ) as ValueToDisplayData<string>;

export const getValidReaderProfile = (profile: string, profiles: string[]): string =>
    profiles.includes(profile) ? profile : DEFAULT_READER_PROFILE;

export const isReaderWidthEditable = (pageScaleMode: IReaderSettings['pageScaleMode']): boolean =>
    [ReaderPageScaleMode.WIDTH, ReaderPageScaleMode.SCREEN].includes(pageScaleMode);

export const isContinuousReadingMode = (readingMode: IReaderSettings['readingMode']): boolean =>
    [ReadingMode.CONTINUOUS_VERTICAL, ReadingMode.CONTINUOUS_HORIZONTAL].includes(readingMode);
