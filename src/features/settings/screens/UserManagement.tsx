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
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { UserAccountDialog, type ManagedUser } from '@/features/settings/components/UserAccountDialog.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { UserRole } from '@/lib/graphql/generated/graphql-base.types.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';

export function UserManagement() {
    const { t } = useLingui();
    useAppTitle(t`User management`);
    const { data, loading, error, refetch } = requestManager.useGetUsers();
    const [editing, setEditing] = useState<ManagedUser | 'new' | null>(null);
    const reload = () => refetch().catch(defaultPromiseErrorHandler('UserManagement::refetch'));

    if (error) {
        return <EmptyView message={t`Could not load users`} messageExtra={getErrorMessage(error)} retry={reload} />;
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
                onClick={() => setEditing('new')}
            >
                {t`Create user`}
            </Button>
            <List>
                {data?.users.nodes.map((user) => {
                    const builtIn = user.id === 1;
                    const roleLabel = user.roles.includes(UserRole.Admin) ? t`Administrator` : t`User`;
                    return (
                        <ListItem key={user.id} divider>
                            <ListItemText
                                primary={user.username}
                                secondary={builtIn ? t`Built-in administrator` : roleLabel}
                                sx={{ overflowWrap: 'anywhere' }}
                            />
                            {!builtIn && (
                                <Button onClick={() => setEditing(user)} aria-label={t`Edit ${user.username}`}>
                                    {t`Edit`}
                                </Button>
                            )}
                        </ListItem>
                    );
                })}
            </List>
            {editing !== null && (
                <UserAccountDialog
                    user={editing === 'new' ? undefined : editing}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null);
                        reload();
                    }}
                />
            )}
        </Stack>
    );
}
