/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RadioGroup } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChapterListOptions, ChapterOptionsReducerAction, TranslationKey } from '@/typings';
import RadioInput from '@/components/atoms/RadioInput';
import SortRadioInput from '@/components/atoms/SortRadioInput';
import ThreeStateCheckboxInput from '@/components/atoms/ThreeStateCheckboxInput';
import OptionsTabs from '@/components/molecules/OptionsTabs';
import { SORT_OPTIONS } from '@/components/manga/util';

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

const ChapterOptions: React.FC<IProps> = ({ open, onClose, options, optionsDispatch }) => {
    const { t } = useTranslation();

    return (
        <OptionsTabs<'filter' | 'sort' | 'display'>
            open={open}
            onClose={onClose}
            minHeight={150}
            tabs={['filter', 'sort', 'display']}
            tabTitle={(key) => t(TITLES[key]) as string}
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
                    return SORT_OPTIONS.map(([mode, label]) => (
                        <SortRadioInput
                            key={mode}
                            label={t(label) as string}
                            checked={options.sortBy === mode}
                            sortDescending={options.reverse}
                            onClick={() =>
                                mode !== options.sortBy
                                    ? optionsDispatch({ type: 'sortBy', sortBy: mode })
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

export default ChapterOptions;
