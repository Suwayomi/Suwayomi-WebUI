/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import DisabledByDefaultRounded from '@mui/icons-material/DisabledByDefaultRounded';
import { useLingui } from '@lingui/react/macro';
import { CheckboxListSetting } from '@/base/components/settings/CheckboxListSetting.tsx';
import { updateChapterListOptions } from '@/features/chapter/utils/ChapterList.util.tsx';
import { CheckboxInput } from '@/base/components/inputs/CheckboxInput.tsx';

export const ChapterExcludeSanlatorsFilter = ({
    updateOption,
    scanlators,
    excludedScanlators,
}: {
    updateOption: ReturnType<typeof updateChapterListOptions>;
    scanlators: string[];
    excludedScanlators: string[];
}) => {
    const { t } = useLingui();
    const popupState = usePopupState({ variant: 'dialog', popupId: 'chapter-list-options-scanlator-filter-dialog' });

    if (!scanlators.length) {
        return null;
    }

    return (
        <>
            <CheckboxInput
                {...bindTrigger(popupState)}
                label={t`Scanlator`}
                icon={<PeopleAltOutlinedIcon />}
                checkedIcon={<PeopleAltOutlinedIcon color="warning" />}
                checked={!!excludedScanlators.length}
            />
            <CheckboxListSetting
                title={t`Exclude scanlators`}
                open={popupState.isOpen}
                onClose={(selectedScanlators) => {
                    if (selectedScanlators) {
                        updateOption('excludedScanlators', selectedScanlators);
                    }
                    popupState.close();
                }}
                items={scanlators}
                getId={(scanlator) => scanlator}
                getLabel={(scanlator) => scanlator}
                isChecked={(scanlator) => excludedScanlators.includes(scanlator)}
                slotProps={{
                    checkbox: {
                        checkedIcon: <DisabledByDefaultRounded />,
                    },
                }}
            />
        </>
    );
};
