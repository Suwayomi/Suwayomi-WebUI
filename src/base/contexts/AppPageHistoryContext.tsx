/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { useHistory } from '@/base/hooks/useHistory.ts';
import { noOp } from '@/lib/HelperFunctions.ts';
import { useForceUpdate } from '@mantine/hooks';

interface IAppPageHistoryContext {
    history: string[];
    onBack: () => Promise<boolean> | boolean;
    setOnBack: (subscriber: (() => Promise<boolean> | boolean) | null) => void;
}

export const AppPageHistoryContext = createContext<IAppPageHistoryContext>({
    history: [],
    onBack: () => true,
    setOnBack: noOp,
});

export const useAppPageHistoryContext = () => useContext(AppPageHistoryContext);

export const AppPageHistoryContextProvider = ({ children }: { children: React.ReactNode }) => {
    const forceUpdate = useForceUpdate();
    const history = useHistory();

    const onBackRef = useRef<IAppPageHistoryContext['onBack']>(() => true);

    const setOnBack = useCallback((callback: (() => Promise<boolean> | boolean) | null) => {
        onBackRef.current = callback ?? (() => true);
        forceUpdate();
    }, []);

    const value = useMemo(
        () => ({
            history,
            onBack: onBackRef.current,
            setOnBack,
        }),
        [history, onBackRef.current, setOnBack],
    );

    return <AppPageHistoryContext.Provider value={value}>{children}</AppPageHistoryContext.Provider>;
};
