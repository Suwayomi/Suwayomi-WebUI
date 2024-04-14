/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextSettingDialog, TextSettingDialogProps } from '@/components/settings/text/TextSettingDialog.tsx';

export type TextSettingProps = Omit<TextSettingDialogProps, 'isDialogOpen' | 'setIsDialogOpen'> & {
    disabled?: boolean;
};

export const TextSetting = (props: TextSettingProps) => {
    const { t } = useTranslation();

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { settingName, value, isPassword = false, disabled = false } = props;

    return (
        <>
            <ListItemButton disabled={disabled} onClick={() => setIsDialogOpen(true)}>
                <ListItemText
                    primary={settingName}
                    secondary={isPassword ? value?.replace(/./g, '*') : value ?? t('global.label.loading')}
                    secondaryTypographyProps={{
                        sx: { display: 'flex', flexDirection: 'column', wordWrap: 'break-word' },
                    }}
                />
            </ListItemButton>

            <TextSettingDialog {...props} isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
        </>
    );
};
