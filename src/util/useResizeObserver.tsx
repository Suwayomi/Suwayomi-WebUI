/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RefObject, useLayoutEffect } from 'react';

export const useResizeObserver = (ref: RefObject<HTMLElement>, callback: ResizeObserverCallback) => {
    useLayoutEffect(() => {
        if (!ref.current) {
            return () => {};
        }

        const resizeObserver = new ResizeObserver(callback);
        resizeObserver.observe(ref.current);

        return () => resizeObserver.disconnect();
    }, [ref, callback]);
};
