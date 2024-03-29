/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Select as MuiSelect, SelectVariants } from '@mui/material';

export const Select = <Value, Variant extends SelectVariants>({
    children,
    maxSelectionHeightPx = 250,
    ...props
}: React.ComponentProps<typeof MuiSelect<Value, Variant>> & { maxSelectionHeightPx?: number }) => (
    <MuiSelect<any, any> MenuProps={{ PaperProps: { style: { maxHeight: maxSelectionHeightPx } } }} {...props}>
        {children}
    </MuiSelect>
);
