/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Card from '@mui/material/Card';
import { styled } from '@mui/material/styles';

export const MigrationEntryCard = styled(Card)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: theme.palette.divider,
}));
