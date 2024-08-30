/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useLibraryOptionsContext } from '@/components/context/LibraryOptionsContext.tsx';
import { MangaCardMode } from '@/components/manga/MangaCard.types.tsx';
import { MediaQuery } from '@/lib/ui/MediaQuery.tsx';

const BadgeContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    height: 'fit-content',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
}));

const Badge = styled(Typography)(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    paddingInline: theme.spacing(0.3),
}));

export const MangaBadges = ({
    inLibraryIndicator,
    updateLibraryState,
    isInLibrary,
    unread,
    downloadCount,
    mode,
}: {
    inLibraryIndicator?: boolean;
    updateLibraryState: () => void;
    isInLibrary: boolean;
    unread?: number;
    downloadCount?: number;
    mode: MangaCardMode;
}) => {
    const { t } = useTranslation();

    const isTouchDevice = MediaQuery.useIsTouchDevice();

    const {
        options: { showUnreadBadge, showDownloadBadge },
    } = useLibraryOptionsContext();

    return (
        <BadgeContainer>
            {!isTouchDevice && inLibraryIndicator && mode === 'source' && (
                <Button
                    className="source-manga-library-state-button"
                    component="div"
                    variant="contained"
                    size="small"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateLibraryState();
                    }}
                    sx={{
                        display: 'none',
                    }}
                    color={isInLibrary ? 'error' : 'primary'}
                >
                    {t(isInLibrary ? 'manga.action.library.remove.label.action' : 'manga.button.add_to_library')}
                </Button>
            )}
            {inLibraryIndicator && isInLibrary && (
                <Typography className="source-manga-library-state-indicator" sx={{ backgroundColor: 'primary.dark' }}>
                    {t('manga.button.in_library')}
                </Typography>
            )}
            {((showUnreadBadge && mode === 'default') || mode === 'duplicate') && (unread ?? 0) > 0 && (
                <Badge sx={{ backgroundColor: 'primary.dark' }}>{unread}</Badge>
            )}
            {((showDownloadBadge && mode === 'default') || mode === 'duplicate') && (downloadCount ?? 0) > 0 && (
                <Badge
                    sx={{
                        backgroundColor: 'primary.light',
                    }}
                >
                    {downloadCount}
                </Badge>
            )}
        </BadgeContainer>
    );
};
