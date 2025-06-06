/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { IReaderSettings } from '@/modules/reader/types/Reader.types.ts';
import { ValueToDisplayData } from '@/modules/core/Core.types.ts';
import { ButtonSelectInput } from '@/modules/core/components/inputs/ButtonSelectInput.tsx';
import { ReaderScrollAmount } from '@/modules/reader/constants/ReaderSettings.constants.tsx';

const VALUE_TO_DISPLAY_DATA: ValueToDisplayData<ReaderScrollAmount> = {
    [ReaderScrollAmount.AS_MOUSEWHEEL]: {
        title: 'global.label.as_mousewheel',
        icon: null,
    },
    [ReaderScrollAmount.SMALL]: {
        title: 'global.label.small',
        icon: null,
    },
    [ReaderScrollAmount.MEDIUM]: {
        title: 'global.label.medium',
        icon: null,
    },
    [ReaderScrollAmount.LARGE]: {
        title: 'global.label.large',
        icon: null,
    },
};

const READER_SCROLL_AMOUNT_VALUES = Object.values(ReaderScrollAmount).filter((value) => typeof value === 'number');

export const ReaderSettingScrollAmount = ({
    scrollAmount,
    setScrollAmount,
}: Pick<IReaderSettings, 'scrollAmount'> & {
    setScrollAmount: (amount: ReaderScrollAmount) => void;
}) => {
    const { t } = useTranslation();

    return (
        <ButtonSelectInput
            label={t('reader.settings.scroll_amount')}
            value={scrollAmount}
            values={READER_SCROLL_AMOUNT_VALUES}
            setValue={setScrollAmount}
            valueToDisplayData={VALUE_TO_DISPLAY_DATA}
        />
    );
};
