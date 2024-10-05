/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box, { BoxProps } from '@mui/material/Box';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';

export const TabsWrapper = ({ children, ...props }: BoxProps) => {
    const { appBarHeight } = useNavBarContext();

    return (
        <Box {...props} sx={{ ...props.sx, position: 'relative', height: `calc(100% - ${appBarHeight}px)` }}>
            {children}
        </Box>
    );
};
