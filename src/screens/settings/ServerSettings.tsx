/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useContext, useEffect } from 'react';
import { List } from '@mui/material';
import { NavBarContext, useSetDefaultBackTo } from '@/components/context/NavbarContext.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { useLocalStorage } from '@/util/useLocalStorage.tsx';
import { TextSetting } from '@/components/settings/TextSetting.tsx';

export const ServerSettings = () => {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);

    useSetDefaultBackTo('settings');

    useEffect(() => {
        setTitle(t('download.settings.title'));
        setAction(null);
    }, [t]);

    const [serverAddress, setServerAddress] = useLocalStorage<string>('serverBaseURL', '');

    const handleChange = (address: string) => {
        const serverBaseUrl = address.replaceAll(/(\/)+$/g, '');
        setServerAddress(serverBaseUrl);
        requestManager.updateClient({ baseURL: serverBaseUrl });
    };

    return (
        <List>
            <TextSetting
                settingName={t('settings.about.label.server_address')}
                handleChange={handleChange}
                value={serverAddress}
            />
        </List>
    );
};
