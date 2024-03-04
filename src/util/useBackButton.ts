/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { useHistory } from '@/util/useHistory.ts';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';

export const useBackButton = () => {
    const navigate = useNavigate();
    const history = useHistory();
    const location = useLocation();
    const { defaultBackTo: backToUrl } = useContext(NavBarContext);

    return () => {
        const isHistoryEmpty = !history.length;
        const isLastPageInHistoryCurrentPage = history.length === 1 && history[0] === location.pathname;

        const canNavigateBack = !isHistoryEmpty && !isLastPageInHistoryCurrentPage;
        if (canNavigateBack) {
            navigate(-1);
            return;
        }

        if (backToUrl) {
            navigate(backToUrl);
            return;
        }

        navigate('/library');
    };
};
