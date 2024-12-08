/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';
import { HotkeyScope } from '@/modules/hotkeys/Hotkeys.types.ts';

export const useDisableAllHotkeysWhileMounted = () => {
    const { enabledScopes, enableScope, disableScope } = useHotkeysContext();
    const [previouslyEnabledScopes] = useState(enabledScopes);

    useEffect(() => {
        enableScope(HotkeyScope.NONE);
        previouslyEnabledScopes.forEach(disableScope);

        return () => {
            disableScope(HotkeyScope.NONE);
            previouslyEnabledScopes.forEach(enableScope);
        };
    }, []);
};
