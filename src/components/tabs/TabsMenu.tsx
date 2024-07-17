/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Tabs, { TabsProps } from '@mui/material/Tabs';
import { styled } from '@mui/material/styles';
import { ForwardedRef, forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { useResizeObserver } from '@/util/useResizeObserver.tsx';
import { useNavBarContext } from '@/components/context/NavbarContext.tsx';

const StyledTabsMenu = styled(Tabs)(({ theme }) => ({
    display: 'flex',
    position: 'sticky',
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: theme.palette.background.default,
    border: 0,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
}));

export const TabsMenu = forwardRef(
    (
        { children, tabsCount, ...props }: TabsProps & { tabsCount: number },
        ref: ForwardedRef<HTMLDivElement | null>,
    ) => {
        const { appBarHeight } = useNavBarContext();

        const tabsMenuRef = useRef<HTMLDivElement | null>(null);
        useImperativeHandle(ref, () => tabsMenuRef.current!);
        const [width, setWidth] = useState<number>();
        useResizeObserver(
            tabsMenuRef,
            useCallback(() => setWidth(tabsMenuRef.current?.clientWidth), [tabsMenuRef.current]),
        );

        // Visual Hack: 160px is min-width for viewport width of >600
        const scrollableTabs = !width ? false : width < tabsCount * 160;

        return (
            <StyledTabsMenu
                {...props}
                sx={{ ...props.sx, top: appBarHeight }}
                ref={tabsMenuRef}
                indicatorColor="primary"
                textColor="primary"
                centered={!scrollableTabs}
                variant={scrollableTabs ? 'scrollable' : 'fullWidth'}
                scrollButtons
                allowScrollButtonsMobile
            >
                {children}
            </StyledTabsMenu>
        );
    },
);
