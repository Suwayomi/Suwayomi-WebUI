/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import Slide from '@mui/material/Slide';
import Fade from '@mui/material/Fade';
import Zoom from '@mui/material/Zoom';
import { Divider, FormControl, MenuItem, Select, styled } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Collapse from '@mui/material/Collapse';
import { useTranslation } from 'react-i18next';
import { ChapterOffset, IChapter, IManga, IMangaCard, IReaderSettings } from '@/typings';
import ReaderSettingsOptions from '@/components/reader/ReaderSettingsOptions';

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

const PageNavigation = styled('div')({
    display: 'flex',
    flexWrap: 'wrap',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
});

const ChapterNavigation = styled('div')({
    display: 'grid',
    gridTemplateRows: 'auto auto auto',
    gridTemplateColumns: '0fr 1fr 0fr',
    gridTemplateAreas: '"pre current next"',
    gridColumnGap: '5px',
    margin: '10px 0',

    '& a': {
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'center',
    },
});

const MenuProps = { PaperProps: { style: { maxHeight: 150 } } };

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
    scrollToPage: (page: number) => void;
    openNextChapter: (offset: ChapterOffset, setHistory: (nextChapterIndex: number) => void) => Promise<void>;
    retrievingNextChapter: boolean;
}

export default function ReaderNavBar(props: IProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation<{
        prevDrawerOpen?: boolean;
        prevSettingsCollapseOpen?: boolean;
    }>();
    const { prevDrawerOpen, prevSettingsCollapseOpen } = location.state ?? {};

    const { settings, setSettingValue, manga, chapter, curPage, scrollToPage, openNextChapter, retrievingNextChapter } =
        props;

    const [drawerOpen, setDrawerOpen] = useState(settings.staticNav || prevDrawerOpen);
    const [updateDrawerOnRender, setUpdateDrawerOnRender] = useState(true);
    const [hideOpenButton, setHideOpenButton] = useState(settings.staticNav || prevDrawerOpen);
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [settingsCollapseOpen, setSettingsCollapseOpen] = useState(prevSettingsCollapseOpen ?? true);

    const disableChapterNavButtons = retrievingNextChapter;

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
        const isLastPageInHistory = location.key === 'default';

        if (isLastPageInHistory) {
            navigate(`/manga/${manga.id}`);
            return;
        }

        // this works because opening previous/next chapter will replace the current history element.
        // in case this gets changed this has to be updated
        navigate(-1);
    };

    return (
        <>
            <Slide direction="right" in={drawerOpen} timeout={200} appear={false} mountOnEnter unmountOnExit>
                <Root
                    sx={{
                        position: 'fixed',
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
                        <ListItemText primary={t('reader.settings.title.reader_settings')} />
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
                            skipDupChapters={settings.skipDupChapters}
                            fitPageToWindow={settings.fitPageToWindow}
                            readerType={settings.readerType}
                            offsetDoubleSpreads={settings.offsetDoubleSpreads}
                        />
                    </Collapse>
                    <Divider sx={{ my: 1, mx: 2 }} />
                    <Navigation>
                        <PageNavigation>
                            <span>{t('reader.page_info.label.currently_on_page')}</span>
                            <FormControl
                                size="small"
                                sx={{ margin: '0 5px' }}
                                disabled={disableChapterNavButtons || chapter.pageCount === -1}
                            >
                                <Select
                                    MenuProps={MenuProps}
                                    value={chapter.pageCount > -1 ? curPage : ''}
                                    displayEmpty
                                    onChange={({ target: { value: selectedPage } }) => {
                                        scrollToPage(Number(selectedPage));
                                    }}
                                >
                                    {Array(Math.max(0, chapter.pageCount))
                                        .fill(1)
                                        .map((ignoreValue, index) => (
                                            // eslint-disable-next-line react/no-array-index-key
                                            <MenuItem key={`Page#${index}`} value={index}>
                                                {index + 1}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                            <span>{t('reader.page_info.label.of_max_pages', { maxPages: chapter.pageCount })}</span>
                        </PageNavigation>
                        <ChapterNavigation>
                            <IconButton
                                title={t('reader.button.previous_chapter')}
                                sx={{ gridArea: 'pre' }}
                                disabled={disableChapterNavButtons || chapter.index <= 1}
                                onClick={() =>
                                    openNextChapter(ChapterOffset.PREV, (prevChapterIndex) => {
                                        navigate(`/manga/${manga.id}/chapter/${prevChapterIndex}`, {
                                            replace: true,
                                            state: {
                                                prevDrawerOpen: drawerOpen,
                                                prevSettingsCollapseOpen: settingsCollapseOpen,
                                            },
                                        });
                                    })
                                }
                            >
                                <KeyboardArrowLeftIcon />
                            </IconButton>
                            <FormControl
                                sx={{ gridArea: 'current' }}
                                size="small"
                                disabled={disableChapterNavButtons || chapter.index < 1}
                            >
                                <Select
                                    MenuProps={MenuProps}
                                    value={chapter.index >= 1 ? chapter.index : ''}
                                    displayEmpty
                                    onChange={({ target: { value: selectedChapter } }) => {
                                        navigate(`/manga/${manga.id}/chapter/${selectedChapter}`, {
                                            replace: true,
                                            state: {
                                                prevDrawerOpen: drawerOpen,
                                                prevSettingsCollapseOpen: settingsCollapseOpen,
                                            },
                                        });
                                    }}
                                >
                                    {Array(Math.max(0, chapter.chapterCount))
                                        .fill(1)
                                        .map((ignoreValue, index) => (
                                            <MenuItem key={`Chapter#${index + 1}`} value={index + 1}>{`${t(
                                                'chapter.title',
                                            )} ${index + 1}`}</MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                            <IconButton
                                title={t('reader.button.next_chapter')}
                                sx={{ gridArea: 'next' }}
                                disabled={
                                    disableChapterNavButtons ||
                                    chapter.index < 1 ||
                                    chapter.index >= chapter.chapterCount
                                }
                                onClick={() => {
                                    openNextChapter(ChapterOffset.NEXT, (nextChapterIndex) =>
                                        navigate(`/manga/${manga.id}/chapter/${nextChapterIndex}`, {
                                            replace: true,
                                            state: {
                                                prevDrawerOpen: drawerOpen,
                                                prevSettingsCollapseOpen: settingsCollapseOpen,
                                            },
                                        }),
                                    );
                                }}
                            >
                                <KeyboardArrowRightIcon />
                            </IconButton>
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
