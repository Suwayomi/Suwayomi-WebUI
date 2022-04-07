/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext } from 'react';

type ContextType = {
    options: LibraryOptions;

    setOption: <Name extends keyof LibraryOptions>(
        name: Name,
        value: React.SetStateAction<LibraryOptions[Name]>
    ) => void;

    setOptions: React.Dispatch<React.SetStateAction<LibraryOptions>>;

    active: boolean
    activeSort: boolean
};

export const DefaultLibraryOptions: LibraryOptions = {
    showDownloadBadge: false,
    showUnreadBadge: false,
    gridLayout: 0,
    SourcegridLayout: 0,

    downloaded: undefined,
    sortDesc: undefined,
    sorts: undefined,
    unread: undefined,
};

const LibraryOptionsContext = React.createContext<ContextType>({
    options: DefaultLibraryOptions,
    setOption: () => {},
    setOptions: () => {},
    active: false,
    activeSort: false,
});

export default LibraryOptionsContext;

export function useLibraryOptionsContext() {
    return useContext(LibraryOptionsContext);
}
