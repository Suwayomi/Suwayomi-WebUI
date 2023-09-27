/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { List, ListItem, ListItemText, Switch } from '@mui/material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useTranslation } from 'react-i18next';
import { IReaderSettings } from '@/typings';

interface IProps extends IReaderSettings {
    setSettingValue: (key: keyof IReaderSettings, value: string | boolean) => void;
}

export default function ReaderSettingsOptions({
    staticNav,
    loadNextOnEnding,
    readerType,
    showPageNumber,
    skipDupChapters,
    setSettingValue,
    fitPageToWindow,
    offsetFirstPage,
}: IProps) {
    const { t } = useTranslation();
    const fitPageToWindowEligible = [
        'ContinuesVertical',
        'Webtoon',
        'SingleVertical',
        'SingleRTL',
        'SingleLTR',
    ].includes(readerType);
    return (
        <List>
            <ListItem>
                <ListItemText primary={t('reader.settings.label.static_navigation')} />
                <ListItemSecondaryAction>
                    <Switch
                        edge="end"
                        checked={staticNav}
                        onChange={(e) => setSettingValue('staticNav', e.target.checked)}
                    />
                </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
                <ListItemText primary={t('reader.settings.label.show_page_number')} />
                <ListItemSecondaryAction>
                    <Switch
                        edge="end"
                        checked={showPageNumber}
                        onChange={(e) => setSettingValue('showPageNumber', e.target.checked)}
                    />
                </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
                <ListItemText primary={t('reader.settings.label.load_next_chapter')} />
                <ListItemSecondaryAction>
                    <Switch
                        edge="end"
                        checked={loadNextOnEnding}
                        onChange={(e) => setSettingValue('loadNextOnEnding', e.target.checked)}
                    />
                </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
                <ListItemText primary={t('reader.settings.label.skip_dup_chapters')} />
                <ListItemSecondaryAction>
                    <Switch
                        edge="end"
                        checked={skipDupChapters}
                        onChange={(e) => setSettingValue('skipDupChapters', e.target.checked)}
                    />
                </ListItemSecondaryAction>
            </ListItem>
            {fitPageToWindowEligible ? (
                <ListItem>
                    <ListItemText primary={t('reader.settings.label.fit_page_to_window')} />
                    <ListItemSecondaryAction>
                        <Switch
                            edge="end"
                            checked={fitPageToWindow}
                            onChange={(e) => setSettingValue('fitPageToWindow', e.target.checked)}
                        />
                    </ListItemSecondaryAction>
                </ListItem>
            ) : null}
            <ListItem>
                <ListItemText primary={t('reader.settings.label.offset_first_page')} />
                <ListItemSecondaryAction>
                    <Switch
                        edge="end"
                        checked={offsetFirstPage}
                        onChange={(e) => setSettingValue('offsetFirstPage', e.target.checked)}
                    />
                </ListItemSecondaryAction>
            </ListItem>
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
