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
import { TextSetting, TextSettingProps } from '@/components/settings/text/TextSetting.tsx';
import { TextSettingDialog } from '@/components/settings/text/TextSettingDialog.tsx';

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

type MutableListSettingProps = Pick<TextSettingProps, 'settingName' | 'placeholder'> & {
    values?: string[];
    description?: string[];
    addItemButtonTitle?: string;
    handleChange: (values: string[]) => void;
};

export const MutableListSetting = ({
    settingName,
    description,
    values,
    handleChange,
    addItemButtonTitle,
    placeholder,
}: MutableListSettingProps) => {
    const { t } = useTranslation();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogValues, setDialogValues] = useState(values ?? []);

    const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);

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
                                settingName=""
                                placeholder={placeholder}
                                handleChange={(newValue: string) => updateSetting(index, newValue)}
                                handleDelete={() => updateSetting(index, undefined)}
                                value={dialogValue}
                            />
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Stack sx={{ width: '100%' }} direction="row" justifyContent="space-between">
                        <Button onClick={() => setIsAddItemDialogOpen(true)}>
                            {addItemButtonTitle ?? t('global.button.add')}
                        </Button>
                        <Stack direction="row">
                            <Button onClick={() => closeDialog()}>{t('global.button.cancel')}</Button>
                            <Button onClick={() => saveChanges()}>{t('global.button.ok')}</Button>
                        </Stack>
                    </Stack>
                </DialogActions>
            </Dialog>

            {isAddItemDialogOpen && (
                <TextSettingDialog
                    settingName=""
                    placeholder={placeholder}
                    handleChange={(newValue: string) => updateSetting(dialogValues.length, newValue)}
                    isDialogOpen={isAddItemDialogOpen}
                    setIsDialogOpen={setIsAddItemDialogOpen}
                />
            )}
        </>
    );
};
