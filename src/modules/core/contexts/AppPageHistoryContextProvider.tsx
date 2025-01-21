/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { AppPageHistoryContext } from '@/modules/core/contexts/AppPageHistoryContext.tsx';
import { useHistory } from '@/modules/core/hooks/useHistory.ts';

export const AppPageHistoryContextProvider = ({ children }: { children: React.ReactNode }) => {
    const history = useHistory();

    return <AppPageHistoryContext.Provider value={history}>{children}</AppPageHistoryContext.Provider>;
};
