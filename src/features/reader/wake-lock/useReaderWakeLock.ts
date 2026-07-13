/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useRef } from 'react';

export function useReaderWakeLock(shouldLock: boolean) {
    const wakeLockSentinelRef = useRef<WakeLockSentinel | null>(null);
    if (!('wakeLock' in navigator)) {return;}
    useEffect(() => {
        const requestWakeLock = async () => {
            try {
                if (wakeLockSentinelRef.current) {return;}
                wakeLockSentinelRef.current = await navigator.wakeLock.request('screen');
                wakeLockSentinelRef.current.addEventListener('release', () => {
                    wakeLockSentinelRef.current = null;
                });
            } catch {
                wakeLockSentinelRef.current = null;
            }
        };

        const releaseWakeLock = async () => {
            if (wakeLockSentinelRef.current) {
                await wakeLockSentinelRef.current.release();
                wakeLockSentinelRef.current = null;
            }
        };

        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && shouldLock) {
                await requestWakeLock();
            }
        };

        if (shouldLock) {
            requestWakeLock();
            document.addEventListener('visibilitychange', handleVisibilityChange);
        } else {
            releaseWakeLock();
        }

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            releaseWakeLock();
        };
    }, [shouldLock]);
}
