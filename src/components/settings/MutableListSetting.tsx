/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    Button,
    Dialog,
    DialogTitle,
    ListItem,
    ListItemButton,
    ListItemText,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useTranslation } from 'react-i18next';
import List from '@mui/material/List';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import DialogContentText from '@mui/material/DialogContentText';
import InfoIcon from '@mui/icons-material/Info';
import { TextSetting, TextSettingProps } from '@/components/settings/text/TextSetting.tsx';
import { TextSettingDialog } from '@/components/settings/text/TextSettingDialog.tsx';
import { makeToast } from '@/components/util/Toast.tsx';

const MutableListItem = ({
    handleDelete,
    mutable = true,
    deletable = true,
    ...textSettingProps
}: Omit<TextSettingProps, 'isPassword' | 'disabled'> & {
    handleDelete: () => void;
    mutable?: boolean;
    deletable?: boolean;
}) => {
    const { t } = useTranslation();

    return (
        <Stack direction="row">
            {mutable ? (
                <TextSetting {...textSettingProps} dialogTitle="" />
            ) : (
                <ListItem>
                    <ListItemText secondary={textSettingProps.value} />
                </ListItem>
            )}
            <Tooltip title={t('chapter.action.download.delete.label.action')}>
                <IconButton disabled={!deletable} size="large" onClick={handleDelete}>
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
        </Stack>
    );
};

type MutableListSettingProps = Pick<TextSettingProps, 'settingName' | 'placeholder'> & {
    valueInfos?: (
        | [value: string]
        | [value: string, Pick<React.ComponentProps<typeof MutableListItem>, 'mutable' | 'deletable'>]
    )[];
    description?: string;
    dialogDisclaimer?: JSX.Element | string;
    addItemButtonTitle?: string;
    handleChange: (values: string[]) => void;
    allowDuplicates?: boolean;
    validateItem?: (value: string) => boolean;
    invalidItemError?: string;
};

const getValues = (valueInfos: MutableListSettingProps['valueInfos']): string[] =>
    valueInfos?.map((valueInfo) => valueInfo[0]) ?? [];

export const MutableListSetting = ({
    settingName,
    description,
    dialogDisclaimer,
    valueInfos,
    handleChange,
    addItemButtonTitle,
    placeholder,
    allowDuplicates = false,
    validateItem = () => true,
    invalidItemError,
}: MutableListSettingProps) => {
    const { t } = useTranslation();

    const values = getValues(valueInfos);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogValues, setDialogValues] = useState(values);

    const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);

    useEffect(() => {
        if (!valueInfos) {
            return;
        }

        setDialogValues(values);
    }, [valueInfos]);

    const closeDialog = (resetValue: boolean = true) => {
        if (resetValue) {
            setDialogValues(values);
        }

        setIsDialogOpen(false);
    };

    const updateSetting = (index: number, newValue: string | undefined) => {
        const deleteValue = newValue === undefined;
        if (deleteValue) {
            setDialogValues(dialogValues.toSpliced(index, 1));
            return;
        }

        const isDuplicate = !allowDuplicates && dialogValues.includes(newValue);
        if (isDuplicate) {
            return;
        }

        if (newValue === '') {
            return;
        }

        if (!validateItem(newValue)) {
            makeToast(invalidItemError ?? t('global.error.label.invalid_input'), 'error');
            return;
        }

        setDialogValues(dialogValues.toSpliced(index, 1, newValue.trim()));
    };

    const saveChanges = () => {
        closeDialog(true);
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
                {(!!description || !!dialogDisclaimer) && (
                    <DialogContent>
                        <DialogContentText sx={{ paddingBottom: '10px' }} component="div">
                            {description && (
                                <Typography
                                    variant="body1"
                                    sx={{
                                        whiteSpace: 'pre-line',
                                    }}
                                >
                                    {description}
                                </Typography>
                            )}
                            {dialogDisclaimer && (
                                <Stack direction="row" alignItems="center">
                                    <InfoIcon color="warning" />
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            marginLeft: '10px',
                                            marginTop: '5px',
                                            whiteSpace: 'pre-line',
                                        }}
                                    >
                                        {dialogDisclaimer}
                                    </Typography>
                                </Stack>
                            )}
                        </DialogContentText>
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
                                mutable={valueInfos?.find(([value]) => value === dialogValue)?.[1]?.mutable}
                                deletable={valueInfos?.find(([value]) => value === dialogValue)?.[1]?.deletable}
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
