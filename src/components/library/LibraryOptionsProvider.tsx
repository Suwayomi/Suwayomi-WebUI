/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import LibraryOptionsContext, {
    DefaultLibraryOptions,
} from 'components/context/LibraryOptionsContext';
import React from 'react';
import useLocalStorage from 'util/useLocalStorage';

interface IProps {
    children: React.ReactNode;
}

const LibraryOptionsContextProvider: React.FC<IProps> = ({ children }) => {
    const [options, setOptions] = useLocalStorage<LibraryOptions>(
        'libraryOptions',
        DefaultLibraryOptions,
    );

    return (
        <LibraryOptionsContext.Provider value={{ options, setOptions }}>
            {children}
        </LibraryOptionsContext.Provider>
    );
};

export default LibraryOptionsContextProvider;
