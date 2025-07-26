/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import { SuwayomiLogo } from '@/assets/SuwayomiLogo.tsx';
import { ServerAddressSetting } from '@/features/settings/components/ServerAddressSetting.tsx';

export const SplashScreen = () => {
    const theme = useTheme();

    return (
        <Stack
            sx={{
                minWidth: '100vw',
                minHeight: '100vh',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'primary.light',
                ...theme.applyStyles('dark', {
                    backgroundColor: 'primary.dark',
                }),
            }}
        >
            <SuwayomiLogo
                sx={{
                    fontSize: 250,
                    [theme.breakpoints.up('lg')]: {
                        fontSize: 350,
                    },
                }}
                circleRingColor={theme.palette.primary.light}
            />
            {import.meta.env.DEV && (
                <Stack sx={{ height: 'auto', mt: 5 }}>
                    <ServerAddressSetting />
                </Stack>
            )}
        </Stack>
    );
};
