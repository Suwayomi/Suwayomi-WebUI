/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import makeStyles from '@mui/styles/makeStyles';
import React, { useContext, useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { useHistory, Link } from 'react-router-dom';
import Slide from '@mui/material/Slide';
import Fade from '@mui/material/Fade';
import Zoom from '@mui/material/Zoom';
import { Switch } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import NavBarContext from '../../context/NavbarContext';

const useStyles = (settings: IReaderSettings) => makeStyles((theme) => ({
    // main container and root div need to change classes...
    AppMainContainer: {
        display: 'none',
    },
    AppRootElment: {
        display: 'flex',
    },

    root: {
        position: settings.staticNav ? 'sticky' : 'fixed',
        top: 0,
        left: 0,
        width: '300px',
        minWidth: '300px',
        height: '100vh',
        overflowY: 'auto',
        backgroundColor: theme.palette.background.default,

        '& header': {
            backgroundColor:
            theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
            display: 'flex',
            alignItems: 'center',
            minHeight: '64px',
            paddingLeft: '24px',
            paddingRight: '24px',

            transition: 'left 2s ease',

            '& button': {
                flexGrow: 0,
                flexShrink: 0,
            },

            '& button:nth-child(1)': {
                marginRight: '16px',
            },

            '& button:nth-child(3)': {
                marginRight: '-12px',
            },

            '& h1': {
                fontSize: '1.25rem',
                flexGrow: 1,
            },
        },
        '& hr': {
            margin: '0 16px',
            height: '1px',
            border: '0',
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
        },
    },

    navigation: {
        margin: '0 16px',

        '& > span:nth-child(1)': {
            textAlign: 'center',
            display: 'block',
            marginTop: '16px',
        },

        '& $navigationChapters': {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateAreas: '"prev next"',
            gridColumnGap: '5px',
            margin: '10px 0',

            '& a': {
                flexGrow: 1,
                textDecoration: 'none',

                '& button': {
                    width: '100%',
                    padding: '5px 8px',
                    textTransform: 'none',
                },
            },
        },

    },
    navigationChapters: {}, // dummy rule

    settingsCollapsseHeader: {
        '& span': {
            fontWeight: 'bold',
        },
    },

    openDrawerButton: {
        position: 'fixed',
        top: 0 + 20,
        left: 10 + 20,
        height: '40px',
        width: '40px',
        borderRadius: 5,
        backgroundColor: theme.palette.mode === 'dark' ? 'black' : 'white',

        '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
        },
    },
}));

export const defaultReaderSettings = () => ({
    staticNav: false,
    showPageNumber: true,
    continuesPageGap: false,
    loadNextonEnding: false,
    readerType: 'ContinuesVertical',
} as IReaderSettings);

interface IProps {
    settings: IReaderSettings
    setSettings: React.Dispatch<React.SetStateAction<IReaderSettings>>
    manga: IManga | IMangaCard
    chapter: IChapter
    curPage: number
}

