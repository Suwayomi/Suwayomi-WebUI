/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { Maybe } from '@/lib/graphql/generated/graphql.ts';
import { addStableIdToKeyValueItems, isDuplicateKeyValueItem } from '@/features/settings/ImageProcessing.utils.ts';
import { KeyValueItem } from '@/features/settings/components/images/KeyValueItem.tsx';
import { TSettingsDownloadConversionKeyValueItem } from '@/features/settings/Settings.types.ts';

export const KeyValueItems = ({
    title,
    open,
    items,
    onChange,
}: {
    title: string;
    open: boolean;
    items: Maybe<TSettingsDownloadConversionKeyValueItem[] | undefined>;
    onChange: (items: Maybe<TSettingsDownloadConversionKeyValueItem[]>) => void;
}) => {
    const { t } = useTranslation();

    return (
        <Collapse in={open}>
            <Stack sx={{ justifyContent: 'start', gap: 2, pt: 2 }}>
                <Typography>{title}</Typography>
                {items?.map((header, index) => (
                    <KeyValueItem
                        key={header.id}
                        {...header}
                        isDuplicate={isDuplicateKeyValueItem(header.name, index, items)}
                        onChange={(updatedHeader) => {
                            const isDeletion = updatedHeader == null;
                            if (isDeletion) {
                                onChange(items?.toSpliced(index, 1));
                                return;
                            }

                            onChange((items ?? []).toSpliced(index, 1, updatedHeader));
                        }}
                    />
                ))}
                <Button
                    onClick={() =>
                        onChange([...(items ?? []), ...addStableIdToKeyValueItems([{ name: '', value: '' }])])
                    }
                    variant="contained"
                    sx={{ width: 'fit-content' }}
                >
                    {t('global.button.add')}
                </Button>
            </Stack>
        </Collapse>
    );
};
