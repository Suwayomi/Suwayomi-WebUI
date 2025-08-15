/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useContext } from 'react';

import { NavbarContextType } from '@/features/navigation-bar/NavigationBar.types.ts';

export const NavBarContext = React.createContext<NavbarContextType>({
    title: 'Suwayomi',
    setTitle: (): void => {},
    appBarHeight: 0,
    setAppBarHeight: (): void => {},
    action: <div />,
    setAction: (): void => {},
    override: { status: false, value: <div /> },
    setOverride: (): void => {},
    isCollapsed: false,
    setIsCollapsed: (): void => {},
    navBarWidth: 0,
    setNavBarWidth: (): void => {},
    readerNavBarWidth: 0,
    setReaderNavBarWidth: (): void => {},
    bottomBarHeight: 0,
    setBottomBarHeight: (): void => {},
});

export const useNavBarContext = () => useContext(NavBarContext);
