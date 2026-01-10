/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { IReaderSettings, ReaderScrollAmount } from '@/features/reader/Reader.types.ts';
import { ValueToDisplayData } from '@/base/Base.types.ts';
import { ButtonSelectInput } from '@/base/components/inputs/ButtonSelectInput.tsx';
import { SliderInput } from '@/base/components/inputs/SliderInput.tsx';
import { DEFAULT_READER_SETTINGS, SCROLL_AMOUNT } from '@/features/reader/settings/ReaderSettings.constants.tsx';

const VALUE_TO_DISPLAY_DATA: ValueToDisplayData<ReaderScrollAmount> = {
    [ReaderScrollAmount.TINY]: {
        title: msg`Tiny`,
        icon: null,
    },
    [ReaderScrollAmount.SMALL]: {
        title: msg`Small`,
        icon: null,
    },
    [ReaderScrollAmount.MEDIUM]: {
        title: msg`Medium`,
        icon: null,
    },
    [ReaderScrollAmount.LARGE]: {
        title: msg`Large`,
        icon: null,
    },
};

const READER_SCROLL_AMOUNT_VALUES = Object.values(ReaderScrollAmount).filter((value) => typeof value === 'number');

export const ReaderSettingScrollAmount = ({
    scrollAmount,
    setScrollAmount,
}: Pick<IReaderSettings, 'scrollAmount'> & {
    setScrollAmount: (amount: ReaderScrollAmount, commit: boolean) => void;
}) => {
    const { t } = useLingui();

    return (
        <>
            <ButtonSelectInput
                label={t`Scroll amount`}
                value={scrollAmount}
                values={READER_SCROLL_AMOUNT_VALUES}
                setValue={(value) => setScrollAmount(value as number, true)}
                valueToDisplayData={VALUE_TO_DISPLAY_DATA}
            />
            <SliderInput
                label={t`Custom scroll amount`}
                value={`${scrollAmount}%`}
                onDefault={() => setScrollAmount(DEFAULT_READER_SETTINGS.scrollAmount, true)}
                slotProps={{
                    slider: {
                        defaultValue: DEFAULT_READER_SETTINGS.scrollAmount,
                        value: scrollAmount,
                        ...SCROLL_AMOUNT,
                        onChange: (_, value) => {
                            setScrollAmount(value as number, false);
                        },
                        onChangeCommitted: (_, value) => {
                            setScrollAmount(value as number, true);
                        },
                    },
                }}
            />
        </>
    );
};
