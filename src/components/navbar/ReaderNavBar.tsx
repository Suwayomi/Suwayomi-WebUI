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
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import Slide from '@mui/material/Slide';
import Fade from '@mui/material/Fade';
import Zoom from '@mui/material/Zoom';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { styled, useTheme } from '@mui/material/styles';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import { useTranslation } from 'react-i18next';
import { AllowedMetadataValueTypes, IReaderSettings } from '@/typings';
import { ReaderSettingsOptions } from '@/components/reader/ReaderSettingsOptions';
import { useBackButton } from '@/modules/core/hooks/useBackButton.ts';
import { Select } from '@/modules/core/components/inputs/Select.tsx';
import { useGetOptionForDirection } from '@/theme.tsx';
import { ChapterType } from '@/lib/graphql/generated/graphql.ts';
import { MangaChapterCountInfo, MangaIdInfo } from '@/modules/manga/services/Mangas.ts';
import { useNavBarContext } from '@/components/context/NavbarContext.tsx';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';
import { CustomIconButton } from '@/modules/core/components/buttons/CustomIconButton.tsx';
import { DirectionOffset } from '@/Base.types.ts';

const Root = styled('div')({
    zIndex: 10,
});

const NavContainer = styled('div')(({ theme }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    minWidth: '240px',
    maxWidth: '400px',
    height: '100vh',
    overflowY: 'auto',
    backgroundColor: theme.palette.background.default,

    '& header': {
        backgroundColor: theme.palette.action.hover,
        display: 'flex',
        alignItems: 'center',
        padding: `${theme.spacing(1)} ${theme.spacing(3)}`,

        transition: 'left 2s ease',
    },
}));

const Navigation = styled('div')(({ theme }) => ({
    margin: `0 ${theme.spacing(2)}`,
}));

const PageNavigation = styled('div')({
    display: 'flex',
    flexWrap: 'wrap',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
});

const ChapterNavigation = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateRows: 'auto auto auto',
    gridTemplateColumns: '0fr 1fr 0fr',
    gridTemplateAreas: '"pre current next"',
    gridColumnGap: theme.spacing(0.5),
    margin: `${theme.spacing(1)} 0`,

    '& a': {
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'center',
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
    openNextChapter: (offset: DirectionOffset) => void;
    retrievingNextChapter: boolean;
}

export function ReaderNavBar(props: IProps) {
    const { t } = useTranslation();
    const { setReaderNavBarWidth } = useNavBarContext();
    const theme = useTheme();
    const getOptionForDirection = useGetOptionForDirection();

    const navigate = useNavigate();
    const location = useLocation<{
        prevDrawerOpen?: boolean;
        prevSettingsCollapseOpen?: boolean;
    }>();
    const { prevDrawerOpen, prevSettingsCollapseOpen } = location.state ?? {};

    const navBarRef = useRef<HTMLDivElement | null>(null);
    useResizeObserver(
        navBarRef,
        useCallback(() => {
            if (navBarRef.current?.offsetWidth === undefined) {
                return;
            }

            setReaderNavBarWidth(navBarRef.current.offsetWidth);
        }, [navBarRef.current]),
    );
    useLayoutEffect(() => () => setReaderNavBarWidth(0), [navBarRef]);

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
                <NavContainer ref={navBarRef}>
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
                        <Typography
                            variant="h6"
                            component="h1"
                            sx={{
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                py: 1,
                                flexGrow: 1,
                            }}
                        >
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
                                sx={{ mx: 0.5 }}
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
                                    onClick={() => openNextChapter(DirectionOffset.PREVIOUS)}
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
                                    onClick={() => openNextChapter(DirectionOffset.NEXT)}
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
                        <CustomIconButton
                            sx={{
                                position: 'fixed',
                                top: 20,
                                left: 20,
                                backgroundColor: 'rgba(255, 255, 255, 0.75);',
                                color: 'black',
                                ...theme.applyStyles('dark', {
                                    backgroundColor: 'rgba(0, 0, 0, 0.75);',
                                    color: 'white',
                                }),
                            }}
                            size="large"
                            variant="contained"
                            onClick={() => updateDrawer(true)}
                        >
                            {getOptionForDirection(<KeyboardArrowRightIcon />, <KeyboardArrowLeftIcon />)}
                        </CustomIconButton>
                    </Tooltip>
                </Fade>
            </Zoom>
        </Root>
    );
}
