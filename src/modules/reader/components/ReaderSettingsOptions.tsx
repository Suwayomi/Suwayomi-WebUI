/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import { useTranslation } from 'react-i18next';
import { AllowedMetadataValueTypes } from '@/typings.ts';
import { NumberSetting } from '@/modules/core/components/settings/NumberSetting.tsx';
import { isHorizontalReaderType } from '@/modules/reader/components/page/Page.tsx';
import { Select } from '@/modules/core/components/inputs/Select.tsx';
import { IReaderSettings } from '@/modules/reader/Reader.types.ts';

interface IProps extends IReaderSettings {
    setSettingValue: (key: keyof IReaderSettings, value: AllowedMetadataValueTypes, persist?: boolean) => void;
}

export function ReaderSettingsOptions({
    staticNav,
    loadNextOnEnding,
    readerType,
    showPageNumber,
    skipDupChapters,
    setSettingValue,
    fitPageToWindow,
    scalePage,
    offsetFirstPage,
    readerWidth,
}: IProps) {
    const { t } = useTranslation();
    const fitPageToWindowEligible = !isHorizontalReaderType(readerType);
    return (
        <List sx={{ pt: 0 }}>
            <ListItem>
                <ListItemText primary={t('reader.settings.label.static_navigation')} />
                <Switch
                    edge="end"
                    checked={staticNav}
                    onChange={(e) => setSettingValue('staticNav', e.target.checked)}
                />
            </ListItem>
            <ListItem>
                <ListItemText primary={t('reader.settings.label.show_page_number')} />
                <Switch
                    edge="end"
                    checked={showPageNumber}
                    onChange={(e) => setSettingValue('showPageNumber', e.target.checked)}
                />
            </ListItem>
            <ListItem>
                <ListItemText primary={t('reader.settings.label.load_next_chapter')} />
                <Switch
                    edge="end"
                    checked={loadNextOnEnding}
                    onChange={(e) => setSettingValue('loadNextOnEnding', e.target.checked)}
                />
            </ListItem>
            <ListItem>
                <ListItemText primary={t('reader.settings.label.skip_dup_chapters')} />
                <Switch
                    edge="end"
                    checked={skipDupChapters}
                    onChange={(e) => setSettingValue('skipDupChapters', e.target.checked)}
                />
            </ListItem>
            {fitPageToWindowEligible && (
                <ListItem>
                    <ListItemText primary={t('reader.settings.label.fit_page_to_window')} />
                    <Switch
                        edge="end"
                        checked={fitPageToWindow}
                        onChange={(e) => setSettingValue('fitPageToWindow', e.target.checked)}
                    />
                </ListItem>
            )}
            {fitPageToWindowEligible && fitPageToWindow && (
                <ListItem>
                    <ListItemText primary={t('reader.settings.label.scale_page')} />
                    <Switch
                        edge="end"
                        checked={scalePage}
                        onChange={(e) => setSettingValue('scalePage', e.target.checked)}
                    />
                </ListItem>
            )}
            {(readerType === 'DoubleLTR' || readerType === 'DoubleRTL') && (
                <ListItem>
                    <ListItemText primary={t('reader.settings.label.offset_first_page')} />
                    <Switch
                        edge="end"
                        checked={offsetFirstPage}
                        onChange={(e) => setSettingValue('offsetFirstPage', e.target.checked)}
                    />
                </ListItem>
            )}
            {fitPageToWindowEligible && !fitPageToWindow && (
                <NumberSetting
                    settingTitle={t('reader.settings.label.reader_width')}
                    settingValue={`${readerWidth}%`}
                    value={readerWidth}
                    minValue={10}
                    maxValue={100}
                    defaultValue={50}
                    valueUnit="%"
                    showSlider
                    handleUpdate={(width: number) => setSettingValue('readerWidth', width)}
                    handleLiveUpdate={(width: number) => setSettingValue('readerWidth', width, false)}
                    listItemTextSx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                />
            )}
            <ListItem>
                <ListItemText primary={t('reader.settings.label.reader_type')} />
                <Select
                    variant="standard"
                    value={readerType}
                    onChange={(e) => setSettingValue('readerType', e.target.value)}
                    sx={{ p: 0 }}
                >
                    <MenuItem value="SingleLTR">{t('reader.settings.reader_type.label.single_page_ltr')}</MenuItem>
                    <MenuItem value="SingleRTL">{t('reader.settings.reader_type.label.single_page_rtl')}</MenuItem>
                    {/* <MenuItem value="SingleVertical">
                                       Vertical(WIP)
                                    </MenuItem> */}
                    <MenuItem value="DoubleLTR">{t('reader.settings.reader_type.label.double_page_ltr')}</MenuItem>
                    <MenuItem value="DoubleRTL">{t('reader.settings.reader_type.label.double_page_rtl')}</MenuItem>
                    <MenuItem value="Webtoon">{t('reader.settings.reader_type.label.webtoon')}</MenuItem>
                    <MenuItem value="ContinuesVertical">
                        {t('reader.settings.reader_type.label.continuous_vertical')}
                    </MenuItem>
                    <MenuItem value="ContinuesHorizontalLTR">
                        {t('reader.settings.reader_type.label.continuous_horizontal_ltr')}
                    </MenuItem>
                    <MenuItem value="ContinuesHorizontalRTL">
                        {t('reader.settings.reader_type.label.continuous_horizontal_rtl')}
                    </MenuItem>
                </Select>
            </ListItem>
        </List>
    );
}
