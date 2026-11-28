/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { useNavBarContext } from '@/contexts/navigation-bar/NavbarContext.tsx';
import type { NavbarContextType } from '@/models/navigation-bar/NavigationBar.types.ts';
import { STABLE_EMPTY_ARRAY } from '@/models/base/Base.constants.ts';

export const useAppAction = (action: NavbarContextType['action'], dependencies: any[] = STABLE_EMPTY_ARRAY) => {
    const { setAction } = useNavBarContext();

    useEffect(() => {
        setAction(action);
        return () => setAction(null);
    }, dependencies);
};
