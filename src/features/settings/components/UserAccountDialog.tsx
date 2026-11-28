/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { PasswordTextField } from '@/base/components/inputs/PasswordTextField.tsx';
import { AuthManager } from '@/features/authentication/AuthManager.ts';
import { USER_PERMISSION_TO_TRANSLATION } from '@/features/settings/Settings.constants.ts';
import type { ManagedUser } from '@/features/settings/Settings.types.ts';
import { UserPermission, UserRole } from '@/lib/graphql/generated/graphql-base.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';

export const UserAccountDialog = ({
    user,
    onClose,
    onSaved,
}: {
    user?: ManagedUser;
    onClose: () => void;
    onSaved: () => void;
}) => {
    const { t } = useLingui();
    const isAdmin = AuthManager.useIsAdmin();

    const isEditMode = !!user;
    const initialRole = user?.roles.includes(UserRole.Admin) ? UserRole.Admin : UserRole.User;

    const [role, setRole] = useState(initialRole);
    const [permissions, setPermissions] = useState(user?.permissions ?? []);
    const [useServerDefaults, setUseServerDefaults] = useState(!isEditMode);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const havePermissionsChanged =
        isEditMode &&
        (permissions.length !== user.permissions.length ||
            permissions.some((permission) => !user.permissions.includes(permission)));
    const hasRoleChanged = isAdmin && role !== initialRole;
    const canSubmit = isEditMode ? havePermissionsChanged || hasRoleChanged : !!username.trim() && !!password;

    const handlePermissionChange = (permission: UserPermission, checked: boolean) => {
        setPermissions((previous) =>
            checked ? [...previous, permission] : previous.filter((item) => item !== permission),
        );
    };

    const handleDialogSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!canSubmit || isSaving) {
            return;
        }

        setIsSaving(true);
        setErrorMessage('');

        try {
            if (isEditMode) {
                await requestManager.updateUser({
                    userId: user.id,
                    ...(hasRoleChanged && { role }),
                    ...(havePermissionsChanged && { permissions }),
                }).response;
            } else {
                await requestManager.registerUser({
                    username: username.trim(),
                    password,
                    ...(!useServerDefaults && { userPermissions: permissions }),
                }).response;
            }
        } catch (e) {
            setErrorMessage(getErrorMessage(e));
            setIsSaving(false);

            return;
        }

        onSaved();
    };

    return (
        <Dialog
            open
            fullWidth
            maxWidth="xs"
            onClose={isSaving ? undefined : onClose}
            aria-labelledby="account-dialog-title"
        >
            <DialogTitle id="account-dialog-title">
                {isEditMode ? t`Edit ${user.username}` : t`Create user`}
            </DialogTitle>
            <DialogContent dividers>
                <Stack component="form" id="account-form" onSubmit={handleDialogSubmit} sx={{ gap: 2 }}>
                    {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                    {!isEditMode && (
                        <>
                            <TextField
                                autoFocus
                                required
                                label={t`Username`}
                                name="username"
                                autoComplete="off"
                                value={username}
                                disabled={isSaving}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <PasswordTextField
                                required
                                autoComplete="new-password"
                                value={password}
                                disabled={isSaving}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </>
                    )}
                    {isEditMode && isAdmin && (
                        <TextField
                            select
                            label={t`Role`}
                            value={role}
                            disabled={isSaving}
                            onChange={(e) =>
                                setRole(e.target.value === UserRole.Admin ? UserRole.Admin : UserRole.User)
                            }
                        >
                            <MenuItem value={UserRole.User}>{t`User`}</MenuItem>
                            <MenuItem value={UserRole.Admin}>{t`Administrator`}</MenuItem>
                        </TextField>
                    )}
                    <FormControl component="fieldset" disabled={isSaving}>
                        <FormLabel component="legend">{t`Permissions`}</FormLabel>
                        {role === UserRole.Admin && (
                            <FormHelperText>
                                {t`Administrators have all permissions. These selections apply if the role changes to User.`}
                            </FormHelperText>
                        )}
                        {!isEditMode && (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={useServerDefaults}
                                        onChange={(e) => setUseServerDefaults(e.target.checked)}
                                    />
                                }
                                label={t`Use server defaults`}
                            />
                        )}
                        {!useServerDefaults && (
                            <FormGroup>
                                {Object.values(UserPermission).map((permission) => (
                                    <FormControlLabel
                                        key={permission}
                                        control={
                                            <Checkbox
                                                checked={permissions.includes(permission)}
                                                onChange={(_, checked) => handlePermissionChange(permission, checked)}
                                            />
                                        }
                                        label={t(USER_PERMISSION_TO_TRANSLATION[permission])}
                                    />
                                ))}
                            </FormGroup>
                        )}
                    </FormControl>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button disabled={isSaving} onClick={onClose}>
                    {t`Cancel`}
                </Button>
                <Button type="submit" form="account-form" variant="contained" disabled={isSaving || !canSubmit}>
                    {isEditMode ? t`Save` : t`Create user`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
