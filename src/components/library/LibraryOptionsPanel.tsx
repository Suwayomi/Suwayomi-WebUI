/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import {
    Checkbox,
    FormControlLabel, FormLabel, Radio, RadioGroup,
} from '@mui/material';
import { useLibraryOptionsContext } from 'components/context/LibraryOptionsContext';
import OptionsTabs from 'components/molecules/OptionsTabs';
import ThreeStateCheckbox from 'components/util/ThreeStateCheckbox';
import React from 'react';

const TITLES = {
    filter: 'Filter',
    sort: 'Sort',
    display: 'Display',
};

const SORT_OPTIONS: [LibrarySortMode, string][] = [
    ['sortToRead', 'By Unread chapters'],
    ['sortAlph', 'Alphabetically'],
    ['sortID', 'By ID'],
];

interface IProps {
    open: boolean,
    onClose: () => void,
}

const LibraryOptionsPanel: React.FC<IProps> = ({ open, onClose }) => {
    const { options, setOptions } = useLibraryOptionsContext();

    const handleFilterChange = <T extends keyof LibraryOptions>(
        key: T,
        value: LibraryOptions[T],
    ) => {
        setOptions((v) => ({ ...v, [key]: value }));
    };

    return (
        <OptionsTabs<'filter' | 'sort' | 'display'>
            open={open}
            onClose={onClose}
            tabs={['filter', 'sort', 'display']}
            tabTitle={(key) => TITLES[key]}
            tabContent={(key) => {
                if (key === 'filter') {
                    const { unread, downloaded } = options;
                    return (
                        <>
                            <FormControlLabel
                                control={(
                                    <ThreeStateCheckbox checked={unread} onChange={(change) => handleFilterChange('unread', change)} />
                                )}
                                label="Unread"
                            />
                            <FormControlLabel
                                control={<ThreeStateCheckbox checked={downloaded} onChange={(change) => handleFilterChange('downloaded', change)} />}
                                label="Downloaded"
                            />
                        </>
                    );
                }
                if (key === 'sort') {
                    const { sorts, sortDesc } = options;
                    return SORT_OPTIONS.map(([mode, label]) => (
                        <FormControlLabel
                            key={mode}
                            control={(
                                <Radio
                                    checked={sorts === mode}
                                    checkedIcon={sortDesc ? <ArrowUpward color="primary" /> : <ArrowDownward color="primary" />}
                                    onClick={() => (mode !== sorts
                                        ? handleFilterChange('sorts', mode)
                                        : handleFilterChange('sortDesc', !sortDesc))}
                                />
                            )}
                            label={label}
                        />
                    ));
                }
                if (key === 'display') {
                    const { gridLayout, showDownloadBadge, showUnreadBadge } = options;
                    return (
                        <>
                            <FormLabel>Display mode</FormLabel>
                            <RadioGroup
                                onChange={(e) => handleFilterChange('gridLayout', Number(e.target.value))}
                                value={gridLayout}
                            >
                                <FormControlLabel label="Compact grid" value={0} control={<Radio checked={gridLayout == null || gridLayout === 0} />} />
                                <FormControlLabel label="Comfortable grid" value={1} control={<Radio checked={gridLayout === 1} />} />
                                <FormControlLabel label="List" value={2} control={<Radio checked={gridLayout === 2} />} />
                            </RadioGroup>

                            <FormLabel sx={{ mt: 2 }}>Badges</FormLabel>
                            <FormControlLabel
                                label="Unread Badges"
                                control={(
                                    <Checkbox
                                        checked={showUnreadBadge === true}
                                        onChange={() => handleFilterChange('showUnreadBadge', !showUnreadBadge)}
                                    />
                                )}
                            />
                            <FormControlLabel
                                label="Download Badges"
                                control={(
                                    <Checkbox
                                        checked={showDownloadBadge === true}
                                        onChange={() => handleFilterChange('showDownloadBadge', !showDownloadBadge)}
                                    />
                                )}
                            />
                        </>
                    );
                }
                return null;
            }}
        />
    );
};

export default LibraryOptionsPanel;
