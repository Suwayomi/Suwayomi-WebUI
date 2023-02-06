/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { FormLabel, RadioGroup } from '@mui/material';
import CheckboxInput from 'components/atoms/CheckboxInput';
import RadioInput from 'components/atoms/RadioInput';
import SortRadioInput from 'components/atoms/SortRadioInput';
import ThreeStateCheckboxInput from 'components/atoms/ThreeStateCheckboxInput';
import { GridLayout, useLibraryOptionsContext } from 'components/context/LibraryOptionsContext';
import OptionsTabs from 'components/molecules/OptionsTabs';
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
    open: boolean;
    onClose: () => void;
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
                    return (
                        <>
                            <ThreeStateCheckboxInput
                                label="Unread"
                                checked={options.unread}
                                onChange={(c) => handleFilterChange('unread', c)}
                            />
                            <ThreeStateCheckboxInput
                                label="Downloaded"
                                checked={options.downloaded}
                                onChange={(c) => handleFilterChange('downloaded', c)}
                            />
                        </>
                    );
                }
                if (key === 'sort') {
                    return SORT_OPTIONS.map(([mode, label]) => (
                        <SortRadioInput
                            key={mode}
                            label={label}
                            checked={options.sorts === mode}
                            sortDescending={options.sortDesc}
                            onClick={() =>
                                mode !== options.sorts
                                    ? handleFilterChange('sorts', mode)
                                    : handleFilterChange('sortDesc', !options.sortDesc)
                            }
                        />
                    ));
                }
                if (key === 'display') {
                    const { gridLayout, showDownloadBadge, showUnreadBadge } = options;
                    return (
                        <>
                            <FormLabel>Display mode</FormLabel>
                            <RadioGroup
                                onChange={(e) =>
                                    handleFilterChange('gridLayout', Number(e.target.value))
                                }
                                value={gridLayout}
                            >
                                <RadioInput
                                    label="Compact grid"
                                    value={GridLayout.Compact}
                                    checked={
                                        gridLayout == null || gridLayout === GridLayout.Compact
                                    }
                                />
                                <RadioInput
                                    label="Comfortable grid"
                                    value={GridLayout.Comfortable}
                                    checked={gridLayout === GridLayout.Comfortable}
                                />
                                <RadioInput
                                    label="List"
                                    value={GridLayout.List}
                                    checked={gridLayout === GridLayout.List}
                                />
                            </RadioGroup>

                            <FormLabel sx={{ mt: 2 }}>Badges</FormLabel>
                            <CheckboxInput
                                label="Unread Badges"
                                checked={showUnreadBadge === true}
                                onChange={() =>
                                    handleFilterChange('showUnreadBadge', !showUnreadBadge)
                                }
                            />
                            <CheckboxInput
                                label="Download Badges"
                                checked={showDownloadBadge === true}
                                onChange={() =>
                                    handleFilterChange('showDownloadBadge', !showDownloadBadge)
                                }
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
