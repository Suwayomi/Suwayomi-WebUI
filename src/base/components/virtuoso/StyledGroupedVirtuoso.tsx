/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ContextProp, TopItemListProps } from 'react-virtuoso';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { GroupedVirtuosoPersisted } from '@/lib/virtuoso/Component/GroupedVirtuosoPersisted.tsx';
import { OffsetComponent } from '@/base/OffsetComponent.tsx';

const StickyVirtuosoHeaderWithOffset =
    () =>
    ({ children, style, ...args }: TopItemListProps & ContextProp<unknown>) => (
        <OffsetComponent {...args} sx={style}>
            {children}
        </OffsetComponent>
    );

export const StyledGroupedVirtuoso = <ItemData = any, Context = any>({
    heightToSubtract = 0,
    style,
    ...props
}: ComponentProps<typeof GroupedVirtuosoPersisted<ItemData, Context>> & { heightToSubtract?: number }) => {
    const { appBarHeight, bottomBarHeight } = useNavBarContext();

    const TopItemList = useMemo(() => StickyVirtuosoHeaderWithOffset(), []);

    return (
        <GroupedVirtuosoPersisted
            useWindowScroll
            {...props}
            components={{
                TopItemList,
                ...props.components,
            }}
            style={{
                ...style,
                height: `calc(100vh - ${heightToSubtract}px - ${appBarHeight}px - ${bottomBarHeight}px - ${!bottomBarHeight ? 'env(safe-area-inset-bottom)' : '0px'})`,
            }}
        />
    );
};
