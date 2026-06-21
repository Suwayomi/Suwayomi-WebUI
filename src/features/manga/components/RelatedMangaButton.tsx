/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import RecommendIcon from '@mui/icons-material/Recommend';
import PopupState, { bindDialog, bindTrigger } from 'material-ui-popup-state';
import Dialog from '@mui/material/Dialog';
import { useLingui } from '@lingui/react/macro';
import { FlexWrapButton } from '@/base/components/buttons/FlexWrapButton.tsx';
import { MangaRelated } from '@/features/tracker/components/MangaRelated.tsx';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import type { MangaIdInfo } from '@/features/manga/Manga.types.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';

export const RelatedMangaButton = ({ manga }: { manga: MangaIdInfo }) => {
    const { t } = useLingui();
    const isMobileWidth = MediaQuery.useIsMobileWidth();

    const {
        settings: { showRelatedForEachManga },
    } = useMetadataServerSettings();

    if (!showRelatedForEachManga) {
        return null;
    }

    return (
        <PopupState variant="dialog" popupId="manga-related-modal">
            {(popupState) => (
                <>
                    <FlexWrapButton
                        {...bindTrigger(popupState)}
                        size={isMobileWidth ? 'small' : 'medium'}
                        variant="outlined"
                    >
                        <RecommendIcon />
                        {t`Related`}
                    </FlexWrapButton>
                    {popupState.isOpen && (
                        <Dialog {...bindDialog(popupState)} maxWidth="md" fullWidth scroll="paper">
                            <MangaRelated manga={manga} />
                        </Dialog>
                    )}
                </>
            )}
        </PopupState>
    );
};
