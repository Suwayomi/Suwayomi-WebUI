/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import { useLingui } from '@lingui/react/macro';
import { EmptyView } from '@/base/components/feedback/EmptyView.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { AuthManager } from '@/features/authentication/AuthManager.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { DeleteUserDialog } from '@/features/settings/components/DeleteUserDialog.tsx';
import { UserAccountDialog } from '@/features/settings/components/UserAccountDialog.tsx';
import type { ManagedUser } from '@/features/settings/Settings.types.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { UserRole } from '@/lib/graphql/generated/graphql-base.types.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';

const BUILT_IN_ADMIN_ID = 1;

type UserDialog = { type: 'account'; user?: ManagedUser } | { type: 'delete'; userId: ManagedUser['id'] };

export function UserManagement() {
    const { t } = useLingui();

    useAppTitle(t`User management`);

    const { accessToken } = AuthManager.useSession();
    const { data, loading, error, refetch } = requestManager.useGetUsers();
    const { data: deletionSupport } = requestManager.useGetUserDeletionSupport();

    const [dialog, setDialog] = useState<UserDialog | null>(null);

    const users = data?.users.nodes ?? [];
    const supportsDeletion = deletionSupport?.mutationType?.fields?.some(({ name }) => name === 'deleteUser') ?? false;
    const canDeleteUser = (user: ManagedUser) =>
        supportsDeletion &&
        accessToken?.canManageUsers &&
        accessToken.userId != null &&
        user.id !== BUILT_IN_ADMIN_ID &&
        user.id !== accessToken.userId &&
        (accessToken.isAdmin || !user.roles.includes(UserRole.Admin));

    const userToDelete =
        dialog?.type === 'delete' ? users.find((user) => user.id === dialog.userId && canDeleteUser(user)) : undefined;

    const refetchUsers = () => refetch().catch(defaultPromiseErrorHandler('UserManagement::refetch'));
    const closeDialog = () => setDialog(null);
    const handleUserChange = () => {
        closeDialog();
        refetchUsers();
    };

    if (error) {
        return (
            <EmptyView message={t`Could not load users`} messageExtra={getErrorMessage(error)} retry={refetchUsers} />
        );
    }

    if (loading && !data) {
        return <LoadingPlaceholder />;
    }

    return (
        <Stack sx={{ p: 2, gap: 1 }}>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ alignSelf: 'flex-start' }}
                onClick={() => setDialog({ type: 'account' })}
            >
                {t`Create user`}
            </Button>
            <List>
                {users.map((user) => {
                    const isBuiltInAdmin = user.id === BUILT_IN_ADMIN_ID;
                    const roleLabel = user.roles.includes(UserRole.Admin) ? t`Administrator` : t`User`;

                    return (
                        <ListItem key={user.id} divider>
                            <ListItemText
                                primary={user.username}
                                secondary={isBuiltInAdmin ? t`Built-in administrator` : roleLabel}
                                sx={{ overflowWrap: 'anywhere' }}
                            />
                            {!isBuiltInAdmin && (
                                <Button
                                    onClick={() => setDialog({ type: 'account', user })}
                                    aria-label={t`Edit ${user.username}`}
                                >
                                    {t`Edit`}
                                </Button>
                            )}
                            {canDeleteUser(user) && (
                                <Button
                                    color="error"
                                    disabled={loading}
                                    onClick={() => setDialog({ type: 'delete', userId: user.id })}
                                    aria-label={t`Delete ${user.username}`}
                                >
                                    {t`Delete`}
                                </Button>
                            )}
                        </ListItem>
                    );
                })}
            </List>
            {dialog?.type === 'account' && (
                <UserAccountDialog user={dialog.user} onClose={closeDialog} onSaved={handleUserChange} />
            )}
            {userToDelete && (
                <DeleteUserDialog user={userToDelete} onClose={closeDialog} onDeleted={handleUserChange} />
            )}
        </Stack>
    );
}
