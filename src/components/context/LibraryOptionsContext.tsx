/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext } from 'react';

type ContextType = {
    options: LibraryOptions;
    setOptions: React.Dispatch<React.SetStateAction<LibraryOptions>>;
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
    setOptions: () => {},
});

export default LibraryOptionsContext;

export function useLibraryOptionsContext() {
    return useContext(LibraryOptionsContext);
}
