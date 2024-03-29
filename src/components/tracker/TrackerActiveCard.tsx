/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Link,
    ListItemButton,
    MenuItem,
    Stack,
    Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PopupState, { bindDialog, bindMenu, bindTrigger } from 'material-ui-popup-state';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { Trackers, TTrackRecord, UNSET_DATE } from '@/lib/data/Trackers.ts';
import { ListPreference } from '@/components/sourceConfiguration/ListPreference.tsx';
import { NumberSetting } from '@/components/settings/NumberSetting.tsx';
import { DateSetting } from '@/components/settings/DateSetting.tsx';
import { makeToast } from '@/components/util/Toast.tsx';
import { Menu } from '@/components/menu/Menu';
import { DIALOG_PADDING } from '@/components/tracker/constants.ts';

const TrackerActiveLink = ({ children, url }: { children: React.ReactNode; url: string }) => (
    <Link href={url} rel="noreferrer" target="_blank" underline="none" color="inherit">
        {children}
    </Link>
);

const TrackerActiveRemoveBind = ({
    trackRecord: { tracker, ...trackRecord },
    onClick,
    onClose,
}: {
    trackRecord: TTrackRecord;
    onClick: () => void;
    onClose: () => void;
}) => {
    const { t } = useTranslation();

    // TODO - enable once server supports removing track binding on tracker source
    // const [removeRemoteTracking, setRemoveRemoteTracking] = useState(false);

    const removeBind = () => {
        onClose();
        requestManager
            .updateTrackerBind(trackRecord.id, { unbind: true })
            .response.then(() => makeToast(t('manga.action.track.remove.label.success'), 'success'))
            .catch(() => makeToast(t('manga.action.track.remove.label.error'), 'error'));
    };

    return (
        <PopupState variant="dialog" popupId={`tracker-active-menu-remove-button-${tracker.id}`}>
            {(popupState) => (
                <>
                    <MenuItem
                        {...bindTrigger(popupState)}
                        onClick={() => {
                            onClick();
                            popupState.open();
                        }}
                        onTouchStart={() => {
                            onClick();
                            popupState.open();
                        }}
                    >
                        {t('global.button.remove')}
                    </MenuItem>
                    <Dialog
                        {...bindDialog(popupState)}
                        onClose={() => {
                            onClose();
                            popupState.close();
                        }}
                    >
                        <DialogTitle>
                            {t('manga.action.track.remove.dialog.label.title', { tracker: tracker.name })}
                        </DialogTitle>
                        <DialogContent dividers>
                            <Typography>{t('manga.action.track.remove.dialog.label.description')}</Typography>
                            {/* TODO - enable once server supports removing track binding on tracker source */}
                            {/* <FormGroup> */}
                            {/*    <CheckboxInput */}
                            {/*        disabled={false} */}
                            {/*        label={t('chapter.title')} */}
                            {/*        checked={removeRemoteTracking} */}
                            {/*        onChange={(_, checked) => setRemoveRemoteTracking(checked)} */}
                            {/*    /> */}
                            {/* </FormGroup> */}
                        </DialogContent>
                        <DialogActions>
                            <Button
                                autoFocus
                                onClick={() => {
                                    popupState.close();
                                    onClose();
                                }}
                            >
                                {t('global.button.cancel')}
                            </Button>
                            <Button
                                onClick={() => {
                                    popupState.close();
                                    onClose();
                                    removeBind();
                                }}
                            >
                                {t('global.button.ok')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </PopupState>
    );
};

const TrackerActiveHeader = ({
    trackRecord: { tracker, ...trackRecord },
    openSearch,
}: {
    trackRecord: TTrackRecord;
    openSearch: () => void;
}) => {
    const { t } = useTranslation();

    return (
        <Stack direction="row" alignItems="stretch" sx={{ paddingBottom: '15px' }}>
            <TrackerActiveLink url={trackRecord.remoteUrl}>
                <Avatar
                    alt={`${tracker.name}`}
                    src={requestManager.getValidImgUrlFor(tracker.icon)}
                    variant="rounded"
                    sx={{ width: 64, height: 64 }}
                />
            </TrackerActiveLink>

            <ListItemButton sx={{ flexGrow: 1 }} onClick={openSearch}>
                <Typography flexGrow={1}>{trackRecord.title}</Typography>
            </ListItemButton>
            <Stack justifyContent="center">
                <PopupState variant="popover" popupId={`tracker-active-menu-popup-${tracker.id}`}>
                    {(popupState) => (
                        <>
                            <IconButton {...bindTrigger(popupState)}>
                                <MoreVertIcon />
                            </IconButton>
                            <Menu {...bindMenu(popupState)} id={`tracker-active-menu-${tracker.id}`}>
                                {(onClose, setHideMenu) => [
                                    <TrackerActiveLink
                                        key={`tracker-active-menu-item-browser-${tracker.id}`}
                                        url={trackRecord.remoteUrl}
                                    >
                                        <MenuItem onClick={() => onClose()}>
                                            {t('global.label.open_in_browser')}
                                        </MenuItem>
                                    </TrackerActiveLink>,
                                    <TrackerActiveRemoveBind
                                        key={`tracker-active-menu-item-remove-${tracker.id}`}
                                        trackRecord={{ tracker, ...trackRecord }}
                                        onClick={() => setHideMenu(true)}
                                        onClose={onClose}
                                    />,
                                ]}
                            </Menu>
                        </>
                    )}
                </PopupState>
            </Stack>
        </Stack>
    );
};

const TrackerActiveCardInfoRow = ({ children }: { children: React.ReactNode }) => (
    <Stack direction="row" sx={{ textAlignLast: 'center' }}>
        {children}
    </Stack>
);

export const TrackerActiveCard = ({
    trackRecord: { tracker, ...trackRecord },
    onClick,
}: {
    trackRecord: TTrackRecord;
    onClick: () => void;
}) => {
    const { t } = useTranslation();

    const updateTrackerBind = (patch: Parameters<typeof requestManager.updateTrackerBind>[1]) => {
        requestManager
            .updateTrackerBind(trackRecord.id, patch)
            .response.catch(() => makeToast(t('global.error.label.failed_to_save_changes'), 'error'));
    };

    return (
        <Card
            sx={{
                padding: DIALOG_PADDING,
                backgroundColor: 'transparent',
                boxShadow: 'unset',
                backgroundImage: 'unset',
            }}
        >
            <CardContent sx={{ padding: 0 }}>
                <TrackerActiveHeader trackRecord={{ tracker, ...trackRecord }} openSearch={onClick} />
                <Card>
                    <CardContent sx={{ padding: '0' }}>
                        <Box sx={{ padding: 1 }}>
                            <TrackerActiveCardInfoRow>
                                <ListPreference
                                    ListPreferenceTitle={t('manga.label.status')}
                                    entries={tracker.statuses.map((status) => status.name)}
                                    key="status"
                                    type="ListPreference"
                                    entryValues={tracker.statuses.map((status) => `${status.value}`)}
                                    ListPreferenceCurrentValue={`${trackRecord.status}`}
                                    updateValue={(_, status) =>
                                        updateTrackerBind({ status: status as unknown as number })
                                    }
                                    summary="%s"
                                />
                                <Divider orientation="vertical" flexItem />
                                <NumberSetting
                                    settingTitle={t('chapter.title_other')}
                                    dialogTitle={t('chapter.title_other')}
                                    settingValue={`${trackRecord.lastChapterRead}/${trackRecord.totalChapters}`}
                                    value={trackRecord.lastChapterRead}
                                    minValue={0}
                                    maxValue={trackRecord.totalChapters}
                                    valueUnit=""
                                    handleUpdate={(lastChapterRead) => updateTrackerBind({ lastChapterRead })}
                                />
                                <Divider orientation="vertical" flexItem />
                                <NumberSetting
                                    settingTitle={t('tracking.track_record.label.score')}
                                    dialogTitle={t('manga.label.status')}
                                    settingValue={trackRecord.displayScore}
                                    value={trackRecord.score ?? 0}
                                    minValue={0}
                                    maxValue={Number(tracker.scores.slice(-1)[0])}
                                    stepSize={Number(
                                        (Number(tracker.scores[2] ?? 0) - Number(tracker.scores[1] ?? 0)).toFixed(1),
                                    )}
                                    valueUnit=""
                                    handleUpdate={(newScore) =>
                                        updateTrackerBind({
                                            scoreString:
                                                newScore === 0
                                                    ? tracker.scores[0]
                                                    : tracker.scores.find((score) => Number(score) === newScore),
                                        })
                                    }
                                />
                            </TrackerActiveCardInfoRow>
                            <Divider />
                            <TrackerActiveCardInfoRow>
                                <DateSetting
                                    settingName={t('tracking.track_record.label.start_date')}
                                    value={Trackers.getDateString(trackRecord.startDate)}
                                    remove
                                    handleChange={(startDate) =>
                                        updateTrackerBind({ startDate: startDate ?? UNSET_DATE })
                                    }
                                />
                                <Divider orientation="vertical" flexItem />
                                <DateSetting
                                    settingName={t('tracking.track_record.label.finish_date')}
                                    value={Trackers.getDateString(trackRecord.finishDate)}
                                    remove
                                    handleChange={(finishDate) =>
                                        updateTrackerBind({ finishDate: finishDate ?? UNSET_DATE })
                                    }
                                />
                            </TrackerActiveCardInfoRow>
                        </Box>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
};
