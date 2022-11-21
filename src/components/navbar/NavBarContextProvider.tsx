/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import NavBarContext from 'components/context/NavbarContext';

interface IProps{
    children: React.ReactNode
}

export default function NavBarProvider({ children }:IProps) {
    const [defaultBackTo, setDefaultBackTo] = useState<string | undefined>();
    const [title, setTitle] = useState<string>('Tachidesk');
    const [action, setAction] = useState<any>(<div />);
    const [override, setOverride] = useState<INavbarOverride>({
        status: false,
        value: <div />,
    });

    const value = {
        defaultBackTo,
        setDefaultBackTo,
        title,
        setTitle,
        action,
        setAction,
        override,
        setOverride,
    };
    return (
        <NavBarContext.Provider value={value}>
            {children}
        </NavBarContext.Provider>
    );
}
