/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MessageDescriptor } from '@lingui/core';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { CheckboxInput } from '@/base/components/inputs/CheckboxInput.tsx';
import { RadioInput } from '@/base/components/inputs/RadioInput.tsx';
import { SortRadioInput } from '@/base/components/inputs/SortRadioInput.tsx';
import { ThreeStateCheckboxInput } from '@/base/components/inputs/ThreeStateCheckboxInput.tsx';
import { OptionsTabs } from '@/base/components/modals/OptionsTabs.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { Trackers } from '@/features/tracker/services/Trackers.ts';
import { GetTrackersSettingsQuery, MangaStatus } from '@/lib/graphql/generated/graphql.ts';
import { GET_TRACKERS_SETTINGS } from '@/lib/graphql/tracker/TrackerQuery.ts';
import { createUpdateCategoryMetadata, useGetCategoryMetadata } from '@/features/category/services/CategoryMetadata.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import {
    createUpdateMetadataServerSettings,
    updateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/features/settings/services/ServerSettingsMetadata.ts';
import { LibrarySortMode } from '@/features/library/Library.types.ts';
import { CategoryMetadataInfo } from '@/features/category/Category.types.ts';
import { MANGA_STATUS_TO_TRANSLATION } from '@/features/manga/Manga.constants.ts';
import { GridLayout } from '@/base/Base.types';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';

const TITLES: { [key in 'filter' | 'sort' | 'display']: MessageDescriptor } = {
    filter: msg`Filter`,
    sort: msg`Sort`,
    display: msg`Display`,
};

const SORT_OPTIONS: [LibrarySortMode, MessageDescriptor][] = [
    ['unreadChapters', msg`Unread chapters`],
    ['totalChapters', msg`Total chapters`],
    ['alphabetically', msg`A-Z`],
    ['dateAdded', msg`Recently added`],
    ['lastRead', msg`Recently read`],
    ['latestFetchedChapter', msg`Latest fetched chapter`],
    ['latestUploadedChapter', msg`Latest uploaded chapter`],
];

