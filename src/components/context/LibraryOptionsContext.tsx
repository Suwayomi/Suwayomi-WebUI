/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext } from 'react';

type ContextType = {
    // display options
    options: LibraryDisplayOptions;
    setOptions: React.Dispatch<React.SetStateAction<LibraryDisplayOptions>>;
};

const LibraryOptionsContext = React.createContext<ContextType>({
    options: {
        showDownloadBadge: false, showUnreadBadge: false, gridLayout: 0, SourcegridLayout: 0,
    },
    setOptions: () => {},
});

export default LibraryOptionsContext;

export function useLibraryOptionsContext() {
    return useContext(LibraryOptionsContext);
}
