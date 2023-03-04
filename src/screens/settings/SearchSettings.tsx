import { ListItem, ListItemText, Switch } from '@mui/material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import React from 'react';
import { useSearchSettings } from 'util/searchSettings';
import { requestUpdateServerMetadata } from 'util/metadata';
import makeToast from 'components/util/Toast';
import ListItemIcon from '@mui/material/ListItemIcon';
import SearchIcon from '@mui/icons-material/Search';
import { SearchMetadataKeys } from 'typings';

export default function SearchSettings() {
    const { metadata, settings } = useSearchSettings();

    const setSettingValue = (key: SearchMetadataKeys, value: boolean) => {
        requestUpdateServerMetadata(metadata ?? {}, [[key, value]]).catch(() =>
            makeToast('Failed to save the default search settings to the server', 'warning'),
        );
    };
    return (
        <ListItem>
            <ListItemIcon>
                <SearchIcon />
            </ListItemIcon>
            <ListItemText primary="Ignore Filters when Searching" />
            <ListItemSecondaryAction>
                <Switch
                    edge="end"
                    checked={settings.ignoreFilters}
                    onChange={(e) => setSettingValue('ignoreFilters', e.target.checked)}
                />
            </ListItemSecondaryAction>
        </ListItem>
    );
}
