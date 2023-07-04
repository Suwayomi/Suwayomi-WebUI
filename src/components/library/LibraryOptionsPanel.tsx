/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { FormLabel, RadioGroup } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LibraryOptions, LibrarySortMode, TranslationKey } from '@/typings';
import CheckboxInput from '@/components/atoms/CheckboxInput';
import RadioInput from '@/components/atoms/RadioInput';
import SortRadioInput from '@/components/atoms/SortRadioInput';
import ThreeStateCheckboxInput from '@/components/atoms/ThreeStateCheckboxInput';
import { GridLayout, useLibraryOptionsContext } from '@/components/context/LibraryOptionsContext';
import OptionsTabs from '@/components/molecules/OptionsTabs';

const TITLES: { [key in 'filter' | 'sort' | 'display']: TranslationKey } = {
    filter: 'global.label.filter',
    sort: 'global.label.sort',
    display: 'global.label.display',
};

const SORT_OPTIONS: [LibrarySortMode, TranslationKey][] = [
    ['sortToRead', 'library.option.sort.label.by_unread_chapters'],
    ['sortAlph', 'library.option.sort.label.alphabetically'],
    ['sortDateAdded', 'library.option.sort.label.by_date_added'],
    ['sortLastRead', 'library.option.sort.label.by_last_read'],
];

interface IProps {
    open: boolean;
    onClose: () => void;
}

const LibraryOptionsPanel: React.FC<IProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const { options, setOptions } = useLibraryOptionsContext();

    const handleFilterChange = <T extends keyof LibraryOptions>(key: T, value: LibraryOptions[T]) => {
        setOptions((v) => ({ ...v, [key]: value }));
    };

    return (
        <OptionsTabs<'filter' | 'sort' | 'display'>
            open={open}
            onClose={onClose}
            tabs={['filter', 'sort', 'display']}
            tabTitle={(key) => t(TITLES[key])}
            tabContent={(key) => {
                if (key === 'filter') {
                    return (
                        <>
                            <ThreeStateCheckboxInput
                                label={t('global.filter.label.unread')}
                                checked={options.unread}
                                onChange={(c) => handleFilterChange('unread', c)}
                            />
                            <ThreeStateCheckboxInput
                                label={t('global.filter.label.downloaded')}
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
                            label={t(label)}
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
                    const { gridLayout, showDownloadBadge, showUnreadBadge, showTabSize } = options;
                    return (
                        <>
                            <FormLabel>{t('global.grid_layout.title')}</FormLabel>
                            <RadioGroup
                                onChange={(e) => handleFilterChange('gridLayout', Number(e.target.value))}
                                value={gridLayout}
                            >
                                <RadioInput
                                    label={t('global.grid_layout.label.compact_grid')}
                                    value={GridLayout.Compact}
                                    checked={gridLayout == null || gridLayout === GridLayout.Compact}
                                />
                                <RadioInput
                                    label={t('global.grid_layout.label.comfortable_grid')}
                                    value={GridLayout.Comfortable}
                                    checked={gridLayout === GridLayout.Comfortable}
                                />
                                <RadioInput
                                    label={t('global.grid_layout.label.list')}
                                    value={GridLayout.List}
                                    checked={gridLayout === GridLayout.List}
                                />
                            </RadioGroup>

                            <FormLabel sx={{ mt: 2 }}>{t('library.option.display.badge.title')}</FormLabel>
                            <CheckboxInput
                                label={t('library.option.display.badge.label.unread_badges')}
                                checked={showUnreadBadge === true}
                                onChange={() => handleFilterChange('showUnreadBadge', !showUnreadBadge)}
                            />
                            <CheckboxInput
                                label={t('library.option.display.badge.label.download_badges')}
                                checked={showDownloadBadge === true}
                                onChange={() => handleFilterChange('showDownloadBadge', !showDownloadBadge)}
                            />

                            <FormLabel sx={{ mt: 2 }}>{t('library.option.display.tab.title')}</FormLabel>
                            <CheckboxInput
                                label={t('library.option.display.tab.label.show_number_of_items')}
                                checked={showTabSize}
                                onChange={() => handleFilterChange('showTabSize', !showTabSize)}
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
