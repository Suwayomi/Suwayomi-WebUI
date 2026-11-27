/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState, type FormEvent } from 'react';
import { msg } from '@lingui/core/macro';
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
import { UserPermission, UserRole } from '@/lib/graphql/generated/graphql-base.types.ts';
import type { GetUsersQuery } from '@/lib/graphql/generated/graphql.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';

export type ManagedUser = GetUsersQuery['users']['nodes'][number];

const permissionLabels = {
    [UserPermission.InstallExtensions]: msg`Install extensions`,
    [UserPermission.InstallExternalExtensions]: msg`Install external extensions`,
    [UserPermission.UninstallExtensions]: msg`Uninstall extensions`,
    [UserPermission.DownloadChapters]: msg`Download chapters`,
    [UserPermission.AccessNsfw]: msg`Access adult content`,
    [UserPermission.ManageSettings]: msg`Manage server settings`,
    [UserPermission.ManageUsers]: msg`Manage users`,
    [UserPermission.ManageExtensionStores]: msg`Manage extension stores`,
    [UserPermission.ManageSourcePreferences]: msg`Manage source preferences`,
    [UserPermission.ManageCache]: msg`Manage cache`,
};

export function UserAccountDialog({
    user,
    onClose,
    onSaved,
}: {
    user?: ManagedUser;
    onClose: () => void;
    onSaved: () => void;
}) {
    const { t } = useLingui();
    const isAdmin = AuthManager.useIsAdmin();
    const initialRole = user?.roles.includes(UserRole.Admin) ? UserRole.Admin : UserRole.User;
    const [role, setRole] = useState(initialRole);
    const [permissions, setPermissions] = useState(user?.permissions ?? []);
    const [useDefaults, setUseDefaults] = useState(!user);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const permissionsChanged =
        !!user &&
        (permissions.length !== user.permissions.length ||
            permissions.some((permission) => !user.permissions.includes(permission)));
    const roleChanged = isAdmin && role !== initialRole;
    const canSave = user ? permissionsChanged || roleChanged : !!username.trim() && !!password;

    const save = async (event: FormEvent) => {
        event.preventDefault();
        if (!canSave || saving) {
            return;
        }
        setSaving(true);
        setError('');
        try {
            if (user) {
                await requestManager.updateUser({
                    userId: user.id,
                    ...(roleChanged && { role }),
                    ...(permissionsChanged && { permissions }),
                }).response;
            } else {
                await requestManager.registerUser({
                    username: username.trim(),
                    password,
                    ...(!useDefaults && { userPermissions: permissions }),
                }).response;
            }
        } catch (reason) {
            setError(getErrorMessage(reason));
            setSaving(false);
            return;
        }
        onSaved();
    };

    return (
        <Dialog
            open
            fullWidth
            maxWidth="xs"
            onClose={saving ? undefined : onClose}
            aria-labelledby="account-dialog-title"
        >
            <DialogTitle id="account-dialog-title">{user ? t`Edit ${user.username}` : t`Create user`}</DialogTitle>
            <DialogContent dividers>
                <Stack component="form" id="account-form" onSubmit={save} sx={{ gap: 2 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {!user && (
                        <>
                            <TextField
                                autoFocus
                                required
                                label={t`Username`}
                                name="username"
                                autoComplete="off"
                                value={username}
                                disabled={saving}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <PasswordTextField
                                required
                                autoComplete="new-password"
                                value={password}
                                disabled={saving}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </>
                    )}
                    {user && isAdmin && (
                        <TextField
                            select
                            label={t`Role`}
                            value={role}
                            disabled={saving}
                            onChange={(e) =>
                                setRole(e.target.value === UserRole.Admin ? UserRole.Admin : UserRole.User)
                            }
                        >
                            <MenuItem value={UserRole.User}>{t`User`}</MenuItem>
                            <MenuItem value={UserRole.Admin}>{t`Administrator`}</MenuItem>
                        </TextField>
                    )}
                    <FormControl component="fieldset" disabled={saving}>
                        <FormLabel component="legend">{t`Permissions`}</FormLabel>
                        {role === UserRole.Admin && (
                            <FormHelperText>{t`Administrators have all permissions. These selections apply if the role changes to User.`}</FormHelperText>
                        )}
                        {!user && (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={useDefaults}
                                        onChange={(e) => setUseDefaults(e.target.checked)}
                                    />
                                }
                                label={t`Use server defaults`}
                            />
                        )}
                        {!useDefaults && (
                            <FormGroup>
                                {Object.values(UserPermission).map((permission) => (
                                    <FormControlLabel
                                        key={permission}
                                        control={
                                            <Checkbox
                                                checked={permissions.includes(permission)}
                                                onChange={(_, checked) =>
                                                    setPermissions((previous) =>
                                                        checked
                                                            ? [...previous, permission]
                                                            : previous.filter((item) => item !== permission),
                                                    )
                                                }
                                            />
                                        }
                                        label={t(permissionLabels[permission])}
                                    />
                                ))}
                            </FormGroup>
                        )}
                    </FormControl>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button disabled={saving} onClick={onClose}>{t`Cancel`}</Button>
                <Button type="submit" form="account-form" variant="contained" disabled={saving || !canSave}>
                    {user ? t`Save` : t`Create user`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
