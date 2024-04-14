/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LibraryOptions, LibrarySortMode, TranslationKey } from '@/typings';
import { CheckboxInput } from '@/components/atoms/CheckboxInput';
import { RadioInput } from '@/components/atoms/RadioInput';
import { SortRadioInput } from '@/components/atoms/SortRadioInput';
import { ThreeStateCheckboxInput } from '@/components/atoms/ThreeStateCheckboxInput';
import { GridLayout, useLibraryOptionsContext } from '@/components/context/LibraryOptionsContext';
import { OptionsTabs } from '@/components/molecules/OptionsTabs';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { Trackers } from '@/lib/data/Trackers.ts';

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
    ['sortLatestFetchedChapter', 'library.option.sort.label.by_latest_fetched_chapter'],
    ['sortLatestUploadedChapter', 'library.option.sort.label.by_latest_uploaded_chapter'],
];

interface IProps {
    open: boolean;
    onClose: () => void;
}

export const LibraryOptionsPanel: React.FC<IProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const { options, setOptions } = useLibraryOptionsContext();

    const trackerList = requestManager.useGetTrackerList();
    const loggedInTrackers = Trackers.getLoggedIn(trackerList.data?.trackers.nodes ?? []);

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
                            <ThreeStateCheckboxInput
                                label={t('global.filter.label.bookmarked')}
                                checked={options.bookmarked}
                                onChange={(c) => handleFilterChange('bookmarked', c)}
                            />
                            <FormLabel sx={{ mt: 2 }}>{t('global.filter.label.tracked')}</FormLabel>
                            {loggedInTrackers.map((tracker) => (
                                <ThreeStateCheckboxInput
                                    key={tracker.id}
                                    label={tracker.name}
                                    checked={options.tracker[tracker.id]}
                                    onChange={(checked) =>
                                        handleFilterChange('tracker', { ...options.tracker, [tracker.id]: checked })
                                    }
                                />
                            ))}
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
                    const { gridLayout, showContinueReadingButton, showDownloadBadge, showUnreadBadge, showTabSize } =
                        options;
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
                                checked={showUnreadBadge}
                                onChange={() => handleFilterChange('showUnreadBadge', !showUnreadBadge)}
                            />
                            <CheckboxInput
                                label={t('library.option.display.badge.label.download_badges')}
                                checked={showDownloadBadge}
                                onChange={() => handleFilterChange('showDownloadBadge', !showDownloadBadge)}
                            />

                            <FormLabel sx={{ mt: 2 }}>{t('library.option.display.tab.title')}</FormLabel>
                            <CheckboxInput
                                label={t('library.option.display.tab.label.show_number_of_items')}
                                checked={showTabSize}
                                onChange={() => handleFilterChange('showTabSize', !showTabSize)}
                            />

                            <FormLabel sx={{ mt: 2 }}>{t('global.label.other')}</FormLabel>
                            <CheckboxInput
                                label={t('library.option.display.other.label.show_continue_reading_button')}
                                checked={showContinueReadingButton}
                                onChange={() =>
                                    handleFilterChange('showContinueReadingButton', !showContinueReadingButton)
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
