/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useContext } from 'react';
import { DEFAULT_CATEGORY_METADATA } from '@/modules/category/services/CategoryMetadata.ts';
import { LibraryOptions } from '@/modules/library/Library.types.ts';

type ContextType = {
    options: LibraryOptions;
    setOptions: React.Dispatch<React.SetStateAction<LibraryOptions>>;
};

export const LibraryOptionsContext = React.createContext<ContextType>({
    options: DEFAULT_CATEGORY_METADATA,
    setOptions: () => {},
});

export function useLibraryOptionsContext() {
    return useContext(LibraryOptionsContext);
}
