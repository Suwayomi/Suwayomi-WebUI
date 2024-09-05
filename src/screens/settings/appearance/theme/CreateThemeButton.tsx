/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { bindDialog, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { ThemeCreationDialog } from '@/screens/settings/appearance/theme/CreateThemeDialog.tsx';

export const CreateThemeButton = () => {
    const { t } = useTranslation();

    const popupState = usePopupState({ variant: 'popover', popupId: 'theme-creation-dialog' });

    return (
        <>
            <Stack sx={{ alignItems: 'center', gap: 1 }}>
                <Button
                    sx={{ minWidth: '150px', height: '225px', m: 1, mb: 0 }}
                    variant="contained"
                    size="large"
                    {...bindTrigger(popupState)}
                >
                    <AddCircleIcon />
                </Button>
                <Typography>{t('settings.appearance.theme.create.title')}</Typography>
            </Stack>
            {popupState.isOpen && <ThemeCreationDialog bindDialogProps={bindDialog(popupState)} mode="create" />}
        </>
    );
};
