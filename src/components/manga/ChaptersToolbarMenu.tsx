/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import FilterList from '@mui/icons-material/FilterList';
import { IconButton } from '@mui/material';
import * as React from 'react';
import ChapterOptions from 'components/manga/ChapterOptions';
import { isFilterActive } from 'components/manga/util';
import { ChapterListOptions, ChapterOptionsReducerAction } from 'typings';

interface IProps {
    options: ChapterListOptions;
    optionsDispatch: React.Dispatch<ChapterOptionsReducerAction>;
}

const ChaptersToolbarMenu = ({ options, optionsDispatch }: IProps) => {
    const [open, setOpen] = React.useState(false);
    const isFiltered = isFilterActive(options);

    return (
        <>
            <IconButton onClick={() => setOpen(true)}>
                <FilterList color={isFiltered ? 'warning' : undefined} />
            </IconButton>
            <ChapterOptions
                open={open}
                onClose={() => setOpen(false)}
                options={options}
                optionsDispatch={optionsDispatch}
            />
        </>
    );
};

export default ChaptersToolbarMenu;
