/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { useAppPageHistoryContext } from '@/base/contexts/AppPageHistoryContext.tsx';

const PAGES_TO_IGNORE: readonly RegExp[] = [/\/manga\/[0-9]+\/chapter\/[0-9]+/g];

export const useBackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const history = useAppPageHistoryContext();

    return useCallback(() => {
        const isHistoryEmpty = !history.length;
        const isLastPageInHistoryCurrentPage = history.length === 1 && history[0] === location.pathname;
        const ignorePreviousPage = history.length && PAGES_TO_IGNORE.some((page) => !!history.slice(-2)[0].match(page));

        const canNavigateBack = !ignorePreviousPage && !isHistoryEmpty && !isLastPageInHistoryCurrentPage;
        if (canNavigateBack) {
            navigate(-1);
            return;
        }

        navigate(AppRoutes.library.path());
    }, [history, location.pathname]);
};
