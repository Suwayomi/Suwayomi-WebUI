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
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import Menu from '@mui/material/Menu';
import DownloadIcon from '@mui/icons-material/Download';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { ChapterOptions } from '@/modules/chapter/components/ChapterOptions.tsx';
import { isFilterActive, updateChapterListOptions } from '@/modules/chapter/utils/ChapterList.util.tsx';
import {
    ChapterBookmarkInfo,
    ChapterDownloadInfo,
    ChapterIdInfo,
    ChapterListOptions,
} from '@/modules/chapter/Chapter.types.ts';
import { ChaptersDownloadActionMenuItems } from '@/modules/chapter/components/actions/ChaptersDownloadActionMenuItems.tsx';
import { Chapters } from '@/modules/chapter/services/Chapters.ts';

interface IProps {
    mangaId: number;
    areAllChaptersRead: boolean;
    areAllChaptersDownloaded: boolean;
    options: ChapterListOptions;
    updateOption: ReturnType<typeof updateChapterListOptions>;
    unreadChapters: (ChapterIdInfo & ChapterDownloadInfo & ChapterBookmarkInfo)[];
    scanlators: string[];
    excludeScanlators: string[];
}

export const ChaptersToolbarMenu = ({
    mangaId,
    areAllChaptersRead,
    areAllChaptersDownloaded,
    options,
    updateOption,
    unreadChapters,
    scanlators,
    excludeScanlators,
}: IProps) => {
    const { t } = useTranslation();

    const [open, setOpen] = React.useState(false);
    const isFiltered = isFilterActive(options);

    return (
        <>
            <CustomTooltip
                title={t('chapter.action.mark_as_read.add.label.action.current')}
                disabled={areAllChaptersRead}
            >
                <IconButton
                    disabled={areAllChaptersRead}
                    onClick={() => Chapters.markAsRead(unreadChapters, true, mangaId)}
                    color="inherit"
                >
                    <DoneAllIcon />
                </IconButton>
            </CustomTooltip>
            <PopupState variant="popover" popupId="chapterlist-download-button">
                {(popupState) => (
                    <>
                        <CustomTooltip
                            title={t('chapter.action.download.add.label.action')}
                            disabled={areAllChaptersRead}
                        >
                            <IconButton
                                disabled={areAllChaptersDownloaded}
                                {...bindTrigger(popupState)}
                                color="inherit"
                            >
                                <DownloadIcon />
                            </IconButton>
                        </CustomTooltip>
                        {popupState.isOpen && (
                            <Menu {...bindMenu(popupState)}>
                                <ChaptersDownloadActionMenuItems mangaIds={[mangaId]} closeMenu={popupState.close} />
                            </Menu>
                        )}
                    </>
                )}
            </PopupState>
            <CustomTooltip title={t('settings.title')}>
                <IconButton onClick={() => setOpen(true)} color="inherit">
                    <FilterList color={isFiltered ? 'warning' : undefined} />
                </IconButton>
            </CustomTooltip>
            <ChapterOptions
                open={open}
                onClose={() => setOpen(false)}
                options={options}
                updateOption={updateOption}
                scanlators={scanlators}
                excludedScanlators={excludeScanlators}
            />
        </>
    );
};
