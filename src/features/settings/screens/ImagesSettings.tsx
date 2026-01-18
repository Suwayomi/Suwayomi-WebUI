/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';
import { useLingui } from '@lingui/react/macro';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { ListItemLink } from '@/base/components/lists/ListItemLink.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ImageCache } from '@/lib/service-worker/ImageCache.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';

export const ImagesSettings = () => {
    const { t } = useLingui();

    useAppTitle(t`Images`);

    const [triggerClearServerCache, { loading: isClearingServerCache }] = requestManager.useClearServerCache();

    const clearCache = async () => {
        try {
            await Promise.all([triggerClearServerCache(), ImageCache.clearAll()]);
            makeToast(t`Cleared the cache`, 'success');
        } catch (e) {
            makeToast(t`Could not clear the cache`, 'error', getErrorMessage(e));
        }
    };

    return (
        <List sx={{ pt: 0 }}>
            <ListItemButton disabled={isClearingServerCache} onClick={clearCache}>
                <ListItemText
                    primary={t`Clear cache`}
                    secondary={t`The cache of the client (browser, electron) should get cleared alongside it, otherwise, the client cache will keep getting used`}
                />
            </ListItemButton>
            <List
                subheader={
                    <ListSubheader component="div" id="image-processing-settings">
                        {t`Image processing`}
                    </ListSubheader>
                }
            >
                <ListItemLink to={AppRoutes.settings.childRoutes.images.childRoutes.processingDownloads.path}>
                    <ListItemText primary={t`Image download processing`} />
                </ListItemLink>
                <ListItemLink to={AppRoutes.settings.childRoutes.images.childRoutes.processingServe.path}>
                    <ListItemText primary={t`Image serve processing`} />
                </ListItemLink>
            </List>
        </List>
    );
};
