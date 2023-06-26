/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { NavigationType, useLocation, useNavigationType } from 'react-router-dom';

// eslint-disable-next-line import/prefer-default-export
export const useHistory = () => {
    const location = useLocation();
    const navigationType = useNavigationType();

    const [history, setHistory] = useState<string[]>([location.pathname]);

    useEffect(() => {
        const isLastPageInHistory = location.key === 'default';
        const ignoreInitialPop = isLastPageInHistory && history.length === 1;
        if (ignoreInitialPop) {
            return;
        }

        switch (navigationType) {
            case NavigationType.Pop:
                setHistory([...history.slice(0, -1)]);
                break;
            case NavigationType.Push:
                setHistory([...history, location.pathname]);
                break;
            case NavigationType.Replace:
                setHistory([...history.slice(0, -1), location.pathname]);
                break;
            default:
                throw new Error(`Unexpected NavigationType "${navigationType}"`);
        }
    }, [location]);

    return history;
};
