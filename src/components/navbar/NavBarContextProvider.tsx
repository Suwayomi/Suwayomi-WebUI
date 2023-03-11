/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useCallback, useMemo, useState } from 'react';
import NavBarContext from 'components/context/NavbarContext';
import { INavbarOverride } from 'typings';

interface IProps {
    children: React.ReactNode;
}

export default function NavBarProvider({ children }: IProps) {
    const [defaultBackTo, setDefaultBackTo] = useState<string | undefined>();
    const [title, setTitle] = useState<string>('Tachidesk');
    const [action, setAction] = useState<any>(<div />);
    const [override, setOverride] = useState<INavbarOverride>({
        status: false,
        value: <div />,
    });

    const updateTitle = useCallback(
        (newTitle: string) => {
            console.log('title:', newTitle);
            document.title = `${newTitle} - Tachidesk`;
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
