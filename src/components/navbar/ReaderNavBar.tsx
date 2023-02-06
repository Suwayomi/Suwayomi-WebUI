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
import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { useHistory, Link, useLocation } from 'react-router-dom';
import Slide from '@mui/material/Slide';
import Fade from '@mui/material/Fade';
import Zoom from '@mui/material/Zoom';
import { Divider } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import { styled } from '@mui/system';
import useBackTo from 'util/useBackTo';
import ReaderSettingsOptions from 'components/reader/ReaderSettingsOptions';

const Root = styled('div')(({ theme }) => ({
    top: 0,
    left: 0,
    width: '300px',
    minWidth: '300px',
    height: '100vh',
    overflowY: 'auto',
    backgroundColor: theme.palette.background.default,

    '& header': {
        backgroundColor: theme.palette.action.hover,
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

        '& h1': {
            fontSize: '1.25rem',
            flexGrow: 1,
        },
    },
}));

const Navigation = styled('div')({
    margin: '0 16px',
    '& > span:nth-child(1)': {
        textAlign: 'center',
        display: 'block',
        marginTop: '16px',
    },
});

const ChapterNavigation = styled('div')({
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
});

const OpenDrawerButton = styled(IconButton)(({ theme }) => ({
    position: 'fixed',
    top: 0 + 20,
    left: 10 + 20,
    height: '40px',
    width: '40px',
    borderRadius: 5,
    backgroundColor: theme.palette.custom.main,
    '&:hover': {
        backgroundColor: theme.palette.custom.light,
    },
}));

interface IProps {
    settings: IReaderSettings;
    setSettingValue: (key: keyof IReaderSettings, value: string | boolean) => void;
    manga: IManga | IMangaCard;
    chapter: IChapter;
    curPage: number;
}

export default function ReaderNavBar(props: IProps) {
    const history = useHistory();
    const backTo = useBackTo();
    const location = useLocation<{
        prevDrawerOpen?: boolean;
        prevSettingsCollapseOpen?: boolean;
    }>();
    const { prevDrawerOpen, prevSettingsCollapseOpen } = location.state ?? {};

    const { settings, setSettingValue, manga, chapter, curPage } = props;

    const [drawerOpen, setDrawerOpen] = useState(settings.staticNav || prevDrawerOpen);
    const [updateDrawerOnRender, setUpdateDrawerOnRender] = useState(true);
    const [hideOpenButton, setHideOpenButton] = useState(settings.staticNav || prevDrawerOpen);
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [settingsCollapseOpen, setSettingsCollapseOpen] = useState(
        prevSettingsCollapseOpen ?? true,
    );

    const updateSettingValue = (key: keyof IReaderSettings, value: string | boolean) => {
        // prevent closing the navBar when updating the "staticNav" setting
        setUpdateDrawerOnRender(key !== 'staticNav');
        setSettingValue(key, value);
    };

    const updateDrawer = (open: boolean) => {
        setDrawerOpen(open);
        setHideOpenButton(open);
    };

    const handleScroll = () => {
        const currentScrollPos = window.pageYOffset;

        if (Math.abs(currentScrollPos - prevScrollPos) > 20) {
            setHideOpenButton(currentScrollPos > prevScrollPos);
            setPrevScrollPos(currentScrollPos);
        }
    };

    useEffect(() => {
        if (updateDrawerOnRender) {
            updateDrawer(settings.staticNav);
        }
    }, [settings.staticNav]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        const rootEl: HTMLDivElement = document.querySelector('#root')!;
        const mainContainer: HTMLDivElement = document.querySelector('#appMainContainer')!;

        // main container and root div need to change styles...
        rootEl.style.display = 'flex';
        mainContainer.style.display = 'none';

        return () => {
            rootEl.style.display = 'block';
            mainContainer.style.display = 'block';
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]); // handleScroll changes on every render

    const handleClose = () => {
        if (backTo.back) history.goBack();
        else if (backTo.url) history.push(backTo.url);
        else history.push(`/manga/${manga.id}`);
    };

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
                <Root
                    sx={{
                        position: settings.staticNav ? 'sticky' : 'fixed',
                    }}
                >
                    <header>
                        {!settings.staticNav && (
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                disableRipple
                                onClick={() => updateDrawer(false)}
                                size="large"
                            >
                                <KeyboardArrowLeftIcon />
                            </IconButton>
                        )}
                        <Typography
                            variant="h1"
                            textOverflow="ellipsis"
                            overflow="hidden"
                            sx={{ py: 1 }}
                        >
                            {chapter.name}
                        </Typography>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            disableRipple
                            onClick={handleClose}
                            size="large"
                            sx={{ mr: -1 }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </header>
                    <ListItem
                        ContainerComponent="div"
                        sx={{
                            '& span': {
                                fontWeight: 'bold',
                            },
                        }}
                    >
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
                        <ReaderSettingsOptions
                            setSettingValue={updateSettingValue}
                            staticNav={settings.staticNav}
                            showPageNumber={settings.showPageNumber}
                            loadNextOnEnding={settings.loadNextOnEnding}
                            readerType={settings.readerType}
                        />
                    </Collapse>
                    <Divider sx={{ my: 1, mx: 2 }} />
                    <Navigation>
                        <span>{`Currently on page ${curPage + 1} of ${chapter.pageCount}`}</span>
                        <ChapterNavigation>
                            {chapter.index > 1 && (
                                <Link
                                    replace
                                    to={{
                                        pathname: `/manga/${manga.id}/chapter/${chapter.index - 1}`,
                                        state: {
                                            prevDrawerOpen: drawerOpen,
                                            prevSettingsCollapseOpen: settingsCollapseOpen,
                                        },
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        sx={{ gridArea: 'prev' }}
                                        startIcon={<KeyboardArrowLeftIcon />}
                                    >
                                        Prev. Chapter
                                    </Button>
                                </Link>
                            )}
                            {chapter.index < chapter.chapterCount && (
                                <Link
                                    replace
                                    style={{ gridArea: 'next' }}
                                    to={{
                                        pathname: `/manga/${manga.id}/chapter/${chapter.index + 1}`,
                                        state: {
                                            prevDrawerOpen: drawerOpen,
                                            prevSettingsCollapseOpen: settingsCollapseOpen,
                                        },
                                    }}
                                >
                                    <Button variant="outlined" endIcon={<KeyboardArrowRightIcon />}>
                                        Next Chapter
                                    </Button>
                                </Link>
                            )}
                        </ChapterNavigation>
                    </Navigation>
                </Root>
            </Slide>
            <Zoom in={!drawerOpen}>
                <Fade in={!hideOpenButton}>
                    <OpenDrawerButton
                        edge="start"
                        aria-label="menu"
                        disableRipple
                        disableFocusRipple
                        onClick={() => updateDrawer(true)}
                        size="large"
                    >
                        <KeyboardArrowRightIcon />
                    </OpenDrawerButton>
                </Fade>
            </Zoom>
        </>
    );
}
