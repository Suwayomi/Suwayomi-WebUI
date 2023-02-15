import { ListItem, ListItemText, Switch } from '@mui/material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import React from 'react';
import { useSearchSettings } from 'util/searchSettings';
import { requestUpdateServerMetadata } from 'util/metadata';
import makeToast from 'components/util/Toast';
import ListItemIcon from '@mui/material/ListItemIcon';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchSettings() {
    const { metadata, settings } = useSearchSettings();

    const setSettingValue = (key: keyof ISearchSettings, value: boolean) => {
        requestUpdateServerMetadata(metadata ?? {}, [[key, value]]).catch(() =>
            makeToast('Failed to save the default reader settings to the server', 'warning'),
        );
    };
    return (
        <ListItem>
            <ListItemIcon>
                <SearchIcon />
            </ListItemIcon>
            <ListItemText primary="Override Filters when Searching" />
            <ListItemSecondaryAction>
                <Switch
                    edge="end"
                    checked={settings.overrideFilters}
                    onChange={(e) => setSettingValue('overrideFilters', e.target.checked)}
                />
            </ListItemSecondaryAction>
        </ListItem>
    );
}
