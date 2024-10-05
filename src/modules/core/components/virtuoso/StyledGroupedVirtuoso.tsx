/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { GroupedVirtuoso } from 'react-virtuoso';
import { ComponentProps } from 'react';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';

export const StyledGroupedVirtuoso = ({
    heightToSubtract = 0,
    style,
    ...props
}: ComponentProps<typeof GroupedVirtuoso> & { heightToSubtract?: number }) => {
    const { appBarHeight, bottomBarHeight } = useNavBarContext();

    return (
        <GroupedVirtuoso
            {...props}
            style={{
                ...style,
                height: `calc(100vh - ${heightToSubtract}px - ${appBarHeight}px - ${bottomBarHeight}px)`,
            }}
        />
    );
};
