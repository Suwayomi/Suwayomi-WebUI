/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import OptionsTabs from 'components/molecules/OptionsTabs';
import ThreeStateCheckbox from 'components/util/ThreeStateCheckbox';
import React, { useCallback } from 'react';
import { SORT_OPTIONS } from './util';

interface IProps {
    open: boolean
    onClose: () => void
    options: ChapterListOptions
    optionsDispatch: React.Dispatch<ChapterOptionsReducerAction>
}

const TITLES = {
    filter: 'Filter',
    sort: 'Sort',
    display: 'Display',
};

const ChapterOptions: React.FC<IProps> = ({
    open, onClose, options, optionsDispatch,
}) => {
    const handleFilterChange = useCallback(
        (value: NullAndUndefined<boolean>, name: string) => {
            optionsDispatch({ type: 'filter', filterType: name.toLowerCase(), filterValue: value });
        }, [],
    );

    return (
        <OptionsTabs<'filter' | 'sort' | 'display'>
            open={open}
            onClose={onClose}
            minHeight={150}
            tabs={['filter', 'sort', 'display']}
            tabTitle={(key) => TITLES[key]}
            tabContent={(key) => {
                if (key === 'filter') {
                    return (
                        <>
                            <FormControlLabel label="Unread" control={<ThreeStateCheckbox name="Unread" checked={options.unread} onChange={handleFilterChange} />} />
                            <FormControlLabel label="Downloaded" control={<ThreeStateCheckbox name="Downloaded" checked={options.downloaded} onChange={handleFilterChange} />} />
                            <FormControlLabel label="Bookmarked" control={<ThreeStateCheckbox name="Bookmarked" checked={options.bookmarked} onChange={handleFilterChange} />} />
                        </>
                    );
                }
                if (key === 'sort') {
                    return SORT_OPTIONS.map(([mode, label]) => (
                        <FormControlLabel
                            key={mode}
                            label={label}
                            control={(
                                <Radio
                                    checked={options.sortBy === mode}
                                    checkedIcon={options.reverse ? <ArrowUpward color="primary" /> : <ArrowDownward color="primary" />}
                                    onClick={() => (mode !== options.sortBy
                                        ? optionsDispatch({ type: 'sortBy', sortBy: mode })
                                        : optionsDispatch({ type: 'sortReverse' }))}
                                />
                            )}
                        />
                    ));
                }
                if (key === 'display') {
                    return (
                        <RadioGroup onChange={() => optionsDispatch({ type: 'showChapterNumber' })} value={options.showChapterNumber}>
                            <FormControlLabel label="Source Title" control={<Radio checked={!options.showChapterNumber} />} />
                            <FormControlLabel label="Chapter Number" control={<Radio checked={options.showChapterNumber} />} />
                        </RadioGroup>
                    );
                }
                return null;
            }}
        />
    );
};

export default ChapterOptions;
