/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { AwaitableComponent } from 'awaitable-component';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { ThemeCreationDialog } from '@/features/theme/components/CreateThemeDialog.tsx';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';

export const CreateThemeButton = () => {
    const { t } = useTranslation();

    return (
        <Stack sx={{ alignItems: 'center', gap: 1, minWidth: '150px', maxWidth: '150px' }}>
            <Button
                sx={{
                    width: '100%',
                    height: '225px',
                }}
                variant="contained"
                size="large"
                onClick={() => {
                    AwaitableComponent.show(ThemeCreationDialog, { mode: 'create' });
                }}
            >
                <AddCircleIcon fontSize="large" />
            </Button>
            <CustomTooltip title={t('settings.appearance.theme.create.title')} placement="top">
                <TypographyMaxLines sx={{ maxWidth: '100%' }}>
                    {t('settings.appearance.theme.create.title')}
                </TypographyMaxLines>
            </CustomTooltip>
        </Stack>
    );
};
