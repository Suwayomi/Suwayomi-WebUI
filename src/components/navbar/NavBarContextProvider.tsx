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
import { useHistory } from '@/util/useHistory.ts';

interface IProps {
    children: React.ReactNode;
}

export function NavBarContextProvider({ children }: IProps) {
    const [title, setTitle] = useState<string | React.ReactNode>('Suwayomi');
    const [action, setAction] = useState<any>(<div />);
    const [override, setOverride] = useState<INavbarOverride>({
        status: false,
        value: <div />,
    });

    const history = useHistory();

    const updateTitle = useCallback(
        (newTitle: string | React.ReactNode, browserTitle: string = typeof newTitle === 'string' ? newTitle : '') => {
            document.title = `${browserTitle} - Suwayomi`;
            setTitle(newTitle);
        },
        [setTitle],
    );

    const value = useMemo(
        () => ({
            history,
            title,
            setTitle: updateTitle,
            action,
            setAction,
            override,
            setOverride,
        }),
        [history, title, updateTitle, action, setAction, override, setOverride],
    );
    return <NavBarContext.Provider value={value}>{children}</NavBarContext.Provider>;
}
