/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import RadioGroup from '@mui/material/RadioGroup';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChapterListOptions, ChapterOptionsReducerAction } from '@/typings.ts';
import { RadioInput } from '@/modules/core/components/inputs/RadioInput.tsx';
import { SortRadioInput } from '@/modules/core/components/inputs/SortRadioInput.tsx';
import { ThreeStateCheckboxInput } from '@/modules/core/components/inputs/ThreeStateCheckboxInput.tsx';
import { OptionsTabs } from '@/modules/core/components/OptionsTabs.tsx';
import { SORT_OPTIONS } from '@/components/chapter/util.tsx';
import { TranslationKey } from '@/Base.types.ts';

interface IProps {
    open: boolean;
    onClose: () => void;
    options: ChapterListOptions;
    optionsDispatch: React.Dispatch<ChapterOptionsReducerAction>;
}

const TITLES: { [key in 'filter' | 'sort' | 'display']: TranslationKey } = {
    filter: 'global.label.filter',
    sort: 'global.label.sort',
    display: 'global.label.display',
};

export const ChapterOptions: React.FC<IProps> = ({ open, onClose, options, optionsDispatch }) => {
    const { t } = useTranslation();

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
                                label={t('global.filter.label.unread')}
                                checked={options.unread}
                                onChange={(c) =>
                                    optionsDispatch({
                                        type: 'filter',
                                        filterType: 'unread',
                                        filterValue: c,
                                    })
                                }
                            />
                            <ThreeStateCheckboxInput
                                label={t('global.filter.label.downloaded')}
                                checked={options.downloaded}
                                onChange={(c) =>
                                    optionsDispatch({
                                        type: 'filter',
                                        filterType: 'downloaded',
                                        filterValue: c,
                                    })
                                }
                            />
                            <ThreeStateCheckboxInput
                                label={t('global.filter.label.bookmarked')}
                                checked={options.bookmarked}
                                onChange={(c) =>
                                    optionsDispatch({
                                        type: 'filter',
                                        filterType: 'bookmarked',
                                        filterValue: c,
                                    })
                                }
                            />
                        </>
                    );
                }
                if (key === 'sort') {
                    return Object.entries(SORT_OPTIONS).map(([mode, label]) => (
                        <SortRadioInput
                            key={mode}
                            label={t(label)}
                            checked={options.sortBy === mode}
                            sortDescending={options.reverse}
                            onClick={() =>
                                mode !== options.sortBy
                                    ? optionsDispatch({ type: 'sortBy', sortBy: mode as keyof typeof SORT_OPTIONS })
                                    : optionsDispatch({ type: 'sortReverse' })
                            }
                        />
                    ));
                }
                if (key === 'display') {
                    return (
                        <RadioGroup
                            onChange={() => optionsDispatch({ type: 'showChapterNumber' })}
                            value={options.showChapterNumber}
                        >
                            <RadioInput label={t('chapter.option.display.label.source_title')} value={false} />
                            <RadioInput label={t('chapter.option.display.label.chapter_number')} value />
                        </RadioGroup>
                    );
                }
                return null;
            }}
        />
    );
};
