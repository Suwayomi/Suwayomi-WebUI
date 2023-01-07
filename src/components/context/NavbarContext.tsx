/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext, useEffect } from 'react';

type ContextType = {
    // Default back button url
    defaultBackTo: string | undefined
    setDefaultBackTo: React.Dispatch<React.SetStateAction<string | undefined>>

    // AppBar title
    title: string
    setTitle: (title: string) => void

    // AppBar action buttons
    action: any
    setAction: React.Dispatch<React.SetStateAction<any>>

    // Allow default navbar to be overrided
    override: INavbarOverride
    setOverride: React.Dispatch<React.SetStateAction<INavbarOverride>>
};

const NavBarContext = React.createContext<ContextType>({
    defaultBackTo: undefined,
    setDefaultBackTo: ():void => {},
    title: 'Tachidesk',
    setTitle: ():void => {},
    action: <div />,
    setAction: ():void => {},
    override: { status: false, value: <div /> },
    setOverride: ():void => {},
});

export default NavBarContext;

export const useNavBarContext = () => useContext(NavBarContext);

export const useSetDefaultBackTo = (value: string) => {
    const { setDefaultBackTo } = useNavBarContext();

    useEffect(() => {
        setDefaultBackTo(value);
        return () => setDefaultBackTo(undefined);
    }, [value]);
};
