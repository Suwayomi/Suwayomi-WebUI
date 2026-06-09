/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { TextSetting } from '@/base/components/settings/text/TextSetting.tsx';
import { SelectSetting } from '@/base/components/settings/SelectSetting.tsx';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { StartSyncResult } from '@/lib/graphql/generated/graphql-base.types.ts';
import type { ServerSettings as ServerSettingsType } from '@/features/settings/Settings.types.ts';

const SYNC_INTERVAL_VALUES: [string, { text: string }][] = [
    ['PT0S', { text: 'Desativado' }],
    ['PT15M', { text: '15 minutos' }],
    ['PT30M', { text: '30 minutos' }],
    ['PT1H', { text: '1 hora' }],
    ['PT2H', { text: '2 horas' }],
    ['PT6H', { text: '6 horas' }],
    ['PT12H', { text: '12 horas' }],
    ['PT24H', { text: '24 horas' }],
];

const normalizeSyncInterval = (value: string): string => {
    const knownValues = SYNC_INTERVAL_VALUES.map(([v]) => v);
    return knownValues.includes(value) ? value : 'PT0S';
};

export const SyncYomiSettings = ({
    settings: {
        syncYomiEnabled,
        syncYomiHost,
        syncYomiApiKey,
        syncDataManga,
        syncDataChapters,
        syncDataTracking,
        syncDataHistory,
        syncDataCategories,
        syncInterval,
        syncOnChapterRead,
        syncOnChapterOpen,
        syncOnWebUIStart,
        syncOnWebUIResume,
    },
    updateSetting,
}: {
    settings: ServerSettingsType;
    updateSetting: <Setting extends keyof ServerSettingsType>(
        setting: Setting,
        value: ServerSettingsType[Setting],
        onCompletion?: (success: boolean) => void,
    ) => Promise<void>;
}) => {
    const { t } = useLingui();
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSyncNow = async () => {
        setIsSyncing(true);
        try {
            const { data } = await requestManager.startSync().response;
            const result = data?.startSync.result;
            if (result === StartSyncResult.Success) {
                makeToast(t`Sincronização iniciada com sucesso`, 'success');
            } else if (result === StartSyncResult.SyncInProgress) {
                makeToast(t`Sincronização já está em andamento`, 'info');
            } else if (result === StartSyncResult.SyncDisabled) {
                makeToast(t`SyncYomi está desativado`, 'warning');
            }
        } catch (e) {
            makeToast(t`Falha ao iniciar sincronização`, 'error', getErrorMessage(e));
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <>
            <List
                subheader={
                    <ListSubheader component="div" id="syncyomi-settings">
                        {t`SyncYomi`}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText
                        primary={t`Ativar SyncYomi`}
                        secondary={t`Sincronize sua biblioteca com outros dispositivos via SyncYomi`}
                    />
                    <Switch
                        edge="end"
                        checked={syncYomiEnabled}
                        onChange={(e) => updateSetting('syncYomiEnabled', e.target.checked)}
                    />
                </ListItem>
                <TextSetting
                    settingName={t`Endereço do servidor`}
                    dialogDescription={t`URL do servidor SyncYomi (ex.: https://sync.example.com)`}
                    value={syncYomiHost}
                    handleChange={(host) => updateSetting('syncYomiHost', host)}
                    disabled={!syncYomiEnabled}
                />
                <TextSetting
                    settingName={t`Chave de API`}
                    dialogDescription={t`Chave de API gerada no servidor SyncYomi`}
                    value={syncYomiApiKey}
                    handleChange={(apiKey) => updateSetting('syncYomiApiKey', apiKey)}
                    isPassword
                    disabled={!syncYomiEnabled}
                />
                <ListItemButton onClick={handleSyncNow} disabled={!syncYomiEnabled || isSyncing}>
                    <ListItemText
                        primary={t`Sincronizar agora`}
                        secondary={t`Inicia uma sincronização manual com o servidor`}
                    />
                    {isSyncing && <CircularProgress size={24} />}
                </ListItemButton>
                <SelectSetting<string>
                    settingName={t`Intervalo de sincronização automática`}
                    value={normalizeSyncInterval(syncInterval)}
                    values={SYNC_INTERVAL_VALUES}
                    handleChange={(value) => updateSetting('syncInterval', value)}
                    disabled={!syncYomiEnabled}
                />
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="syncyomi-triggers">
                        {t`Gatilhos de sincronização`}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText
                        primary={t`Ao marcar capítulo como lido`}
                        secondary={t`Dispara sincronização quando um capítulo é marcado como lido`}
                    />
                    <Switch
                        edge="end"
                        checked={syncOnChapterRead}
                        onChange={(e) => updateSetting('syncOnChapterRead', e.target.checked)}
                        disabled={!syncYomiEnabled}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t`Ao abrir um capítulo`}
                        secondary={t`Dispara sincronização quando o progresso de leitura é atualizado`}
                    />
                    <Switch
                        edge="end"
                        checked={syncOnChapterOpen}
                        onChange={(e) => updateSetting('syncOnChapterOpen', e.target.checked)}
                        disabled={!syncYomiEnabled}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t`Ao abrir o WebUI`}
                        secondary={t`Dispara sincronização ao carregar o WebUI no navegador`}
                    />
                    <Switch
                        edge="end"
                        checked={syncOnWebUIStart}
                        onChange={(e) => updateSetting('syncOnWebUIStart', e.target.checked)}
                        disabled={!syncYomiEnabled}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t`Ao retornar ao WebUI`}
                        secondary={t`Dispara sincronização quando a aba do navegador recupera o foco`}
                    />
                    <Switch
                        edge="end"
                        checked={syncOnWebUIResume}
                        onChange={(e) => updateSetting('syncOnWebUIResume', e.target.checked)}
                        disabled={!syncYomiEnabled}
                    />
                </ListItem>
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="syncyomi-data">
                        {t`Dados sincronizados`}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText primary={t`Mangás`} />
                    <Switch
                        edge="end"
                        checked={syncDataManga}
                        onChange={(e) => updateSetting('syncDataManga', e.target.checked)}
                        disabled={!syncYomiEnabled}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText primary={t`Capítulos`} secondary={t`Progresso de leitura e marcações`} />
                    <Switch
                        edge="end"
                        checked={syncDataChapters}
                        onChange={(e) => updateSetting('syncDataChapters', e.target.checked)}
                        disabled={!syncYomiEnabled}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText primary={t`Rastreamento`} />
                    <Switch
                        edge="end"
                        checked={syncDataTracking}
                        onChange={(e) => updateSetting('syncDataTracking', e.target.checked)}
                        disabled={!syncYomiEnabled}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText primary={t`Histórico`} />
                    <Switch
                        edge="end"
                        checked={syncDataHistory}
                        onChange={(e) => updateSetting('syncDataHistory', e.target.checked)}
                        disabled={!syncYomiEnabled}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText primary={t`Categorias`} />
                    <Switch
                        edge="end"
                        checked={syncDataCategories}
                        onChange={(e) => updateSetting('syncDataCategories', e.target.checked)}
                        disabled={!syncYomiEnabled}
                    />
                </ListItem>
            </List>
        </>
    );
};
