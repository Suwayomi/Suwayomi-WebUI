/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { EmptyViewProps } from '@/base/components/feedback/EmptyView.tsx';
import { EmptyView } from '@/base/components/feedback/EmptyView.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';

export function EmptyViewAbsoluteCentered({ sx, ...emptyViewProps }: EmptyViewProps) {
    return (
        <EmptyView
            {...emptyViewProps}
            sx={MUIUtil.mergeSx(
                {
                    position: 'absolute',
                    minHeight: 'fill-available',
                },
                sx,
            )}
        />
    );
}
