/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import {
    SelectSetting,
    SelectSettingValue,
    SelectSettingValueDisplayInfo,
} from '@/base/components/settings/SelectSetting.tsx';

const CHAPTERS_TO_DELETE = [0, 1, 2, 3, 4, 5] as const;
const CHAPTERS_TO_DELETE_TO_TRANSLATION: {
    [flavor in (typeof CHAPTERS_TO_DELETE)[number]]: SelectSettingValueDisplayInfo;
} = {
    0: {
        text: msg`Disabled`,
    },
    1: {
        text: msg`Last read chapter`,
    },
    2: {
        text: msg`Second to last read chapter`,
    },
    3: {
        text: msg`Third to last read chapter`,
    },
    4: {
        text: msg`Fourth to last read chapter`,
    },
    5: {
        text: msg`Fifth to last read chapter`,
    },
};
const CHAPTERS_TO_DELETE_SELECT_VALUES: SelectSettingValue<(typeof CHAPTERS_TO_DELETE)[number]>[] =
    CHAPTERS_TO_DELETE.map((chapterToDelete) => [chapterToDelete, CHAPTERS_TO_DELETE_TO_TRANSLATION[chapterToDelete]]);

const getNormalizedChapterToDelete = (chapterToDelete: number | boolean) => {
    const isMigrationVersion0 = typeof chapterToDelete === 'boolean';
    if (isMigrationVersion0) {
        return Number(chapterToDelete);
    }

    return chapterToDelete;
};

export const DeleteChaptersWhileReadingSetting = ({
    chapterToDelete,
    handleChange,
}: {
    chapterToDelete: number;
    handleChange: (chapterToDelete: number) => void;
}) => {
    const { t } = useLingui();

    const normalizedChapterToDelete = getNormalizedChapterToDelete(chapterToDelete);

    return (
        <SelectSetting
            settingName={t`Delete finished chapters while reading`}
            value={normalizedChapterToDelete}
            values={CHAPTERS_TO_DELETE_SELECT_VALUES}
            handleChange={handleChange}
        />
    );
};
