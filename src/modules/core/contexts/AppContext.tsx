/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StyledEngineProvider } from '@mui/material/styles';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { SnackbarProvider } from 'notistack';
import { NavBarContextProvider } from '@/modules/navigation-bar/contexts/NavBarContextProvider.tsx';
import { ActiveDeviceContextProvider } from '@/modules/device/contexts/DeviceContext.tsx';
import { ReaderContextProvider } from '@/modules/reader/contexts/ReaderContextProvider.tsx';
import { AppHotkeysProvider } from '@/modules/hotkeys/contexts/AppHotkeysProvider.tsx';
import { SnackbarWithDescription } from '@/modules/core/components/feedback/SnackbarWithDescription.tsx';
import { AppPageHistoryContextProvider } from '@/modules/core/contexts/AppPageHistoryContextProvider.tsx';
import { AppThemeContextProvider } from '@/modules/theme/contexts/AppThemeContextProvider.tsx';

interface Props {
    children: React.ReactNode;
}

export const AppContext: React.FC<Props> = ({ children }) => (
    <Router>
        <StyledEngineProvider injectFirst>
            <AppThemeContextProvider>
                <QueryParamProvider adapter={ReactRouter6Adapter}>
                    <NavBarContextProvider>
                        <AppPageHistoryContextProvider>
                            <ActiveDeviceContextProvider>
                                <SnackbarProvider
                                    Components={{
                                        default: SnackbarWithDescription,
                                        info: SnackbarWithDescription,
                                        success: SnackbarWithDescription,
                                        warning: SnackbarWithDescription,
                                        error: SnackbarWithDescription,
                                    }}
                                >
                                    <ReaderContextProvider>
                                        <AppHotkeysProvider>{children}</AppHotkeysProvider>
                                    </ReaderContextProvider>
                                </SnackbarProvider>
                            </ActiveDeviceContextProvider>
                        </AppPageHistoryContextProvider>
                    </NavBarContextProvider>
                </QueryParamProvider>
            </AppThemeContextProvider>
        </StyledEngineProvider>
    </Router>
);
