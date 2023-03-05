/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { List, ListItem, ListItemText, Switch } from '@mui/material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import { IReaderSettings } from 'typings';

interface IProps extends IReaderSettings {
    setSettingValue: (key: keyof IReaderSettings, value: string | boolean) => void;
}

export default function ReaderSettingsOptions({
    staticNav,
    loadNextOnEnding,
    readerType,
    showPageNumber,
    setSettingValue,
}: IProps) {
    return (
        <List>
            <ListItem>
                <ListItemText primary="Static Navigation" />
                <ListItemSecondaryAction>
                    <Switch
                        edge="end"
                        checked={staticNav}
                        onChange={(e) => setSettingValue('staticNav', e.target.checked)}
                    />
                </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
                <ListItemText primary="Show page number" />
                <ListItemSecondaryAction>
                    <Switch
                        edge="end"
                        checked={showPageNumber}
                        onChange={(e) => setSettingValue('showPageNumber', e.target.checked)}
                    />
                </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
                <ListItemText primary="Load next chapter at ending" />
                <ListItemSecondaryAction>
                    <Switch
                        edge="end"
                        checked={loadNextOnEnding}
                        onChange={(e) => setSettingValue('loadNextOnEnding', e.target.checked)}
                    />
                </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
                <ListItemText primary="Reader Type" />
                <Select
                    variant="standard"
                    value={readerType}
                    onChange={(e) => setSettingValue('readerType', e.target.value)}
                    sx={{ p: 0 }}
                >
                    <MenuItem value="SingleLTR">Single Page (LTR)</MenuItem>
                    <MenuItem value="SingleRTL">Single Page (RTL)</MenuItem>
                    {/* <MenuItem value="SingleVertical">
                                       Vertical(WIP)
                                    </MenuItem> */}
                    <MenuItem value="DoubleLTR">Double Page (LTR)</MenuItem>
                    <MenuItem value="DoubleRTL">Double Page (RTL)</MenuItem>
                    <MenuItem value="Webtoon">Webtoon</MenuItem>
                    <MenuItem value="ContinuesVertical">Continues Vertical</MenuItem>
                    <MenuItem value="ContinuesHorizontalLTR">Horizontal (LTR)</MenuItem>
                    <MenuItem value="ContinuesHorizontalRTL">Horizontal (RTL)</MenuItem>
                </Select>
            </ListItem>
        </List>
    );
}
