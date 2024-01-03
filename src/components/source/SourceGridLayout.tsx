/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { GridLayout, useLibraryOptionsContext } from '@/components/context/LibraryOptionsContext';
import { GridLayouts } from '@/components/source/GridLayouts.tsx';

export function SourceGridLayout() {
    const {
        options: { SourcegridLayout },
        setOptions,
    } = useLibraryOptionsContext();

    function setGridContextOptions(gridLayout: GridLayout) {
        setOptions((prev: any) => ({ ...prev, SourcegridLayout: gridLayout }));
    }

    return <GridLayouts gridLayout={SourcegridLayout} onChange={setGridContextOptions} />;
}
