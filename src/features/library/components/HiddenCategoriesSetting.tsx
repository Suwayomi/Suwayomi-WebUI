/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { makeToast } from '@/base/utils/Toast.ts';
import type { GetCategoriesSettingsQuery } from '@/lib/graphql/generated/graphql.ts';
import { requestServerMetadataUpdate } from '@/features/metadata/services/MetadataUpdater.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { hashHiddenCategoryPassword } from '@/features/library/HiddenCategories.utils.ts';

type Category = GetCategoriesSettingsQuery['categories']['nodes'][number];

const updateSettings = async (
    nextIds: number[],
    nextPasswordHash: string,
    autoLockEnabled: boolean,
    autoLockMinutes: number,
) =>
    requestServerMetadataUpdate({
        update: [
            ['hiddenCategoryIds', JSON.stringify(nextIds)],
            ['hiddenCategoryPasswordHash', nextPasswordHash],
            ['hiddenCategoryAutoLockEnabled', autoLockEnabled],
            ['hiddenCategoryAutoLockMinutes', autoLockMinutes],
        ],
    });

export const HiddenCategoriesSetting = ({
    categories,
    hiddenCategoryIds,
    passwordHash,
    autoLockEnabled,
    autoLockMinutes,
}: {
    categories: Category[];
    hiddenCategoryIds: number[];
    passwordHash: string;
    autoLockEnabled: boolean;
    autoLockMinutes: number;
}) => {
    const { t } = useLingui();
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>(hiddenCategoryIds);
    const [passwordError, setPasswordError] = useState('');
    const [isAutoLockEnabled, setIsAutoLockEnabled] = useState(autoLockEnabled);
    const [autoLockMinutesInput, setAutoLockMinutesInput] = useState(String(autoLockMinutes));
    const [autoLockError, setAutoLockError] = useState('');

    const isConfigured = hiddenCategoryIds.length > 0 && !!passwordHash;
    const selectableCategories = categories.filter(({ id }) => id !== 0);

    const openDialog = () => {
        setSelectedIds(hiddenCategoryIds);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmedPassword('');
        setPasswordError('');
        setIsAutoLockEnabled(autoLockEnabled);
        setAutoLockMinutesInput(String(autoLockMinutes));
        setAutoLockError('');
        setIsAuthorized(!isConfigured);
        setIsOpen(true);
    };

    const closeDialog = () => {
        if (!isSaving) {
            setIsOpen(false);
        }
    };

    const verifyPassword = async () => {
        try {
            if ((await hashHiddenCategoryPassword(currentPassword)) !== passwordHash) {
                setPasswordError(t`Incorrect access code`);
                return;
            }

            setPasswordError('');
            setIsAuthorized(true);
            setCurrentPassword('');
        } catch (error) {
            makeToast(t`Could not verify access code`, 'error', getErrorMessage(error));
        }
    };

    const saveSettings = async () => {
        setPasswordError('');
        setAutoLockError('');

        const nextAutoLockMinutes = Number(autoLockMinutesInput);
        if (isAutoLockEnabled && (!Number.isInteger(nextAutoLockMinutes) || nextAutoLockMinutes < 1)) {
            setAutoLockError(t`Enter a whole number of minutes greater than zero`);
            return;
        }

        const validAutoLockMinutes = Number.isInteger(nextAutoLockMinutes)
            ? Math.max(1, nextAutoLockMinutes)
            : autoLockMinutes;

        if (!selectedIds.length) {
            setIsSaving(true);
            try {
                await updateSettings([], '', isAutoLockEnabled, validAutoLockMinutes);
                setIsOpen(false);
                makeToast(t`Hidden categories disabled`, 'success');
            } catch (error) {
                makeToast(t`Could not save hidden categories`, 'error', getErrorMessage(error));
            } finally {
                setIsSaving(false);
            }
            return;
        }

        if (!passwordHash && newPassword.length < 4) {
            setPasswordError(t`Access code must contain at least 4 characters`);
            return;
        }

        if (newPassword && newPassword.length < 4) {
            setPasswordError(t`Access code must contain at least 4 characters`);
            return;
        }

        if (newPassword !== confirmedPassword) {
            setPasswordError(t`Access codes do not match`);
            return;
        }

        setIsSaving(true);
        try {
            const nextPasswordHash = newPassword ? await hashHiddenCategoryPassword(newPassword) : passwordHash;
            await updateSettings(selectedIds, nextPasswordHash, isAutoLockEnabled, validAutoLockMinutes);
            setIsOpen(false);
            makeToast(t`Hidden categories saved`, 'success');
        } catch (error) {
            makeToast(t`Could not save hidden categories`, 'error', getErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <ListItemButton onClick={openDialog}>
                <ListItemText
                    primary={t`Hidden categories`}
                    secondary={
                        isConfigured
                            ? plural(hiddenCategoryIds.length, {
                                  one: '# hidden category',
                                  other: '# hidden categories',
                              })
                            : t`Not configured`
                    }
                />
            </ListItemButton>
            <Dialog open={isOpen} onClose={closeDialog} fullWidth maxWidth="xs">
                <DialogTitle>{isAuthorized ? t`Hidden categories` : t`Unlock hidden category settings`}</DialogTitle>
                {!isAuthorized ? (
                    <>
                        <DialogContent>
                            <TextField
                                autoFocus
                                fullWidth
                                margin="dense"
                                type="password"
                                label={t`Current access code`}
                                value={currentPassword}
                                error={!!passwordError}
                                helperText={passwordError}
                                onChange={(event) => setCurrentPassword(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && currentPassword) {
                                        void verifyPassword();
                                    }
                                }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeDialog}>{t`Cancel`}</Button>
                            <Button
                                onClick={() => void verifyPassword()}
                                disabled={!currentPassword}
                                variant="contained"
                            >
                                {t`Unlock`}
                            </Button>
                        </DialogActions>
                    </>
                ) : (
                    <>
                        <DialogContent dividers>
                            <Stack sx={{ gap: 2 }}>
                                <FormGroup>
                                    {selectableCategories.map((category) => (
                                        <FormControlLabel
                                            key={category.id}
                                            label={category.name}
                                            control={
                                                <Checkbox
                                                    checked={selectedIds.includes(category.id)}
                                                    onChange={(event) =>
                                                        setSelectedIds((current) =>
                                                            event.target.checked
                                                                ? [...current, category.id]
                                                                : current.filter((id) => id !== category.id),
                                                        )
                                                    }
                                                />
                                            }
                                        />
                                    ))}
                                </FormGroup>
                                <FormControlLabel
                                    label={t`Lock automatically`}
                                    control={
                                        <Switch
                                            checked={isAutoLockEnabled}
                                            onChange={(event) => {
                                                setIsAutoLockEnabled(event.target.checked);
                                                setAutoLockError('');
                                            }}
                                        />
                                    }
                                />
                                {isAutoLockEnabled && (
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label={t`Lock after (minutes)`}
                                        value={autoLockMinutesInput}
                                        error={!!autoLockError}
                                        helperText={autoLockError}
                                        slotProps={{ htmlInput: { min: 1, step: 1 } }}
                                        onChange={(event) => {
                                            setAutoLockMinutesInput(event.target.value);
                                            setAutoLockError('');
                                        }}
                                    />
                                )}
                                <TextField
                                    fullWidth
                                    type="password"
                                    label={isConfigured ? t`New access code (optional)` : t`Access code`}
                                    value={newPassword}
                                    error={!!passwordError}
                                    onChange={(event) => {
                                        setNewPassword(event.target.value);
                                        setPasswordError('');
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    type="password"
                                    label={t`Confirm access code`}
                                    value={confirmedPassword}
                                    error={!!passwordError}
                                    helperText={passwordError}
                                    disabled={!newPassword}
                                    onChange={(event) => {
                                        setConfirmedPassword(event.target.value);
                                        setPasswordError('');
                                    }}
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeDialog} disabled={isSaving}>
                                {t`Cancel`}
                            </Button>
                            <Button onClick={() => void saveSettings()} disabled={isSaving} variant="contained">
                                {isSaving ? t`Saving…` : t`Save`}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    );
};
