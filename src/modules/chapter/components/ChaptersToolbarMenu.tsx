/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import FilterList from '@mui/icons-material/FilterList';
import IconButton from '@mui/material/IconButton';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { ChapterOptions } from '@/modules/chapter/components/ChapterOptions.tsx';
import { isFilterActive, updateChapterListOptions } from '@/modules/chapter/utils/ChapterList.util.tsx';
import { ChapterListOptions } from '@/modules/chapter/Chapter.types.ts';

interface IProps {
    options: ChapterListOptions;
    updateOption: ReturnType<typeof updateChapterListOptions>;
}

export const ChaptersToolbarMenu = ({ options, updateOption }: IProps) => {
    const { t } = useTranslation();

    const [open, setOpen] = React.useState(false);
    const isFiltered = isFilterActive(options);

    return (
        <>
            <CustomTooltip title={t('settings.title')}>
                <IconButton onClick={() => setOpen(true)} color="inherit">
                    <FilterList color={isFiltered ? 'warning' : undefined} />
                </IconButton>
            </CustomTooltip>
            <ChapterOptions open={open} onClose={() => setOpen(false)} options={options} updateOption={updateOption} />
        </>
    );
};
