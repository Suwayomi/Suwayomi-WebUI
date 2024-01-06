/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Button, Dialog, DialogTitle, ListItemButton, ListItemText, Stack, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useTranslation } from 'react-i18next';
import List from '@mui/material/List';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import DialogContentText from '@mui/material/DialogContentText';
import { TextSetting, TextSettingProps } from '@/components/settings/TextSetting.tsx';

const MutableListItem = ({
    handleDelete,
    ...textSettingProps
}: Omit<TextSettingProps, 'isPassword' | 'disabled'> & { handleDelete: () => void }) => {
    const { t } = useTranslation();

    return (
        <Stack direction="row">
            <TextSetting {...textSettingProps} dialogTitle="" />
            <Tooltip title={t('chapter.action.download.delete.label.action')}>
                <IconButton size="large" onClick={handleDelete}>
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
        </Stack>
    );
};

export const MutableListSetting = ({
    settingName,
    description,
    values,
    handleChange,
    addItemButtonTitle,
}: {
    settingName: string;
    description?: string;
    values?: string[];
    handleChange: (values: string[]) => void;
    addItemButtonTitle?: string;
}) => {
    const { t } = useTranslation();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogValues, setDialogValues] = useState(values ?? []);

    useEffect(() => {
        if (!values) {
            return;
        }

        setDialogValues(values);
    }, [values]);

    const closeDialog = (resetValue: boolean = true) => {
        if (resetValue) {
            setDialogValues(values ?? []);
        }

        setIsDialogOpen(false);
    };

    const updateSetting = (index: number, newValue: string | undefined) => {
        const deleteValue = newValue === undefined;
        if (deleteValue) {
            setDialogValues(dialogValues.toSpliced(index, 1));
            return;
        }

        setDialogValues(dialogValues.toSpliced(index, 1, newValue.trim()));
    };

    const saveChanges = () => {
        closeDialog();
        handleChange(dialogValues.filter((dialogValue) => dialogValue !== ''));
    };

    return (
        <>
            <ListItemButton onClick={() => setIsDialogOpen(true)}>
                <ListItemText
                    primary={settingName}
                    secondary={values?.length ? values?.join(', ') : description}
                    secondaryTypographyProps={{ style: { display: 'flex', flexDirection: 'column' } }}
                />
            </ListItemButton>

            <Dialog open={isDialogOpen} onClose={() => closeDialog()} fullWidth>
                <DialogTitle>{settingName}</DialogTitle>
                {!!description && (
                    <DialogContent>
                        <DialogContentText sx={{ paddingBottom: '10px' }}>{description}</DialogContentText>
                    </DialogContent>
                )}
                <DialogContent dividers sx={{ maxHeight: '300px' }}>
                    <List>
                        {dialogValues.map((dialogValue, index) => (
                            <MutableListItem
                                settingName={dialogValue === '' ? t('global.label.placeholder') : ''}
                                placeholder="https://github.com/MY_ACCOUNT/MY_REPO/tree/repo"
                                handleChange={(newValue: string) => updateSetting(index, newValue)}
                                handleDelete={() => updateSetting(index, undefined)}
                                value={dialogValue}
                            />
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Stack sx={{ width: '100%' }} direction="row" justifyContent="space-between">
                        <Button onClick={() => updateSetting(dialogValues.length, '')}>
                            {addItemButtonTitle ?? t('global.button.add')}
                        </Button>
                        <Stack direction="row">
                            <Button onClick={() => closeDialog()}>{t('global.button.cancel')}</Button>
                            <Button onClick={() => saveChanges()}>{t('global.button.ok')}</Button>
                        </Stack>
                    </Stack>
                </DialogActions>
            </Dialog>
        </>
    );
};
