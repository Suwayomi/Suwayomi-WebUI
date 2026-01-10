/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import { TextSetting } from '@/base/components/settings/text/TextSetting.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';

export const ServerAddressSetting = () => {
    const { t } = useLingui();

    const [serverAddress, setServerAddress] = requestManager.useBaseUrl();

    const handleServerAddressChange = (address: string) => {
        const serverBaseUrl = address.replaceAll(/(\/)+$/g, '');
        setServerAddress(serverBaseUrl);
        requestManager.reset();
    };

    return (
        <TextSetting
            settingName={t`Server address`}
            handleChange={handleServerAddressChange}
            value={serverAddress}
            placeholder="http://localhost:4567"
        />
    );
};
