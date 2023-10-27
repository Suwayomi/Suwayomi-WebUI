/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useContext, useEffect } from 'react';
import { NavBarContext, useSetDefaultBackTo } from '@/components/context/NavbarContext.tsx';
import { GlobalUpdateSettings } from '@/components/settings/globalUpdate/GlobalUpdateSettings.tsx';
import { SearchSettings } from '@/screens/settings/SearchSettings.tsx';

export function LibrarySettings() {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);

    useEffect(() => {
        setTitle(t('library.settings.title'));
        setAction(null);
    }, [t]);

    useSetDefaultBackTo('settings');

    return (
        <>
            <SearchSettings />
            <GlobalUpdateSettings />
        </>
    );
}
