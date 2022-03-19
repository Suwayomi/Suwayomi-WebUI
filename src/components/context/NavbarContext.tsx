/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';

/**
 * The ContextType is a type that contains all the data that the Navbar component needs to render.
 * @property {string} title - The title of the app bar.
 * @property setTitle - React.Dispatch<React.SetStateAction<string>>
 * @property {any} action - This is the action button that appears on the right side of the AppBar.
 * @property setAction - This is a React.Dispatch<React.SetStateAction<any>> function that allows you
 * to set the action buttons.
 * @property {INavbarOverride} override - INavbarOverride
 * @property setOverride - React.Dispatch<React.SetStateAction<INavbarOverride>>
 */
type ContextType = {
    // AppBar title
    title: string
    setTitle: React.Dispatch<React.SetStateAction<string>>

    // AppBar action buttons
    action: any
    setAction: React.Dispatch<React.SetStateAction<any>>

    // Allow default navbar to be overrided
    override: INavbarOverride
    setOverride: React.Dispatch<React.SetStateAction<INavbarOverride>>
};

const NavBarContext = React.createContext<ContextType>({
    title: 'Tachidesk',
    setTitle: ():void => {},
    action: <div />,
    setAction: ():void => {},
    override: { status: false, value: <div /> },
    setOverride: ():void => {},
});

export default NavBarContext;
