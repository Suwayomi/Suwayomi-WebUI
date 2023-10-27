/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { INavbarOverride } from '@/typings';
import { NavBarContext } from '@/components/context/NavbarContext';

interface IProps {
    children: React.ReactNode;
}

export function NavBarContextProvider({ children }: IProps) {
    const [defaultBackTo, setDefaultBackTo] = useState<string | undefined>();
    const [title, setTitle] = useState<string | React.ReactNode>('Tachidesk');
    const [action, setAction] = useState<any>(<div />);
    const [override, setOverride] = useState<INavbarOverride>({
        status: false,
        value: <div />,
    });

    const updateTitle = useCallback(
        (newTitle: string | React.ReactNode, browserTitle: string = typeof newTitle === 'string' ? newTitle : '') => {
            document.title = `${browserTitle} - Tachidesk`;
            setTitle(newTitle);
        },
        [setTitle],
    );

    const value = useMemo(
        () => ({
            defaultBackTo,
            setDefaultBackTo,
            title,
            setTitle: updateTitle,
            action,
            setAction,
            override,
            setOverride,
        }),
        [defaultBackTo, setDefaultBackTo, title, updateTitle, action, setAction, override, setOverride],
    );
    return <NavBarContext.Provider value={value}>{children}</NavBarContext.Provider>;
}
