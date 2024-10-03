/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';
import { ReaderNavBarDesktopPageScale } from '@/modules/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopPageScale.tsx';
import { ReaderNavBarDesktopReadingMode } from '@/modules/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopReadingMode.tsx';
import { ReaderNavBarDesktopOffsetDoubleSpread } from '@/modules/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopOffsetDoubleSpread.tsx';
import { ReaderNavBarDesktopReadingDirection } from '@/modules/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopReadingDirection.tsx';

export const ReaderNavBarDesktopQuickSettings = () => {
    const { t } = useTranslation();

    return (
        <Stack sx={{ gap: 1 }}>
            <ReaderNavBarDesktopReadingMode />
            <ReaderNavBarDesktopOffsetDoubleSpread />
            <ReaderNavBarDesktopPageScale />
            <ReaderNavBarDesktopReadingDirection />
            <Button
                size="large"
                sx={{ justifyContent: 'start', textTransform: 'none' }}
                variant="contained"
                startIcon={<SettingsIcon />}
            >
                {t('reader.settings.title.reader_settings')}
            </Button>
        </Stack>
    );
};
