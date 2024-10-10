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
import { ReaderNavBarDesktopProps } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { Select } from '@/modules/core/components/inputs/Select.tsx';
import { getNextPageIndex, getPage } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';
import { ReaderNavBarDesktopPreviousButton } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktopPreviousButton.tsx';
import { ReaderNavBarDesktopNextButton } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktopNextButton.tsx';

export const ReaderNavBarDesktopPageNavigation = ({
    currentPageIndex,
    setCurrentPageIndex,
    pages,
}: Pick<ReaderNavBarDesktopProps, 'currentPageIndex' | 'setCurrentPageIndex' | 'pages'>) => {
    const { t } = useTranslation();

    const currentPage = useMemo(() => getPage(currentPageIndex, pages), [currentPageIndex, pages]);

    return (
        <Stack sx={{ flexDirection: 'row', gap: 1 }}>
            <ReaderNavBarDesktopPreviousButton
                title={t('reader.button.previous_page')}
                disabled={!currentPageIndex}
                onClick={() => setCurrentPageIndex(getNextPageIndex('previous', currentPage[2], pages))}
            />
            <FormControl sx={{ flexBasis: '70%', flexGrow: 0, flexShrink: 0 }}>
                <InputLabel id="reader-nav-bar-desktop-page-select">{t('reader.page_info.label.page')}</InputLabel>
                <Select
                    labelId="reader-nav-bar-desktop-page-select"
                    label={t('reader.page_info.label.page')}
                    value={currentPage[0][0]}
                    onChange={(e) => setCurrentPageIndex(e.target.value as number)}
                >
                    {pages.map(([[pageIndex], pageName]) => (
                        <MenuItem key={pageIndex} value={pageIndex}>
                            {pageName}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <ReaderNavBarDesktopNextButton
                title={t('reader.button.next_page')}
                disabled={currentPage[0][0] === pages.slice(-1)[0][0][0]}
                onClick={() => setCurrentPageIndex(getNextPageIndex('next', currentPage[2], pages))}
            />
        </Stack>
    );
};
