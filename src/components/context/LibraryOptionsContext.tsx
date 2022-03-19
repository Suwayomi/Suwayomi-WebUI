/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext } from 'react';

/**
 * The ContextType type is a type that has a property called options, which is a LibraryDisplayOptions
 * type, and a property called setOptions, which is a function that takes a LibraryDisplayOptions type
 * and returns nothing.
 * @property {LibraryDisplayOptions} options - The display options for the library.
 * @property setOptions - A function that takes a new set of display options and updates the state.
 */
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

/**
 * It returns the value of the LibraryOptionsContext.
 * @returns A function that returns the library options.
 */
export function useLibraryOptionsContext() {
    return useContext(LibraryOptionsContext);
}
