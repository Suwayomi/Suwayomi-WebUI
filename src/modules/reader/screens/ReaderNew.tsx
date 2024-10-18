/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { useEffect, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    getReaderSettingsFor,
    useDefaultReaderSettings,
} from '@/modules/reader-deprecated/services/ReaderSettingsMetadata.ts';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { MediaQuery } from '@/modules/core/utils/MediaQuery.tsx';
import { ReaderOverlay } from '@/modules/reader/components/overlay/ReaderOverlay.tsx';
import { ReaderProgressBarProps } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { useReaderOverlayContext } from '@/modules/reader/contexts/ReaderOverlayContext.tsx';
import { useReaderTapZoneContext } from '@/modules/reader/contexts/ReaderTapZoneContext.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { GetChaptersReaderQuery, GetMangaReaderQuery } from '@/lib/graphql/generated/graphql.ts';
import { GET_MANGA_READER } from '@/lib/graphql/queries/MangaQuery.ts';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { useReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';
import { userReaderStatePagesContext } from '@/modules/reader/contexts/state/ReaderStatePagesContext.tsx';
import { useReaderStateChaptersContext } from '@/modules/reader/contexts/state/ReaderStateChaptersContext.tsx';
import { GET_CHAPTERS_READER } from '@/lib/graphql/queries/ChapterQuery.ts';
import { Chapters } from '@/modules/chapter/services/Chapters.ts';
import { DirectionOffset } from '@/Base.types.ts';
import { TapZoneLayout } from '@/modules/reader/components/TapZoneLayout.tsx';
import { ReaderTapZoneService } from '@/modules/reader/services/ReaderTapZoneService.ts';
import { TapZoneRegionType } from '@/modules/reader/types/TapZoneLayout.types.ts';
import { getNextPageIndex, getPage } from '@/modules/reader/utils/ReaderProgressBar.utils.tsx';

const pages: ReaderProgressBarProps['pages'] = [
    [[0], '1', true],
    [[1], '2', true],
    [[2], '3', true],
    [[3, 4], '4-5', false],
    [[5, 6], '6-7', true],
    [[7, 8], '8-9', true],
    [[9], '10', false],
    [[10], '11', false],
    [[11, 12], '12-13', false],
    [[13, 14], '14-15', true],
    // [[15, 16], '16-17', true],
    // [[17], '18', true],
    // [[18], '19', true],
    // [[19], '20', true],
    // [[20], '21', true],
    // [[21], '22', true],
    // [[22], '23', true],
    // [[23], '24', true],
    // [[24], '25', true],
    // [[25], '26', true],
    // [[26], '27', true],
    // [[27], '28', true],
    // [[28], '29', true],
    // [[29], '30', false],
    // [[30], '31', false],
    // [[31], '32', false],
    // [[32], '33', false],
    // [[33], '34', true],
    // [[34], '35', true],
    // [[35], '36', true],
    // [[36], '37', true],
    // [[37], '38', true],
    // [[38], '39', true],
    // [[39], '40', true],
    // [[40], '41', true],
    // [[41], '42', true],
    // [[42], '43', true],
    // [[43], '44', false],
    // [[44], '45', false],
    // [[45], '46', true],
    // [[46], '47', true],
    // [[47], '48', true],
    // [[48], '49', true],
    // [[49], '50', true],
    // [[50], '51', true],
    // [[51], '52', true],
    // [[52], '53', true],
    // [[53], '54', true],
    // [[54], '55', true],
    // [[55], '56', true],
    // [[56], '57', true],
    // [[57], '58', true],
    // [[58], '59', false],
    // [[59], '60', false],
    // [[60], '61', false],
    // [[61], '62', false],
    // [[62], '63', false],
    // [[63], '64', false],
    // [[64], '65', false],
    // [[65], '66', false],
    // [[66], '67', true],
    // [[67], '68', true],
    // [[68], '69', true],
    // [[69], '70', true],
    // [[70], '71', true],
    // [[71], '72', false],
    // [[72], '73', false],
    // [[73], '74', false],
    // [[74], '75', true],
    // [[75], '76', true],
    // [[76], '77', true],
    // [[77], '78', true],
    // [[78], '79', true],
    // [[79], '80', true],
    // [[80], '81', true],
    // [[81], '82', true],
    // [[82], '83', true],
    // [[83], '84', true],
    // [[84], '85', true],
    // [[85], '86', true],
    // [[86], '87', true],
    // [[87], '88', true],
    // [[88], '89', true],
    // [[89], '90', true],
    // [[90], '91', true],
    // [[91], '92', true],
    // [[92], '93', true],
    // [[93], '94', true],
    // [[94], '95', true],
    // [[95], '96', true],
    // [[96], '97', true],
    // [[97], '98', true],
    // [[98], '99', true],
    // [[99], '100', true],
    // [[100], '101', true],
    // [[101], '102', true],
    // [[102], '103', true],
    // [[103], '104', true],
    // [[104], '105', true],
    // [[105], '106', true],
    // [[106], '107', true],
    // [[107], '108', true],
    // [[108], '109', true],
    // [[109], '110', true],
    // [[110], '111', true],
    // [[111], '112', true],
    // [[112], '113', true],
    // [[113], '114', true],
    // [[114], '115', true],
    // [[115], '116', true],
    // [[116], '117', true],
    // [[117], '118', true],
    // [[118], '119', true],
    // [[119], '120', true],
    // [[120], '121', true],
    // [[121], '122', true],
    // [[122], '123', true],
    // [[123], '124', true],
    // [[124], '125', true],
    // [[125], '126', true],
    // [[126], '127', true],
    // [[127], '128', true],
    // [[128], '129', true],
    // [[129], '130', true],
    // [[130], '131', true],
    // [[131], '132', true],
    // [[132], '133', true],
    // [[133], '134', true],
    // [[134], '135', true],
    // [[135], '136', true],
    // [[136], '137', true],
    // [[137], '138', true],
    // [[138], '139', true],
    // [[139], '140', true],
    // [[140], '141', true],
    // [[141], '142', true],
    // [[142], '143', true],
    // [[143], '144', true],
    // [[144], '145', true],
    // [[145], '146', true],
    // [[146], '147', true],
    // [[147], '148', true],
    // [[148], '149', true],
    // [[149], '150', true],
    // [[150], '151', true],
    // [[151], '152', true],
    // [[152], '153', true],
    // [[153], '154', true],
    // [[154], '155', true],
    // [[155], '156', true],
    // [[156], '157', true],
    // [[157], '158', true],
    // [[158], '159', true],
    // [[159], '160', true],
    // [[160], '161', true],
    // [[161], '162', true],
    // [[162], '163', true],
    // [[163], '164', true],
    // [[164], '165', true],
    // [[165], '166', true],
    // [[166], '167', true],
    // [[167], '168', true],
    // [[168], '169', true],
    // [[169], '170', true],
    // [[170], '171', true],
    // [[171], '172', true],
    // [[172], '173', true],
    // [[173], '174', true],
    // [[174], '175', true],
    // [[175], '176', true],
    // [[176], '177', true],
    // [[177], '178', true],
    // [[178], '179', true],
    // [[179], '180', true],
    // [[180], '181', true],
    // [[181], '182', true],
    // [[182], '183', true],
    // [[183], '184', true],
    // [[184], '185', true],
    // [[185], '186', true],
    // [[186], '187', true],
    // [[187], '188', true],
    // [[188], '189', true],
    // [[189], '190', true],
    // [[190], '191', true],
    // [[191], '192', true],
    // [[192], '193', true],
    // [[193], '194', true],
    // [[194], '195', true],
    // [[195], '196', true],
    // [[196], '197', true],
    // [[197], '198', true],
    // [[198], '199', true],
    // [[199], '200', true],
    // [[200], '201', true],
    // [[201], '202', true],
    // [[202], '203', true],
    // [[203], '204', true],
    // [[204], '205', true],
    // [[205], '206', true],
    // [[206], '207', true],
    // [[207], '208', true],
    // [[208], '209', true],
    // [[209], '210', true],
    // [[210], '211', true],
    // [[211], '212', true],
    // [[212], '213', true],
    // [[213], '214', true],
    // [[214], '215', true],
    // [[215], '216', true],
    // [[216], '217', true],
    // [[217], '218', true],
    // [[218], '219', true],
    // [[219], '220', true],
    // [[220], '221', true],
    // [[221], '222', true],
    // [[222], '223', true],
    // [[223], '224', true],
    // [[224], '225', true],
    // [[225], '226', true],
    // [[226], '227', true],
    // [[227], '228', true],
    // [[228], '229', true],
    // [[229], '230', true],
    // [[230], '231', true],
    // [[231], '232', true],
    // [[232], '233', true],
    // [[233], '234', true],
    // [[234], '235', true],
    // [[235], '236', true],
    // [[236], '237', true],
    // [[237], '238', true],
    // [[238], '239', true],
    // [[239], '240', true],
    // [[240], '241', true],
    // [[241], '242', true],
    // [[242], '243', true],
    // [[243], '244', true],
    // [[244], '245', true],
    // [[245], '246', true],
    // [[246], '247', true],
    // [[247], '248', true],
    // [[248], '249', true],
    // [[249], '250', true],
    // [[250], '251', true],
    // [[251], '252', true],
    // [[252], '253', true],
    // [[253], '254', true],
    // [[254], '255', true],
    // [[255], '256', true],
    // [[256], '257', true],
    // [[257], '258', true],
    // [[258], '259', true],
    // [[259], '260', true],
    // [[260], '261', true],
    // [[261], '262', true],
    // [[262], '263', true],
    // [[263], '264', true],
    // [[264], '265', true],
    // [[265], '266', true],
    // [[266], '267', true],
    // [[267], '268', true],
    // [[268], '269', true],
    // [[269], '270', true],
    // [[270], '271', true],
    // [[271], '272', true],
    // [[272], '273', true],
    // [[273], '274', true],
    // [[274], '275', true],
    // [[275], '276', true],
    // [[276], '277', true],
    // [[277], '278', true],
    // [[278], '279', true],
    // [[279], '280', true],
    // [[280], '281', true],
    // [[281], '282', true],
    // [[282], '283', true],
    // [[283], '284', true],
    // [[284], '285', true],
    // [[285], '286', true],
    // [[286], '287', true],
    // [[287], '288', true],
    // [[288], '289', true],
    // [[289], '290', true],
    // [[290], '291', true],
    // [[291], '292', true],
    // [[292], '293', true],
    // [[293], '294', true],
    // [[294], '295', true],
    // [[295], '296', true],
    // [[296], '297', true],
    // [[297], '298', true],
    // [[298], '299', true],
    // [[299], '300', true],
    // [[300], '301', true],
    // [[301], '302', true],
    // [[302], '303', true],
    // [[303], '304', true],
    // [[304], '305', true],
    // [[305], '306', true],
    // [[306], '307', true],
    // [[307], '308', true],
    // [[308], '309', true],
    // [[309], '310', true],
    // [[310], '311', true],
    // [[311], '312', true],
    // [[312], '313', true],
    // [[313], '314', true],
    // [[314], '315', true],
    // [[315], '316', true],
    // [[316], '317', true],
    // [[317], '318', true],
    // [[318], '319', true],
    // [[319], '320', true],
    // [[320], '321', true],
    // [[321], '322', true],
    // [[322], '323', true],
    // [[323], '324', true],
    // [[324], '325', true],
    // [[325], '326', true],
];
const totalPages = pages.slice(-1)[0][0][0];

export const ReaderNew = () => {
    const { t } = useTranslation();
    const { setOverride, readerNavBarWidth } = useNavBarContext();
    const { isVisible: isOverlayVisible, setIsVisible: setIsOverlayVisible } = useReaderOverlayContext();
    const { setManga } = useReaderStateMangaContext();
    const { setReaderStateChapters } = useReaderStateChaptersContext();
    const { setTotalPages, setPages, currentPageIndex, setCurrentPageIndex } = userReaderStatePagesContext();
    const { showPreview } = useReaderTapZoneContext();

    const scrollbarHeight = MediaQuery.useGetScrollbarSize('height');
    const { chapterIndex: paramChapterIndex, mangaId: paramMangaId } = useParams<{
        chapterIndex: string;
        mangaId: string;
    }>();
    const chapterIndex = Number(paramChapterIndex);
    const mangaId = Number(paramMangaId);

    const mangaResponse = requestManager.useGetManga<GetMangaReaderQuery>(GET_MANGA_READER, mangaId);
    const chaptersResponse = requestManager.useGetMangaChapters<GetChaptersReaderQuery>(GET_CHAPTERS_READER, mangaId);

    const {
        settings: defaultSettings,
        request: { loading: areDefaultSettingsLoading, error: defaultSettingsError, refetch: refetchDefaultSettings },
    } = useDefaultReaderSettings();
    const settings = getReaderSettingsFor(mangaResponse.data?.manga, defaultSettings);

    const isLoading = mangaResponse.loading || chaptersResponse.loading || areDefaultSettingsLoading;
    const error = mangaResponse.error ?? chaptersResponse.error ?? defaultSettingsError;

    useEffect(() => {
        setManga(mangaResponse.data?.manga);
        setTotalPages(totalPages);
        setPages(pages);
        setCurrentPageIndex(4);
    }, [mangaResponse.data?.manga]);

    useEffect(() => {
        const chapters = chaptersResponse.data?.chapters.nodes;
        const currentChapter = chapters?.[chapters.length - chapterIndex];

        setReaderStateChapters({
            chapters: chapters ?? [],
            currentChapter,
            nextChapter: currentChapter && Chapters.getNextChapter(currentChapter, chapters),
            previousChapter:
                currentChapter &&
                Chapters.getNextChapter(currentChapter, chapters, { offset: DirectionOffset.PREVIOUS }),
        });
    }, [chaptersResponse.data, chapterIndex]);

    useLayoutEffect(() => {
        setOverride({
            status: true,
            value: null,
        });

        return () => setOverride({ status: false, value: null });
    }, []);

    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={error.message}
                retry={() => {
                    if (mangaResponse.error) {
                        mangaResponse.refetch().catch(defaultPromiseErrorHandler('Reader::refetchManga'));
                    }

                    if (defaultSettingsError) {
                        refetchDefaultSettings().catch(defaultPromiseErrorHandler('Reader::refetchDefaultSettings'));
                    }

                    if (chaptersResponse.error) {
                        chaptersResponse.refetch().catch(defaultPromiseErrorHandler('Reader::refetchChapters'));
                    }
                    //
                    // if (chaptersError) {
                    //     refetchChapters().catch(defaultPromiseErrorHandler('Reader::refetchChapters'));
                    // }
                    //
                    // if (pagesError) {
                    //     doFetchPages();
                    // }
                }}
            />
        );
    }

    if (!mangaResponse.data || !chaptersResponse.data) {
        return null;
    }

    return (
        <>
            <Box
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left; // x position within the element.
                    const y = e.clientY - rect.top; // y position within the element.
                    const action = ReaderTapZoneService.getAction(x, y);

                    // eslint-disable-next-line default-case
                    switch (action) {
                        case TapZoneRegionType.MENU:
                            setIsOverlayVisible(!isOverlayVisible);
                            break;
                        case TapZoneRegionType.PREVIOUS:
                            setCurrentPageIndex(
                                getNextPageIndex('previous', getPage(currentPageIndex, pages)[2], pages),
                            );
                            break;
                        case TapZoneRegionType.NEXT:
                            setCurrentPageIndex(getNextPageIndex('next', getPage(currentPageIndex, pages)[2], pages));
                            break;
                    }
                }}
                sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignContent: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: `calc((100vw - (100vw - 100%)) - ${readerNavBarWidth}px)`, // 100vw = width excluding scrollbar; 100% = width including scrollbar
                    minHeight: `calc(100vh - ${scrollbarHeight}px)`,
                    marginLeft: `${readerNavBarWidth}px`,
                    transition: (theme) =>
                        `min-width 0.${theme.transitions.duration.shortest}s, margin-left 0.${theme.transitions.duration.shortest}s`,
                }}
            >
                <img src="http://localhost:4567/api/v1/manga/30622/chapter/1131/page/0" />
                <TapZoneLayout />
            </Box>
            <ReaderOverlay
                isVisible={isOverlayVisible}
                setIsVisible={setIsOverlayVisible}
                manga={mangaResponse.data.manga}
                chapter={
                    chaptersResponse.data.chapters.nodes[chaptersResponse.data.chapters.nodes.length - chapterIndex]
                }
            />
        </>
    );
};
