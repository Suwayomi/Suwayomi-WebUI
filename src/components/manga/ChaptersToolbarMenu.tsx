/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import FilterList from '@mui/icons-material/FilterList';
import { IconButton, Tooltip } from '@mui/material';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ChapterListOptions, ChapterOptionsReducerAction } from '@/typings';
import { ChapterOptions } from '@/components/manga/ChapterOptions';
import { isFilterActive } from '@/components/manga/util';

interface IProps {
    options: ChapterListOptions;
    optionsDispatch: React.Dispatch<ChapterOptionsReducerAction>;
}

export const ChaptersToolbarMenu = ({ options, optionsDispatch }: IProps) => {
    const { t } = useTranslation();

    const [open, setOpen] = React.useState(false);
    const isFiltered = isFilterActive(options);

    return (
        <>
            <Tooltip title={t('settings.title')}>
                <IconButton onClick={() => setOpen(true)}>
                    <FilterList color={isFiltered ? 'warning' : undefined} />
                </IconButton>
            </Tooltip>
            <ChapterOptions
                open={open}
                onClose={() => setOpen(false)}
                options={options}
                optionsDispatch={optionsDispatch}
            />
        </>
    );
};
