/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import { Migration } from '@/features/migration/screens/Migration.tsx';
import { useAppTitleAndAction } from '@/features/navigation-bar/hooks/useAppTitleAndAction.ts';

export const MigrationSelectSource = () => {
    const { t } = useLingui();

    useAppTitleAndAction(t`Migrate`, undefined, []);

    return <Migration tabsMenuHeight={0} />;
};
