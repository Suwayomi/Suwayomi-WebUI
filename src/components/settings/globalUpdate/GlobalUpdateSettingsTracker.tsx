/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, TextField } from '@mui/material';
import { CheckboxContainer } from '@/components/settings/globalUpdate/CheckboxContainer.ts';

// type GlobalUpdateSkipEntriesSettings = Pick<
//     ServerSettings,
//     'excludeUnreadChapters' | 'excludeNotStarted' | 'excludeCompleted'
// >;

// const settingToTextMap: { [setting in keyof GlobalUpdateSkipEntriesSettings]: TranslationKey } = {
//     excludeUnreadChapters: 'library.settings.global_update.entries.label.unread_chapters',
//     excludeNotStarted: 'library.settings.global_update.entries.label.not_started',
//     excludeCompleted: 'library.settings.global_update.entries.label.completed',
// };

// const getSkipMangasText = (settings: GlobalUpdateSkipEntriesSettings | undefined, isLoading: boolean, error: any) => {
//     if (error) {
//         return translate('global.error.label.failed_to_load_data');
//     }

//     if (!settings || isLoading) {
//         return translate('global.label.loading');
//     }

//     const skipSettings: string[] = [];

//     if (settings.excludeUnreadChapters) {
//         skipSettings.push(translate(settingToTextMap.excludeUnreadChapters) as string);
//     }

//     if (settings.excludeNotStarted) {
//         skipSettings.push(translate(settingToTextMap.excludeNotStarted) as string);
//     }

//     if (settings.excludeCompleted) {
//         skipSettings.push(translate(settingToTextMap.excludeCompleted) as string);
//     }

//     const isNothingExcluded = !skipSettings.length;
//     if (isNothingExcluded) {
//         skipSettings.push(translate('global.label.none'));
//     }

//     return skipSettings.join(', ');
// };

// const extractSkipEntriesSettings = (serverSettings: ServerSettings): GlobalUpdateSkipEntriesSettings => ({
//     excludeCompleted: serverSettings.excludeCompleted,
//     excludeNotStarted: serverSettings.excludeNotStarted,
//     excludeUnreadChapters: serverSettings.excludeUnreadChapters,
// });

type Props = {
    aniliClientId?: string;
    AniliRedirectUri?: string;
};

export const GlobalUpdateSettingsTracker = ({ aniliClientId, AniliRedirectUri }: Props) => {
    const { t } = useTranslation();
    // const { data, loading, error: requestError } = requestManager.useGetServerSettings();
    // const globalUpdateSettings = data ? extractSkipEntriesSettings(data.settings) : undefined;
    // const [mutateSettings] = requestManager.useUpdateServerSettings();

    // const [dialogSettings, setDialogSettings] = useState<GlobalUpdateSkipEntriesSettings>(
    //     globalUpdateSettings ?? ({} as GlobalUpdateSkipEntriesSettings),
    // );
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [needCode, setNeedCode] = useState(true);

    // const skipEntriesText = getSkipMangasText(globalUpdateSettings, loading, requestError);

    // const updateSettings = async () => {
    //     const didSettingsChange =
    //         globalUpdateSettings?.excludeCompleted !== dialogSettings.excludeCompleted ||
    //         globalUpdateSettings.excludeNotStarted !== dialogSettings.excludeNotStarted ||
    //         globalUpdateSettings.excludeUnreadChapters !== dialogSettings.excludeUnreadChapters;

    //     setIsDialogOpen(false);

    //     if (!didSettingsChange) {
    //         return;
    //     }

    //     try {
    //         await mutateSettings({ variables: { input: { settings: dialogSettings } } });
    //     } catch (error) {
    //         makeToast(t('global.error.label.failed_to_save_changes'), 'error');
    //     }
    // };

    const closeDialog = () => {
        // setDialogSettings(globalUpdateSettings ?? ({} as GlobalUpdateSkipEntriesSettings));
        setIsDialogOpen(false);
        setNeedCode(true);
    };

    // useEffect(() => {
    //     if (!globalUpdateSettings) {
    //         return;
    //     }

    //     setDialogSettings(globalUpdateSettings);
    // }, [
    //     globalUpdateSettings?.excludeCompleted,
    //     globalUpdateSettings?.excludeNotStarted,
    //     globalUpdateSettings?.excludeUnreadChapters,
    // ]);

    // async function fetchToken(client_id: string, client_secret: string, redirect_uri: string, code: string) {
    //     const options = {
    //         method: 'POST',
    //         url: 'https://anilist.co/api/v2/oauth/token',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             Accept: 'application/json',
    //         },
    //         data: {
    //             grant_type: 'authorization_code',
    //             client_id,
    //             client_secret,
    //             redirect_uri, // http://example.com/callback
    //             code, // The Authorization Code received previously
    //         },
    //     };

    //     try {
    //         const response = await axios(options);
    //         console.log(response.data.access_token);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    return (
        <>
            <ListItemButton onClick={() => setIsDialogOpen(true)}>
                <ListItemText
                    primary={<p>Login in to Anilist</p>}
                    secondary={<p>Track your manga reading progress</p>}
                    // primary={t('library.settings.global_update.entries.title')}
                    // secondary={skipEntriesText}
                    onClick={() => setIsDialogOpen(true)}
                />
            </ListItemButton>

            <Dialog open={isDialogOpen} onClose={closeDialog}>
                <DialogContent>
                    <DialogTitle sx={{ paddingLeft: 0 }}>
                        You are about to be redirected to Anilist, make sure to copy the code paramater from the
                        redirect uri after authentcating
                        {/* {t('library.settings.global_update.entries.title')} */}
                    </DialogTitle>
                    <CheckboxContainer>
                        {needCode ? (
                            <Link
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                href={`https://anilist.co/api/v2/oauth/authorize?client_id=${aniliClientId ?? import.meta.env.VITE_ANILI_CLIENT_ID}&redirect_uri=${AniliRedirectUri ?? import.meta.env.VITE_ANILI_REDIRECT_URI}&response_type=code`}
                                // target="_blank"
                                underline="none"
                                rel="noopener noreferrer"
                                // onClick={() => setNeedCode(false)}
                            >
                                Go to Anilist to authenticate
                            </Link>
                        ) : (
                            <form noValidate autoComplete="off">
                                <TextField sx={{ Padding: 3 }} id="anilist-code" label="Code:" variant="outlined" />
                                <Button variant="contained" color="primary">
                                    Submit
                                </Button>
                            </form>
                        )}
                    </CheckboxContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="primary">
                        {t('global.button.cancel')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
