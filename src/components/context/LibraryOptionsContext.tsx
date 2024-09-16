/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useContext } from 'react';
import { LibraryOptions } from '@/typings';

type ContextType = {
    options: LibraryOptions;
    setOptions: React.Dispatch<React.SetStateAction<LibraryOptions>>;
};

export enum GridLayout {
    Compact = 0,
    Comfortable = 1,
    List = 2,
}

export const DefaultLibraryOptions: LibraryOptions = {
    // display options
    showContinueReadingButton: false,
    showDownloadBadge: false,
    showUnreadBadge: false,
    gridLayout: GridLayout.Compact,
    sourceGridLayout: GridLayout.Compact,

    showTabSize: false,

    // sort options
    sortDesc: undefined,
    sortBy: undefined,

    // filter options
    hasDownloadedChapters: undefined,
    hasBookmarkedChapters: undefined,
    hasUnreadChapters: undefined,
    hasDuplicateChapters: undefined,
    hasTrackerBinding: {},
    hasStatus: {} as LibraryOptions['hasStatus'],
};

export const LibraryOptionsContext = React.createContext<ContextType>({
    options: DefaultLibraryOptions,
    setOptions: () => {},
});

export function useLibraryOptionsContext() {
    return useContext(LibraryOptionsContext);
}
