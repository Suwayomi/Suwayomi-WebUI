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
import { useEffect, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import Slide from '@mui/material/Slide';
import Fade from '@mui/material/Fade';
import Zoom from '@mui/material/Zoom';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import { useTranslation } from 'react-i18next';
import { AllowedMetadataValueTypes, ChapterOffset, IReaderSettings } from '@/typings';
import { ReaderSettingsOptions } from '@/components/reader/ReaderSettingsOptions';
import { useBackButton } from '@/util/useBackButton.ts';
import { Select } from '@/components/atoms/Select.tsx';
import { getOptionForDirection } from '@/theme.ts';
import { ChapterType } from '@/lib/graphql/generated/graphql.ts';
import { MangaChapterCountInfo, MangaIdInfo } from '@/lib/data/Mangas.ts';

const Root = styled('div')({
    zIndex: 10,
});

const NavContainer = styled('div')(({ theme }) => ({
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
    setSettingValue: (key: keyof IReaderSettings, value: AllowedMetadataValueTypes, persist?: boolean) => void;
    manga: MangaIdInfo & MangaChapterCountInfo;
    chapter: Pick<ChapterType, 'name' | 'sourceOrder' | 'pageCount'>;
    chapters: Pick<ChapterType, 'id' | 'sourceOrder' | 'name' | 'chapterNumber' | 'scanlator'>[];
    curPage: number;
    scrollToPage: (page: number) => void;
    openNextChapter: (offset: ChapterOffset) => void;
    retrievingNextChapter: boolean;
}

export function ReaderNavBar(props: IProps) {
    const { t } = useTranslation();

    const navigate = useNavigate();
    const location = useLocation<{
        prevDrawerOpen?: boolean;
        prevSettingsCollapseOpen?: boolean;
    }>();
    const { prevDrawerOpen, prevSettingsCollapseOpen } = location.state ?? {};

    const {
        settings,
        setSettingValue,
        manga,
        chapter,
        chapters,
        curPage,
        scrollToPage,
        openNextChapter,
        retrievingNextChapter,
    } = props;

    const handleBack = useBackButton();

    const hasMultipleScanlators = useMemo(
        () => new Set(chapters.map(({ scanlator }) => scanlator)).size > 1,
        [chapters],
    );

    const [drawerOpen, setDrawerOpen] = useState(settings.staticNav || prevDrawerOpen);
    const [updateDrawerOnRender, setUpdateDrawerOnRender] = useState(true);
    const [hideOpenButton, setHideOpenButton] = useState(settings.staticNav || prevDrawerOpen);
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [settingsCollapseOpen, setSettingsCollapseOpen] = useState(prevSettingsCollapseOpen ?? true);

    const disableChapterNavButtons = retrievingNextChapter;

    const updateSettingValue = (key: keyof IReaderSettings, value: AllowedMetadataValueTypes, persist?: boolean) => {
        // prevent closing the navBar when updating the "staticNav" setting
        setUpdateDrawerOnRender(key !== 'staticNav');
        setSettingValue(key, value, persist);
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
        rootEl.style.flexDirection = 'column';
        mainContainer.style.display = 'none';

        return () => {
            rootEl.style.display = 'block';
            mainContainer.style.display = 'block';
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]); // handleScroll changes on every render

    return (
        <Root>
            <Slide
                direction={getOptionForDirection('right', 'left')}
                in={drawerOpen}
                timeout={200}
                appear={false}
                mountOnEnter
                unmountOnExit
            >
                <NavContainer
                    sx={{
                        position: 'fixed',
                    }}
                >
                    <header>
                        {!settings.staticNav && (
                            <Tooltip title={t('reader.button.close_menu')}>
                                <IconButton
                                    edge="start"
                                    color="inherit"
                                    aria-label="menu"
                                    onClick={() => updateDrawer(false)}
                                    size="large"
                                >
                                    {getOptionForDirection(<KeyboardArrowLeftIcon />, <KeyboardArrowRightIcon />)}
                                </IconButton>
                            </Tooltip>
                        )}
                        <Typography variant="h1" textOverflow="ellipsis" overflow="hidden" sx={{ py: 1 }}>
                            {chapter.name}
                        </Typography>
                        <Tooltip title={t('reader.button.exit')}>
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                onClick={handleBack}
                                size="large"
                                sx={{ mr: -1 }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
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
                    </ListItem>
                    <Collapse in={settingsCollapseOpen} timeout="auto" unmountOnExit>
                        <ReaderSettingsOptions
                            setSettingValue={updateSettingValue}
                            staticNav={settings.staticNav}
                            showPageNumber={settings.showPageNumber}
                            loadNextOnEnding={settings.loadNextOnEnding}
                            skipDupChapters={settings.skipDupChapters}
                            fitPageToWindow={settings.fitPageToWindow}
                            scalePage={settings.scalePage}
                            readerType={settings.readerType}
                            offsetFirstPage={settings.offsetFirstPage}
                            readerWidth={settings.readerWidth}
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
                                    value={chapter.pageCount > -1 ? `${curPage}` : ''}
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
                            <Tooltip title={t('reader.button.previous_chapter')}>
                                <IconButton
                                    sx={{ gridArea: 'pre' }}
                                    disabled={disableChapterNavButtons || chapter.sourceOrder <= 1}
                                    onClick={() => openNextChapter(ChapterOffset.PREV)}
                                >
                                    {getOptionForDirection(<KeyboardArrowLeftIcon />, <KeyboardArrowRightIcon />)}
                                </IconButton>
                            </Tooltip>
                            <FormControl
                                sx={{ gridArea: 'current' }}
                                size="small"
                                disabled={disableChapterNavButtons || chapter.sourceOrder < 1}
                            >
                                <Select
                                    value={chapter.sourceOrder >= 1 ? `${chapter.sourceOrder}` : ''}
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
                                    {chapters.map(({ id, sourceOrder, name, chapterNumber, scanlator }) => (
                                        <MenuItem
                                            key={id}
                                            value={sourceOrder}
                                        >{`#${chapterNumber}${hasMultipleScanlators && scanlator != null ? ` (${scanlator})` : ''} | ${name}`}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Tooltip title={t('reader.button.next_chapter')}>
                                <IconButton
                                    sx={{ gridArea: 'next' }}
                                    disabled={
                                        disableChapterNavButtons ||
                                        chapter.sourceOrder < 1 ||
                                        chapter.sourceOrder >= manga.chapters.totalCount
                                    }
                                    onClick={() => openNextChapter(ChapterOffset.NEXT)}
                                >
                                    {getOptionForDirection(<KeyboardArrowRightIcon />, <KeyboardArrowLeftIcon />)}
                                </IconButton>
                            </Tooltip>
                        </ChapterNavigation>
                    </Navigation>
                </NavContainer>
            </Slide>
            <Zoom in={!drawerOpen}>
                <Fade in={!hideOpenButton}>
                    <Tooltip title={t('reader.button.open_menu')}>
                        <OpenDrawerButton
                            edge="start"
                            aria-label="menu"
                            disableRipple
                            disableFocusRipple
                            onClick={() => updateDrawer(true)}
                            size="large"
                        >
                            {getOptionForDirection(<KeyboardArrowRightIcon />, <KeyboardArrowLeftIcon />)}
                        </OpenDrawerButton>
                    </Tooltip>
                </Fade>
            </Zoom>
        </Root>
    );
}
