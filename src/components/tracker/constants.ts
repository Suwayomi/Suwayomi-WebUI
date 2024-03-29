/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { SxProps } from '@mui/material';

export const DIALOG_PADDING: number = 2;

export const CARD_BACKGROUND: SxProps = {
    backgroundColor: 'transparent',
    boxShadow: 'unset',
    backgroundImage: 'unset',
};

export const CARD_STYLING: SxProps = {
    padding: DIALOG_PADDING,
    ...CARD_BACKGROUND,
};
