/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import useMediaQuery from '@mui/material/useMediaQuery';
import { getCurrentTheme } from '@/theme.ts';

export class MediaQuery {
    static useIsTouchDevice(): boolean {
        return useMediaQuery('not (pointer: fine)');
    }

    static useIsMobileWidth(): boolean {
        return useMediaQuery(getCurrentTheme().breakpoints.down('sm'));
    }
}
