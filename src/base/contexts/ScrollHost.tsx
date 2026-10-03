/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, useContext } from 'react';

let mainScrollHost: HTMLElement | null = null;

export const setMainScrollHost = (el: HTMLElement | null) => {
    mainScrollHost = el;
};

export const getMainScrollHost = (): HTMLElement | undefined => mainScrollHost ?? undefined;

export const scrollMainToTop = () => {
    mainScrollHost?.scrollTo({ top: 0 });
};

const ScrollHostContext = createContext<HTMLElement | null>(null);

export const ScrollHostProvider = ScrollHostContext.Provider;

export const useScrollHost = (): HTMLElement | null => {
    const nestedScrollHost = useContext(ScrollHostContext);

    return nestedScrollHost ?? mainScrollHost;
};
