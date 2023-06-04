/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import requestManager from '@/lib/RequestManager';

const useSubscription = <T>(path: string, callback?: (newValue: T) => boolean | void) => {
    const [state, setState] = useState<T | undefined>();

    useEffect(() => {
        const wsc = new WebSocket(requestManager.getValidWebSocketUrl(path));

        wsc.onmessage = (e) => {
            const data = JSON.parse(e.data) as T;
            if (callback) {
                // If callback is specified, only update state if callback returns true
                // This is so that useSubscription can be used without causing rerender
                if (callback(data) === true) {
                    setState(data);
                }
            } else {
                setState(data);
            }
        };

        return () => wsc.close();
    }, [path]);

    return { data: state };
};

export default useSubscription;
