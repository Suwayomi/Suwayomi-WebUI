/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import client from 'util/client';
import useLocalStorage from 'util/useLocalStorage';
import { Box } from '@mui/system';
import { IExtension } from 'typings';

interface IProps {
    extension: IExtension;
    notifyInstall: () => void;
}

enum ExtensionAction {
    UPDATE = 'UPDATE',
    UNINSTALL = 'UNINSTALL',
    INSTALL = 'INSTALL',
}

enum ExtensionState {
    OBSOLETE = 'OBSOLETE',
    UPDATING = 'UPDATING',
    UNINSTALLING = 'UNINSTALLING',
    INSTALLING = 'INSTALLING',
}

type InstalledStates = ExtensionAction | ExtensionState;

const InstalledState = { ...ExtensionAction, ...ExtensionState } as const;

const EXTENSION_ACTION_TO_STATE_MAP: { [action in ExtensionAction]: ExtensionState } = {
    [ExtensionAction.UPDATE]: ExtensionState.UPDATING,
    [ExtensionAction.UNINSTALL]: ExtensionState.UNINSTALLING,
    [ExtensionAction.INSTALL]: ExtensionState.INSTALLING,
} as const;

const EXTENSION_ACTION_TO_NEXT_ACTION_MAP: { [action in ExtensionAction]: ExtensionAction } = {
    [ExtensionAction.UPDATE]: ExtensionAction.UNINSTALL,
    [ExtensionAction.UNINSTALL]: ExtensionAction.INSTALL,
    [ExtensionAction.INSTALL]: ExtensionAction.UNINSTALL,
} as const;

export default function ExtensionCard(props: IProps) {
    const {
        extension: { name, lang, versionName, installed, hasUpdate, obsolete, pkgName, iconUrl, isNsfw },
        notifyInstall,
    } = props;
    const [installedState, setInstalledState] = useState<InstalledStates>(() => {
        if (obsolete) {
            return InstalledState.OBSOLETE;
        }
        if (hasUpdate) {
            return InstalledState.UPDATE;
        }
        return installed ? InstalledState.UNINSTALL : InstalledState.INSTALL;
    });

    const [serverAddress] = useLocalStorage<String>('serverBaseURL', '');
    const [useCache] = useLocalStorage<boolean>('useCache', true);

    const langPress = lang === 'all' ? 'All' : lang.toUpperCase();

    const requestExtensionAction = async (action: ExtensionAction): Promise<void> => {
        const nextAction = EXTENSION_ACTION_TO_NEXT_ACTION_MAP[action];
        const state = EXTENSION_ACTION_TO_STATE_MAP[action];

        setInstalledState(state);
        await client.get(`/api/v1/extension/${action.toLowerCase()}/${pkgName}`);
        setInstalledState(nextAction);
        notifyInstall();
    };

    function handleButtonClick() {
        switch (installedState) {
            case ExtensionAction.INSTALL:
            case ExtensionAction.UPDATE:
            case ExtensionAction.UNINSTALL:
                requestExtensionAction(installedState).catch(() => {});
                break;
            case ExtensionState.OBSOLETE:
                requestExtensionAction(ExtensionAction.UNINSTALL).catch(() => {});
                break;
            default:
                break;
        }
    }

    return (
        <Card sx={{ margin: '10px' }}>
            <CardContent
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                }}
            >
                <Box sx={{ display: 'flex' }}>
                    <Avatar
                        variant="rounded"
                        sx={{
                            width: 56,
                            height: 56,
                            flex: '0 0 auto',
                            mr: 2,
                        }}
                        alt={name}
                        src={`${serverAddress}${iconUrl}?useCache=${useCache}`}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h5" component="h2">
                            {name}
                        </Typography>
                        <Typography variant="caption" display="block" gutterBottom>
                            {langPress} {versionName}
                            {isNsfw && (
                                <Typography variant="caption" display="inline" gutterBottom color="red">
                                    {' 18+'}
                                </Typography>
                            )}
                        </Typography>
                    </Box>
                </Box>

                <Button
                    variant="outlined"
                    sx={{ color: installedState === InstalledState.OBSOLETE ? 'red' : 'inherit' }}
                    onClick={() => handleButtonClick()}
                >
                    {installedState}
                </Button>
            </CardContent>
        </Card>
    );
}
