/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import { CheckboxInput } from '@/base/components/inputs/CheckboxInput.tsx';
import { IReaderSettings } from '@/features/reader/Reader.types.ts';
import { SliderInput } from '@/base/components/inputs/SliderInput.tsx';
import { AUTO_SCROLL_SPEED, DEFAULT_READER_SETTINGS } from '@/features/reader/settings/ReaderSettings.constants.tsx';

export const ReaderSettingAutoScroll = ({
    autoScroll,
    setAutoScroll,
}: Pick<IReaderSettings, 'autoScroll'> & {
    setAutoScroll: (updatedAutoScroll: IReaderSettings['autoScroll'], commit: boolean) => void;
}) => {
    const { t } = useLingui();

    return (
        <>
            <CheckboxInput
                label={t`Smooth auto scrolling`}
                checked={autoScroll.smooth}
                onChange={(_, checked) => setAutoScroll({ ...autoScroll, smooth: checked }, true)}
            />
            <SliderInput
                label={t`Auto scroll speed`}
                value={plural(autoScroll.value, {
                    one: '# second',
                    other: '# seconds',
                })}
                onDefault={() =>
                    setAutoScroll({ ...autoScroll, value: DEFAULT_READER_SETTINGS.autoScroll.value }, true)
                }
                slotProps={{
                    slider: {
                        defaultValue: DEFAULT_READER_SETTINGS.customFilter.saturate.value,
                        value: autoScroll.value,
                        ...AUTO_SCROLL_SPEED,
                        onChange: (_, value) => {
                            setAutoScroll({ ...autoScroll, value: value as number }, false);
                        },
                        onChangeCommitted: (_, value) => {
                            setAutoScroll({ ...autoScroll, value: value as number }, true);
                        },
                    },
                }}
            />
        </>
    );
};
