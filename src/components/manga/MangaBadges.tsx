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

const BadgeContainer = styled('div')({
    display: 'flex',
    height: 'fit-content',
    borderRadius: '5px',
    overflow: 'hidden',
    '& p': {
        color: 'white',
        padding: '0.1em',
        paddingInline: '0.2em',
        fontSize: '1.05rem',
    },
});

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

    const {
        options: { showUnreadBadge, showDownloadBadge },
    } = useLibraryOptionsContext();

    return (
        <BadgeContainer>
            {inLibraryIndicator && mode === 'source' && (
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
            {showUnreadBadge && (unread ?? 0) > 0 && (
                <Typography sx={{ backgroundColor: 'primary.dark' }}>{unread}</Typography>
            )}
            {showDownloadBadge && (downloadCount ?? 0) > 0 && (
                <Typography
                    sx={{
                        backgroundColor: 'success.dark',
                    }}
                >
                    {downloadCount}
                </Typography>
            )}
        </BadgeContainer>
    );
};