export const LibraryOptionsPanel = ({
    category,
    open,
    onClose,
}: {
    category: CategoryMetadataInfo;
    open: boolean;
    onClose: () => void;
}) => {
    const { t } = useLingui();

    const trackerList = requestManager.useGetTrackerList<GetTrackersSettingsQuery>(GET_TRACKERS_SETTINGS);
    const loggedInTrackers = Trackers.getLoggedIn(trackerList.data?.trackers.nodes ?? []);

    const categoryLibraryOptions = useGetCategoryMetadata(category);
    const updateCategoryLibraryOptions = createUpdateCategoryMetadata(category, (e) =>
        makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
    );

    const {
        settings: { showTabSize, showContinueReadingButton, showDownloadBadge, showUnreadBadge, gridLayout },
    } = useMetadataServerSettings();
    const setSettingValue = createUpdateMetadataServerSettings((e) =>
        makeToast(t`Could not save the default search settings to the server`, 'error', getErrorMessage(e)),
    );

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
                                label={t`Unread`}
                                checked={categoryLibraryOptions.hasUnreadChapters}
                                onChange={(c) => updateCategoryLibraryOptions('hasUnreadChapters', c)}
                            />
                            <ThreeStateCheckboxInput
                                label={t`Started`}
                                checked={categoryLibraryOptions.hasReadChapters}
                                onChange={(c) => updateCategoryLibraryOptions('hasReadChapters', c)}
                            />
                            <ThreeStateCheckboxInput
                                label={t`Downloaded`}
                                checked={categoryLibraryOptions.hasDownloadedChapters}
                                onChange={(c) => updateCategoryLibraryOptions('hasDownloadedChapters', c)}
                            />
                            <ThreeStateCheckboxInput
                                label={t`Bookmarked`}
                                checked={categoryLibraryOptions.hasBookmarkedChapters}
                                onChange={(c) => updateCategoryLibraryOptions('hasBookmarkedChapters', c)}
                            />
                            <ThreeStateCheckboxInput
                                label={t`Duplicate chapters`}
                                checked={categoryLibraryOptions.hasDuplicateChapters}
                                onChange={(c) => updateCategoryLibraryOptions('hasDuplicateChapters', c)}
                            />
                            <FormLabel sx={{ mt: 2 }}>{t`Status`}</FormLabel>
                            {Object.values(MangaStatus).map((status) => (
                                <ThreeStateCheckboxInput
                                    key={status}
                                    label={t(MANGA_STATUS_TO_TRANSLATION[status])}
                                    checked={categoryLibraryOptions.hasStatus[status]}
                                    onChange={(checked) =>
                                        updateCategoryLibraryOptions('hasStatus', {
                                            ...categoryLibraryOptions.hasStatus,
                                            [status]: checked,
                                        })
                                    }
                                />
                            ))}
                            <FormLabel sx={{ mt: 2 }}>{t`Tracked`}</FormLabel>
                            {loggedInTrackers.map((tracker) => (
                                <ThreeStateCheckboxInput
                                    key={tracker.id}
                                    label={tracker.name}
                                    checked={categoryLibraryOptions.hasTrackerBinding[tracker.id]}
                                    onChange={(checked) =>
                                        updateCategoryLibraryOptions('hasTrackerBinding', {
                                            ...categoryLibraryOptions.hasTrackerBinding,
                                            [tracker.id]: checked,
                                        })
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
                            checked={categoryLibraryOptions.sortBy === mode}
                            sortDescending={categoryLibraryOptions.sortDesc}
                            onClick={() =>
                                mode !== categoryLibraryOptions.sortBy
                                    ? updateCategoryLibraryOptions('sortBy', mode)
                                    : updateCategoryLibraryOptions('sortDesc', !categoryLibraryOptions.sortDesc)
                            }
                        />
                    ));
                }
                if (key === 'display') {
                    return (
                        <>
                            <FormLabel>{t`Display mode`}</FormLabel>
                            <RadioGroup
                                onChange={(e) => updateMetadataServerSettings('gridLayout', Number(e.target.value))}
                                value={gridLayout}
                            >
                                <RadioInput
                                    label={t`Compact grid`}
                                    value={GridLayout.Compact}
                                    checked={gridLayout == null || gridLayout === GridLayout.Compact}
                                />
                                <RadioInput
                                    label={t`Comfortable grid`}
                                    value={GridLayout.Comfortable}
                                    checked={gridLayout === GridLayout.Comfortable}
                                />
                                <RadioInput
                                    label={t`List`}
                                    value={GridLayout.List}
                                    checked={gridLayout === GridLayout.List}
                                />
                            </RadioGroup>
                            <FormLabel sx={{ mt: 2 }}>{t`Badges`}</FormLabel>
                            <CheckboxInput
                                label={t`Unread badges`}
                                checked={showUnreadBadge}
                                onChange={() => updateMetadataServerSettings('showUnreadBadge', !showUnreadBadge)}
                            />
                            <CheckboxInput
                                label={t`Download badges`}
                                checked={showDownloadBadge}
                                onChange={() => updateMetadataServerSettings('showDownloadBadge', !showDownloadBadge)}
                            />
                            <FormLabel sx={{ mt: 2 }}>{t`Tabs`}</FormLabel>
                            <CheckboxInput
                                label={t`Show number of items`}
                                checked={showTabSize}
                                onChange={() => setSettingValue('showTabSize', !showTabSize)}
                            />
                            <FormLabel sx={{ mt: 2 }}>{t`Other`}</FormLabel>
                            <CheckboxInput
                                label={t`Show continue reading button`}
                                checked={showContinueReadingButton}
                                onChange={() =>
                                    updateMetadataServerSettings(
                                        'showContinueReadingButton',
                                        !showContinueReadingButton,
                                    )
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
