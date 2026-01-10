/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MessageDescriptor } from '@lingui/core';
import RadioGroup from '@mui/material/RadioGroup';
import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { RadioInput } from '@/base/components/inputs/RadioInput.tsx';
import { SortRadioInput } from '@/base/components/inputs/SortRadioInput.tsx';
import { ThreeStateCheckboxInput } from '@/base/components/inputs/ThreeStateCheckboxInput.tsx';
import { OptionsTabs } from '@/base/components/modals/OptionsTabs.tsx';
import { CHAPTER_SORT_OPTIONS_TO_TRANSLATION } from '@/features/chapter/Chapter.constants.ts';
import { ChapterListOptions } from '@/features/chapter/Chapter.types.ts';
import { updateChapterListOptions } from '@/features/chapter/utils/ChapterList.util.tsx';
import { ChapterExcludeSanlatorsFilter } from '@/features/chapter/components/ChapterExcludeSanlatorsFilter.tsx';

interface IProps {
    open: boolean;
    onClose: () => void;
    options: ChapterListOptions;
    updateOption: ReturnType<typeof updateChapterListOptions>;
    scanlators: string[];
    excludedScanlators: string[];
}

const TITLES: { [key in 'filter' | 'sort' | 'display']: MessageDescriptor } = {
    filter: msg`Filter`,
    sort: msg`Sort`,
    display: msg`Display`,
};

export const ChapterOptions: React.FC<IProps> = ({
    open,
    onClose,
    options,
    updateOption,
    scanlators,
    excludedScanlators,
}) => {
    const { t } = useLingui();

    return (
        <OptionsTabs<'filter' | 'sort' | 'display'>
            open={open}
            onClose={onClose}
            minHeight={150}
            tabs={['filter', 'sort', 'display']}
            tabTitle={(key) => t(TITLES[key])}
            tabContent={(key) => {
                if (key === 'filter') {
                    return (
                        <>
                            <ThreeStateCheckboxInput
                                label={t`Unread`}
                                checked={options.unread}
                                onChange={(c) => updateOption('unread', c)}
                            />
                            <ThreeStateCheckboxInput
                                label={t`Downloaded`}
                                checked={options.downloaded}
                                onChange={(c) => updateOption('downloaded', c)}
                            />
                            <ThreeStateCheckboxInput
                                label={t`Bookmarked`}
                                checked={options.bookmarked}
                                onChange={(c) => updateOption('bookmarked', c)}
                            />
                            <ChapterExcludeSanlatorsFilter
                                scanlators={scanlators}
                                excludedScanlators={excludedScanlators}
                                updateOption={updateOption}
                            />
                        </>
                    );
                }
                if (key === 'sort') {
                    return Object.entries(CHAPTER_SORT_OPTIONS_TO_TRANSLATION).map(([mode, label]) => (
                        <SortRadioInput
                            key={mode}
                            label={t(label)}
                            checked={options.sortBy === mode}
                            sortDescending={options.reverse}
                            onClick={() =>
                                mode !== options.sortBy
                                    ? updateOption('sortBy', mode as keyof typeof CHAPTER_SORT_OPTIONS_TO_TRANSLATION)
                                    : updateOption('reverse', !options.reverse)
                            }
                        />
                    ));
                }
                if (key === 'display') {
                    return (
                        <RadioGroup
                            onChange={() => updateOption('showChapterNumber', !options.showChapterNumber)}
                            value={options.showChapterNumber}
                        >
                            <RadioInput label={t`Source title`} value={false} />
                            <RadioInput label={t`Chapter number`} value />
                        </RadioGroup>
                    );
                }
                return null;
            }}
        />
    );
};
