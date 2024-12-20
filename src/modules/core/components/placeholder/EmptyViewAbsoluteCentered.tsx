/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { EmptyView, EmptyViewProps } from '@/modules/core/components/placeholder/EmptyView.tsx';

export function EmptyViewAbsoluteCentered({ sx, ...emptyViewProps }: EmptyViewProps) {
    return (
        <EmptyView
            {...emptyViewProps}
            sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                ...sx,
            }}
        />
    );
}
