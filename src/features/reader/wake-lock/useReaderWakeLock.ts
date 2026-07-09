/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useRef } from 'react';

export function useReaderWakeLock(isLoading: boolean, shouldKeepScreenReading: boolean) {
    const wakeLockSentinelRef = useRef<any | null>(null);

    useEffect(() => {
        const requestWakeLock = async () => {
            if (!('wakeLock' in navigator)) {
                return;
            }
            try {
                if (wakeLockSentinelRef.current) {
                    return;
                }

                wakeLockSentinelRef.current = await navigator.wakeLock.request('screen');

                wakeLockSentinelRef.current.addEventListener('release', () => {
                    wakeLockSentinelRef.current = null;
                });
            } catch (err) {
                // oxlint-disable-next-line no-console
                console.error('Error al activar Wake Lock en el lector:', err);
            }
        };

        const releaseWakeLock = async () => {
            if (wakeLockSentinelRef.current) {
                await wakeLockSentinelRef.current.release();
                wakeLockSentinelRef.current = null;
            }
        };

        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && !isLoading && shouldKeepScreenReading) {
                await requestWakeLock();
            }
        };

        if (!isLoading && shouldKeepScreenReading) {
            requestWakeLock();
            document.addEventListener('visibilitychange', handleVisibilityChange);
        } else {
            releaseWakeLock();
        }

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            releaseWakeLock();
        };
    }, [isLoading, shouldKeepScreenReading]);
}
