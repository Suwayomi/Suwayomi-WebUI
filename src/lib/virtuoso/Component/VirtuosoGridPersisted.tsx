/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ComponentProps } from 'react';
import { useRef } from 'react';
import type { GridStateSnapshot, VirtuosoGridHandle } from 'react-virtuoso';
import { VirtuosoGrid } from 'react-virtuoso';
import { useMergedRef } from '@mantine/hooks';
import { VirtuosoUtil } from '@/lib/virtuoso/Virtuoso.util.tsx';

export const VirtuosoGridPersisted = ({
    ref: passedRef,
    persistKey,
    ...props
}: ComponentProps<typeof VirtuosoGrid> & { persistKey: string }) => {
    const { state, persistState } = VirtuosoUtil.usePersistState<GridStateSnapshot>(persistKey);

    const localRef = useRef<VirtuosoGridHandle>(undefined);
    const ref = useMergedRef(localRef, passedRef);

    return <VirtuosoGrid {...props} ref={ref} stateChanged={persistState} restoreStateFrom={state} />;
};
