/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useMemo } from 'react';
import { LibraryOptions } from '@/typings';
import { useLocalStorage } from '@/util/useStorage.tsx';
import { LibraryOptionsContext } from '@/components/context/LibraryOptionsContext';
import { getDefaultCategoryMetadata } from '@/lib/metadata/categoryMetadata.ts';

interface IProps {
    children: React.ReactNode;
}

export const LibraryOptionsContextProvider: React.FC<IProps> = ({ children }) => {
    const [options, setOptions] = useLocalStorage<LibraryOptions>('libraryOptions', getDefaultCategoryMetadata());

    const value = useMemo(
        () => ({ options: { ...getDefaultCategoryMetadata(), ...options }, setOptions }),
        [options, setOptions],
    );

    return <LibraryOptionsContext.Provider value={value}>{children}</LibraryOptionsContext.Provider>;
};
