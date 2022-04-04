/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import LibraryOptionsContext, { DefaultLibraryOptions } from 'components/context/LibraryOptionsContext';
import useLocalStorage from 'util/useLocalStorage';

interface IProps {
    children: React.ReactNode;
}

export default function LibraryOptionsContextProvider({ children }: IProps) {
    const [options, setOptions] = useLocalStorage<LibraryOptions>('libraryOptions', DefaultLibraryOptions);

    function setOption<Name extends keyof LibraryOptions>(
        option: Name,
        value: React.SetStateAction<LibraryOptions[Name]>,
    ) {
        setOptions((opts) => ({
            ...opts,
            [option]: typeof value === 'function' ? value(opts[option]) : value,
        }));
    }

    // TODO remove these fields when we have a better way to handle them
    // eslint-disable-next-line eqeqeq
    const active = !(options.unread == undefined) || !(options.downloaded == undefined);
    // eslint-disable-next-line eqeqeq
    const activeSort = (options.sortDesc != undefined) || (options.sorts != undefined);

    return (
        <LibraryOptionsContext.Provider
            value={{
                options,
                setOption,
                setOptions,
                active,
                activeSort,
            }}
        >
            {children}
        </LibraryOptionsContext.Provider>
    );
}
