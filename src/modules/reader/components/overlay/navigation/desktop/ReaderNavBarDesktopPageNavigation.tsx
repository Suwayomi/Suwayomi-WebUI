/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import { useMemo } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { Select } from '@/modules/core/components/inputs/Select.tsx';
import { getPage } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { ReaderControls } from '@/modules/reader/services/ReaderControls.ts';
import { useGetOptionForDirection } from '@/theme.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { ReaderNavBarDesktopNextPreviousButton } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktopNextPreviousButton.tsx';
import { READING_DIRECTION_TO_THEME_DIRECTION } from '@/modules/reader/constants/ReaderSettings.constants.tsx';

export const ReaderNavBarDesktopPageNavigation = ({
    currentPageIndex,
    setPageToScrollToIndex,
    pages,
}: Pick<ReaderStatePages, 'currentPageIndex' | 'setPageToScrollToIndex' | 'pages'>) => {
    const { t } = useTranslation();
    const openPage = ReaderControls.useOpenPage();
    const { readingDirection } = ReaderService.useSettings();
    const getOptionForDirection = useGetOptionForDirection();
    const currentPage = useMemo(() => getPage(currentPageIndex, pages), [currentPageIndex, pages]);

    const direction = READING_DIRECTION_TO_THEME_DIRECTION[readingDirection.value];

    return (
        <Stack sx={{ flexDirection: 'row', gap: 1 }} dir="ltr">
            <ReaderNavBarDesktopNextPreviousButton
                type="previous"
                title={t(getOptionForDirection('reader.button.previous_page', 'reader.button.next_page', direction))}
                disabled={getOptionForDirection(
                    !currentPageIndex,
                    currentPage.primary.index === pages.slice(-1)[0].primary.index,
                    direction,
                )}
                onClick={() => openPage('previous')}
            />
            <FormControl sx={{ flexBasis: '70%', flexGrow: 0, flexShrink: 0 }}>
                <InputLabel id="reader-nav-bar-desktop-page-select">{t('reader.page_info.label.page')}</InputLabel>
                <Select
                    labelId="reader-nav-bar-desktop-page-select"
                    label={t('reader.page_info.label.page')}
                    value={currentPage.primary.index}
                    onChange={(e) => setPageToScrollToIndex(e.target.value as number)}
                >
                    {pages.map(({ primary: { index }, name }) => (
                        <MenuItem key={index} value={index}>
                            {name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <ReaderNavBarDesktopNextPreviousButton
                type="next"
                title={t(getOptionForDirection('reader.button.next_page', 'reader.button.previous_page', direction))}
                disabled={getOptionForDirection(
                    currentPage.primary.index === pages.slice(-1)[0].primary.index,
                    !currentPageIndex,
                    direction,
                )}
                onClick={() => openPage('next')}
            />
        </Stack>
    );
};
