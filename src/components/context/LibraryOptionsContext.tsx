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
    showContinueReadingButton: false,
    showDownloadBadge: false,
    showUnreadBadge: false,
    gridLayout: GridLayout.Compact,
    SourcegridLayout: GridLayout.Compact,

    downloaded: undefined,
    bookmarked: undefined,
    sortDesc: undefined,
    sorts: undefined,
    unread: undefined,
    hasDuplicateChapters: undefined,
    tracker: {},

    showTabSize: false,
};

export const LibraryOptionsContext = React.createContext<ContextType>({
    options: DefaultLibraryOptions,
    setOptions: () => {},
});

export function useLibraryOptionsContext() {
    return useContext(LibraryOptionsContext);
}
