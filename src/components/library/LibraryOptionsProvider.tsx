/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import LibraryOptionsContext from 'components/context/LibraryOptionsContext';
import useLocalStorage from 'util/useLocalStorage';

interface IProps {
    children: React.ReactNode;
}

export default function LibraryOptionsContextProvider({ children }: IProps) {
    const [options, setOptions] = useLocalStorage<LibraryDisplayOptions>('libraryOptions',
        { showDownloadBadge: false, showUnreadBadge: false });

    return (
        <LibraryOptionsContext.Provider value={{ options, setOptions }}>
            {children}
        </LibraryOptionsContext.Provider>
    );
}
