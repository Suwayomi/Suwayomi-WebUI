/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useElementSize } from '@mantine/hooks';
import type { ComponentProps, ReactNode, Ref } from 'react';
import { createContext, useContext, useMemo } from 'react';
import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';

const OffestContext = createContext<{
    leftOffset: number;
    topOffset: number;
}>({
    leftOffset: 0,
    topOffset: 0,
});

const OffsetContextProvider = ({
    topOffset = 0,
    leftOffset = 0,
    children,
}: {
    topOffset?: number;
    leftOffset?: number;
    children?: ReactNode;
}) => {
    const value = useMemo(() => ({ leftOffset, topOffset }), [topOffset, leftOffset]);

    return <OffestContext.Provider value={value}>{children}</OffestContext.Provider>;
};

export const useOffsetComponent = () => useContext(OffestContext);

export const OffsetContainer = ({
    topOffset = 0,
    leftOffset = 0,
    children,
}: {
    topOffset?: number;
    leftOffset?: number;
    children?: ReactNode;
}) => {
    const parentOffset = useOffsetComponent();

    return (
        <OffsetContextProvider
            topOffset={topOffset + parentOffset.topOffset}
            leftOffset={leftOffset + parentOffset.leftOffset}
        >
            {children}
        </OffsetContextProvider>
    );
};

export const OffsetComponent = ({
    ref,
    children,
    sx,
}: {
    ref?: Ref<HTMLElement>;
    sx?: BoxProps['sx'];
    children?: ReactNode;
}) => {
    const { topOffset, leftOffset } = useOffsetComponent();

    return (
        <Box
            ref={ref}
            sx={{
                position: 'sticky',
                zIndex: 1,
                ...sx,
                top: topOffset,
                left: leftOffset,
            }}
        >
            {children}
        </Box>
    );
};

export const OffsetComponentWithContainer = ({
    component,
    children,
    ...props
}: ComponentProps<typeof OffsetComponent> & {
    component: ReactNode;
}) => {
    const { ref, width, height } = useElementSize();

    return (
        <>
            <OffsetComponent ref={ref} {...props}>
                {component}
            </OffsetComponent>
            <OffsetContainer topOffset={height} leftOffset={width}>
                {children}
            </OffsetContainer>
        </>
    );
};
