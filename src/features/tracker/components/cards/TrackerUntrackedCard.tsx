/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { CARD_STYLING } from '@/features/tracker/Tracker.constants.ts';

import { TTrackerBase } from '@/features/tracker/Tracker.types.ts';

export const TrackerUntrackedCard = ({
    tracker,
    onClick,
}: {
    tracker: Pick<TTrackerBase, 'name' | 'icon'>;
    onClick: () => void;
}) => {
    const { t } = useTranslation();

    return (
        <Card sx={CARD_STYLING}>
            <CardContent sx={{ padding: '0' }}>
                <Stack
                    direction="row"
                    sx={{
                        gap: 3,
                    }}
                >
                    <Avatar
                        alt={`${tracker.name}`}
                        src={requestManager.getValidImgUrlFor(tracker.icon)}
                        variant="rounded"
                        sx={{ width: 64, height: 64 }}
                    />
                    <Button sx={{ flexGrow: '1' }} onClick={onClick}>
                        {t('tracking.action.button.add_tracking')}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
};
