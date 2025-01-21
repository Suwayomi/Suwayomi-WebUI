/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { NavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { useLocalStorage } from '@/modules/core/hooks/useStorage.tsx';
import { INavbarOverride } from '@/modules/navigation-bar/NavigationBar.types.ts';

interface IProps {
    children: React.ReactNode;
}

export function NavBarContextProvider({ children }: IProps) {
    const [title, setTitle] = useState<string | React.ReactNode>('Suwayomi');
    const [action, setAction] = useState<any>(<div />);
    const [appBarHeight, setAppBarHeight] = useState(0);
    const [override, setOverride] = useState<INavbarOverride>({
        status: false,
        value: <div />,
    });
    const [isCollapsed, setIsCollapsed] = useLocalStorage('NavBar::isCollapsed', false);
    const [navBarWidth, setNavBarWidth] = useState(0);
    const [readerNavBarWidth, setReaderNavBarWidth] = useState(0);
    const [bottomBarHeight, setBottomBarHeight] = useState(0);

    const updateTitle = useCallback(
        (newTitle: string | React.ReactNode, browserTitle: string = typeof newTitle === 'string' ? newTitle : '') => {
            document.title = `${browserTitle} - Suwayomi`;
            setTitle(newTitle);
        },
        [setTitle],
    );

    const value = useMemo(
        () => ({
            title,
            setTitle: updateTitle,
            appBarHeight,
            setAppBarHeight,
            action,
            setAction,
            override,
            setOverride,
            isCollapsed,
            setIsCollapsed,
            navBarWidth,
            setNavBarWidth,
            readerNavBarWidth,
            setReaderNavBarWidth,
            bottomBarHeight,
            setBottomBarHeight,
        }),
        [
            title,
            updateTitle,
            appBarHeight,
            setAppBarHeight,
            action,
            setAction,
            override,
            setOverride,
            isCollapsed,
            setIsCollapsed,
            navBarWidth,
            setNavBarWidth,
            readerNavBarWidth,
            setReaderNavBarWidth,
            bottomBarHeight,
            setBottomBarHeight,
        ],
    );
    return <NavBarContext.Provider value={value}>{children}</NavBarContext.Provider>;
}
