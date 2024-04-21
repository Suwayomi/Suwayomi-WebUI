/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { useLocalStorage } from '@/util/useStorage.tsx';

const UPDATE_CHECK_INTERVAL = 1000 * 60 * 60 * 24; // 1 day

export const useUpdateChecker = (
    storageKey: string,
    checkForUpdate: () => Promise<unknown>,
    interval: number = UPDATE_CHECK_INTERVAL,
): void => {
    const [lastUpdateCheck, setLastUpdateCheck] = useLocalStorage(`UpdateChecker::${storageKey}`, 0);

    useEffect(() => {
        const remainingTimeTillNextUpdateCheck = (interval - (Date.now() - lastUpdateCheck)) % interval;

        let timeout: NodeJS.Timeout | undefined;
        const scheduleUpdateCheck = (timeoutMS: number) => {
            timeout = setTimeout(() => {
                checkForUpdate().catch(defaultPromiseErrorHandler(`UpdateChecker(${storageKey})::checkForUpdate`));
                setLastUpdateCheck(Date.now());
                scheduleUpdateCheck(interval);
            }, timeoutMS);
        };

        scheduleUpdateCheck(remainingTimeTillNextUpdateCheck);

        return () => clearTimeout(timeout);
    }, [storageKey, checkForUpdate, interval]);
};
