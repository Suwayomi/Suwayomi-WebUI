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
import { useHistory, Link } from 'react-router-dom';
import Slide from '@mui/material/Slide';
import Fade from '@mui/material/Fade';
import Zoom from '@mui/material/Zoom';
import { Divider, Switch } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import { styled } from '@mui/system';
import useBackTo from 'util/useBackTo';
import { getMetadataFrom } from 'util/metadata';

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

const defaultReaderSettings = () => ({
    staticNav: false,
    showPageNumber: true,
    continuesPageGap: false,
    loadNextonEnding: false,
    readerType: 'ContinuesVertical',
} as IReaderSettings);

const getReaderSettingsFromMetadata = (
    meta?: IMetadata,
): IReaderSettings => ({
    ...getMetadataFrom(
        { meta },
        Object.entries(defaultReaderSettings()) as MetadataKeyValuePair[],
    ) as unknown as IReaderSettings,
});

export const getReaderSettingsFor = (
    { meta }: IMangaCard | IManga,
): IReaderSettings => getReaderSettingsFromMetadata(meta);

interface IProps {
    settings: IReaderSettings
    setSettingValue: (key: keyof IReaderSettings, value: string | boolean) => void
    manga: IManga | IMangaCard
    chapter: IChapter
    curPage: number
}

export default function ReaderNavBar(props: IProps) {
    const history = useHistory();
    const backTo = useBackTo();

    const {
        settings, setSettingValue, manga, chapter, curPage,
    } = props;

    const [drawerOpen, setDrawerOpen] = useState(settings.staticNav);
    const [hideOpenButton, setHideOpenButton] = useState(settings.staticNav);
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [settingsCollapseOpen, setSettingsCollapseOpen] = useState(true);

    const handleScroll = () => {
        const currentScrollPos = window.pageYOffset;

        if (Math.abs(currentScrollPos - prevScrollPos) > 20) {
            setHideOpenButton(currentScrollPos > prevScrollPos);
            setPrevScrollPos(currentScrollPos);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        const rootEl:HTMLDivElement = document.querySelector('#root')!;
        const mainContainer:HTMLDivElement = document.querySelector('#appMainContainer')!;

        // main container and root div need to change styles...
        rootEl.style.display = 'flex';
        mainContainer.style.display = 'none';

        return () => {
            rootEl.style.display = 'block';
            mainContainer.style.display = 'block';
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);// handleScroll changes on every render

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
                <Root sx={{
                    position: settings.staticNav ? 'sticky' : 'fixed',
                }}
                >
                    <header>
                        {!settings.staticNav
                        && (
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
                        )}
                        <Typography variant="h1" textOverflow="ellipsis" overflow="hidden" sx={{ py: 1 }}>
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
                                    variant="standard"
                                    value={settings.readerType}
                                    onChange={(e) => setSettingValue('readerType', e.target.value)}
                                    sx={{ p: 0 }}
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
                    <Divider sx={{ my: 1, mx: 2 }} />
                    <Navigation>
                        <span>
                            {`Currently on page ${curPage + 1} of ${chapter.pageCount}`}
                        </span>
                        <ChapterNavigation>
                            {chapter.index > 1
                        && (
                            <Link
                                replace
                                to={{ pathname: `/manga/${manga.id}/chapter/${chapter.index - 1}`, state: history.location.state }}
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
                            {chapter.index < chapter.chapterCount
                        && (
                            <Link
                                replace
                                style={{ gridArea: 'next' }}
                                to={{ pathname: `/manga/${manga.id}/chapter/${chapter.index + 1}`, state: history.location.state }}
                            >
                                <Button
                                    variant="outlined"
                                    endIcon={<KeyboardArrowRightIcon />}
                                >
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
                        onClick={() => setDrawerOpen(true)}
                        size="large"
                    >
                        <KeyboardArrowRightIcon />
                    </OpenDrawerButton>
                </Fade>
            </Zoom>
        </>
    );
}
