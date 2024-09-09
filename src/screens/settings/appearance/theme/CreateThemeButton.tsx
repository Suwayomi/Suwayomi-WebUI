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
import { bindDialog, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import Tooltip from '@mui/material/Tooltip';
import { ThemeCreationDialog } from '@/screens/settings/appearance/theme/CreateThemeDialog.tsx';
import { TypographyMaxLines } from '@/components/atoms/TypographyMaxLines.tsx';

export const CreateThemeButton = () => {
    const { t } = useTranslation();

    const popupState = usePopupState({ variant: 'popover', popupId: 'theme-creation-dialog' });

    return (
        <>
            <Stack sx={{ alignItems: 'center', gap: 1, minWidth: '150px', maxWidth: '150px' }}>
                <Button
                    sx={{
                        width: '100%',
                        height: '225px',
                    }}
                    variant="contained"
                    size="large"
                    {...bindTrigger(popupState)}
                >
                    <AddCircleIcon fontSize="large" />
                </Button>
                <Tooltip title={t('settings.appearance.theme.create.title')} placement="top">
                    <TypographyMaxLines sx={{ maxWidth: '100%' }}>
                        {t('settings.appearance.theme.create.title')}
                    </TypographyMaxLines>
                </Tooltip>
            </Stack>
            {popupState.isOpen && <ThemeCreationDialog bindDialogProps={bindDialog(popupState)} mode="create" />}
        </>
    );
};
