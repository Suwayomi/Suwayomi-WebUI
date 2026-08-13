/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import DragHandle from '@mui/icons-material/DragHandle';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import IconButton from '@mui/material/IconButton';
import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { ChapterDownloadRetryButton } from '@/features/chapter/components/buttons/ChapterDownloadRetryButton.tsx';
import { DownloadStateIndicatorCircular } from '@/base/components/downloads/DownloadStateIndicatorCircular.tsx';
import { ChapterCardMetadata } from '@/features/chapter/components/cards/ChapterCardMetadata.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { ListCardContent } from '@/base/components/lists/cards/ListCardContent.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import type { ChapterDownloadStatus } from '@/features/chapter/Chapter.types.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';

interface ActionProps {
    reorderDownloads: (download: ChapterDownloadStatus, mode: 'top' | 'bottom', series?: boolean) => void;
    cancelDownloads: (download: ChapterDownloadStatus, series?: boolean) => void;
}

const ActionMenu = ({
    open,
    download,
    reorderDownloads,
    cancelDownloads,
    anchorEl,
}: {
    open: boolean;
    download: ChapterDownloadStatus;
    anchorEl: Element | null;
} & ActionProps) => {
    const { t } = useLingui();

    return (
        <Menu open={open} anchorEl={anchorEl}>
            <MenuItem onClick={() => reorderDownloads(download, 'top')}>{t`Move to top`}</MenuItem>
            <MenuItem onClick={() => reorderDownloads(download, 'top', true)}>{t`Move series to top`}</MenuItem>
            <MenuItem onClick={() => reorderDownloads(download, 'bottom')}>{t`Move to bottom`}</MenuItem>
            <MenuItem onClick={() => reorderDownloads(download, 'bottom', true)}>{t`Move series to bottom`}</MenuItem>
            <MenuItem onClick={() => cancelDownloads(download)}>{t`Cancel`}</MenuItem>
            <MenuItem onClick={() => cancelDownloads(download, true)}>{t`Cancel all for this series`}</MenuItem>
        </Menu>
    );
};

export const DownloadQueueChapterCard = memo(
    ({ item, reorderDownloads, cancelDownloads }: { item: ChapterDownloadStatus } & ActionProps) => {
        const { t } = useLingui();
        const preventMobileContextMenu = MediaQuery.usePreventMobileContextMenu();

        const [anchorEl, setAnchorEl] = useState<Element | null>(null);

        const [actionMenuOpen, setActionMenuOpen] = useState(false);

        return (
            <Card>
                <CardActionArea
                    component={Link}
                    to={AppRoutes.manga.path(item.manga.id)}
                    onContextMenu={preventMobileContextMenu}
                    sx={MediaQuery.preventMobileContextMenuSx()}
                >
                    <ListCardContent>
                        <IconButton {...MUIUtil.preventRippleProp()} sx={{ pointerEvents: 'none' }}>
                            <DragHandle />
                        </IconButton>
                        <ChapterCardMetadata
                            title={item.manga.title}
                            secondaryText={item.chapter.scanlator}
                            ternaryText={item.chapter.name}
                        />
                        <DownloadStateIndicatorCircular chapterId={item.chapter.id} />
                        <ChapterDownloadRetryButton chapterId={item.chapter.id} />
                        <CustomTooltip title={t`Delete`}>
                            <IconButton
                                ref={setAnchorEl}
                                {...MUIUtil.preventRippleProp()}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActionMenuOpen(!actionMenuOpen);
                                }}
                            >
                                <MoreVertIcon />
                                <ActionMenu
                                    open={actionMenuOpen}
                                    download={item}
                                    reorderDownloads={reorderDownloads}
                                    cancelDownloads={cancelDownloads}
                                    anchorEl={anchorEl}
                                />
                            </IconButton>
                        </CustomTooltip>
                    </ListCardContent>
                </CardActionArea>
            </Card>
        );
    },
);
