/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useContext } from 'react';
import { INavbarOverride } from '@/typings';

type ContextType = {
    history: string[];

    // AppBar title
    title: string | React.ReactNode;
    setTitle: (title: ContextType['title'], browserTitle?: string) => void;

    // AppBar action buttons
    action: any;
    setAction: React.Dispatch<React.SetStateAction<any>>;

    // Allow default navbar to be overrided
    override: INavbarOverride;
    setOverride: React.Dispatch<React.SetStateAction<INavbarOverride>>;
};

export const NavBarContext = React.createContext<ContextType>({
    history: [],
    title: 'Suwayomi',
    setTitle: (): void => {},
    action: <div />,
    setAction: (): void => {},
    override: { status: false, value: <div /> },
    setOverride: (): void => {},
});

export const useNavBarContext = () => useContext(NavBarContext);
