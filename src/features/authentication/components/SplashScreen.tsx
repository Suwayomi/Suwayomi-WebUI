/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTheme } from '@mui/material/styles';
import type { StackProps } from '@mui/material/Stack';
import Stack from '@mui/material/Stack';
import type { ComponentProps } from 'react';
import { SuwayomiLogo } from '@/assets/SuwayomiLogo.tsx';
import { ServerAddressSetting } from '@/features/settings/components/ServerAddressSetting.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';

export const SplashScreen = ({
    slots,
}: {
    slots?: {
        stackProps?: StackProps;
        logoProps?: ComponentProps<typeof SuwayomiLogo>;
        serverAddressProps?: StackProps;
    };
}) => {
    const theme = useTheme();

    return (
        <Stack
            {...slots?.stackProps}
            sx={MUIUtil.mergeSx(
                {
                    position: 'relative',
                    minWidth: '100vw',
                    minHeight: '100vh',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'background.paper',
                },
                slots?.stackProps?.sx,
            )}
        >
            <SuwayomiLogo
                circleRingColor={theme.palette.primary.light}
                circleFillColor={theme.palette.primary.dark}
                {...slots?.logoProps}
                sx={MUIUtil.mergeSx(
                    {
                        fontSize: 250,
                        [theme.breakpoints.up('lg')]: {
                            fontSize: 350,
                        },
                    },
                    slots?.logoProps?.sx,
                )}
            />
            <Stack
                {...slots?.serverAddressProps}
                sx={MUIUtil.mergeSx(
                    {
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                    },
                    slots?.serverAddressProps?.sx,
                )}
            >
                <ServerAddressSetting />
            </Stack>
        </Stack>
    );
};