export default function ReaderNavBar(props: IProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { title } = useContext(NavBarContext);

    const history = useHistory();

    const {
        settings, setSettings, manga, chapter, curPage,
    } = props;

    const [drawerOpen, setDrawerOpen] = useState(false || settings.staticNav);
    const [hideOpenButton, setHideOpenButton] = useState(false);
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [settingsCollapseOpen, setSettingsCollapseOpen] = useState(true);

    const classes = useStyles(settings)();

    const setSettingValue = (key: string, value: any) => setSettings({ ...settings, [key]: value });

    const handleScroll = () => {
        const currentScrollPos = window.pageYOffset;

        if (Math.abs(currentScrollPos - prevScrollPos) > 20) {
            setHideOpenButton(currentScrollPos > prevScrollPos);
            setPrevScrollPos(currentScrollPos);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        const rootEl = document.querySelector('#root')!;
        const mainContainer = document.querySelector('#appMainContainer')!;

        rootEl.classList.add(classes.AppRootElment);
        mainContainer.classList.add(classes.AppMainContainer);

        return () => {
            rootEl.classList.remove(classes.AppRootElment);
            mainContainer.classList.remove(classes.AppMainContainer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);// handleScroll changes on every render

    return (
        <>
            <Slide
                direction="right"
                in={drawerOpen}
                timeout={200}
                appear={false}
                mountOnEnter
                unmountOnExit
            >
                <div className={classes.root}>
                    <header>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            disableRipple
                            onClick={() => setDrawerOpen(false)}
                            size="large"
                        >
                            <KeyboardArrowLeftIcon />
                        </IconButton>
                        <Typography variant="h1">
                            {/* {title} */}
                            {chapter.name}
                        </Typography>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            disableRipple
                            onClick={() => history.goBack()}
                            size="large"
                        >
                            <CloseIcon />
                        </IconButton>
                    </header>
                    <ListItem ContainerComponent="div" className={classes.settingsCollapsseHeader}>
                        <ListItemText primary="Reader Settings" />
                        <ListItemSecondaryAction>
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                disableRipple
                                disableFocusRipple
                                onClick={() => setSettingsCollapseOpen(!settingsCollapseOpen)}
                                size="large"
                            >
                                {settingsCollapseOpen && <KeyboardArrowUpIcon />}
                                {!settingsCollapseOpen && <KeyboardArrowDownIcon />}
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Collapse in={settingsCollapseOpen} timeout="auto" unmountOnExit>
                        <List>
                            <ListItem>
                                <ListItemText primary="Static Navigation" />
                                <ListItemSecondaryAction>
                                    <Switch
                                        edge="end"
                                        checked={settings.staticNav}
                                        onChange={(e) => setSettingValue('staticNav', e.target.checked)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="Show page number" />
                                <ListItemSecondaryAction>
                                    <Switch
                                        edge="end"
                                        checked={settings.showPageNumber}
                                        onChange={(e) => setSettingValue('showPageNumber', e.target.checked)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="Load next chapter at ending" />
                                <ListItemSecondaryAction>
                                    <Switch
                                        edge="end"
                                        checked={settings.loadNextonEnding}
                                        onChange={(e) => setSettingValue('loadNextonEnding', e.target.checked)}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="Reader Type" />
                                <Select
                                    value={settings.readerType}
                                    onChange={(e) => setSettingValue('readerType', e.target.value)}
                                >
                                    <MenuItem value="SingleLTR">
                                        Single Page (LTR)

                                    </MenuItem>
                                    <MenuItem value="SingleRTL">
                                        Single Page (RTL)

                                    </MenuItem>
                                    {/* <MenuItem value="SingleVertical">
                                    Vertical(WIP)

                                </MenuItem> */}
                                    <MenuItem value="DoubleLTR">
                                        Double Page (LTR)

                                    </MenuItem>
                                    <MenuItem value="DoubleRTL">
                                        Double Page (RTL)

                                    </MenuItem>
                                    <MenuItem value="Webtoon">
                                        Webtoon

                                    </MenuItem>
                                    <MenuItem value="ContinuesVertical">
                                        Continues Vertical

                                    </MenuItem>
                                    <MenuItem value="ContinuesHorizontalLTR">
                                        Horizontal (LTR)

                                    </MenuItem>
                                    <MenuItem value="ContinuesHorizontalRTL">
                                        Horizontal (RTL)

                                    </MenuItem>
                                </Select>
                            </ListItem>
                        </List>
                    </Collapse>
                    <hr />
                    <div className={classes.navigation}>
                        <span>
                            {`Currently on page ${curPage + 1} of ${chapter.pageCount}`}
                        </span>
                        <div className={classes.navigationChapters}>
                            {chapter.index > 1
                        && (
                            <Link
                                replace
                                style={{ gridArea: 'prev' }}
                                to={`/manga/${manga.id}/chapter/${chapter.index - 1}`}
                            >
                                <Button
                                    variant="outlined"
                                    startIcon={<KeyboardArrowLeftIcon />}
                                >
                                    Prev. Chapter
                                </Button>
                            </Link>
                        )}
                            {chapter.index < chapter.chapterCount
                        && (
                            <Link
                                replace
                                style={{ gridArea: 'next' }}
                                to={`/manga/${manga.id}/chapter/${chapter.index + 1}`}
                            >
                                <Button
                                    variant="outlined"
                                    endIcon={<KeyboardArrowRightIcon />}
                                >
                                    Next Chapter
                                </Button>
                            </Link>
                        )}
                        </div>
                    </div>
                </div>
            </Slide>
            <Zoom in={!drawerOpen}>
                <Fade in={!hideOpenButton}>
                    <IconButton
                        className={classes.openDrawerButton}
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        disableRipple
                        disableFocusRipple
                        onClick={() => setDrawerOpen(true)}
                        size="large"
                    >
                        <KeyboardArrowRightIcon />
                    </IconButton>
                </Fade>
            </Zoom>
        </>
    );
}
