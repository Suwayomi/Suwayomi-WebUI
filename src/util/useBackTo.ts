/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useNavBarContext } from 'components/context/NavbarContext';
import { useLocation } from 'react-router-dom';

export const BACK = '__BACK__';

const useBackTo = (): { url?: string; back: boolean } => {
    const location = useLocation<{ backLink?: string }>();
    const { defaultBackTo } = useNavBarContext();

    const url = location.state?.backLink ?? defaultBackTo;
    return {
        url: url === BACK ? undefined : url,
        back: url === BACK,
    };
};

export default useBackTo;
