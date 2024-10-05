/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import Collapse from '@mui/material/Collapse';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useLayoutEffect, useRef, useState } from 'react';
import parseHtml from 'html-react-parser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import sanitizeHtml from 'sanitize-html';
import { SpinnerImage } from '@/modules/core/components/SpinnerImage.tsx';
import { TypographyMaxLines } from '@/modules/core/components/TypographyMaxLines.tsx';
import { Metadata } from '@/modules/core/components/Metadata.tsx';
import { MediaQuery } from '@/lib/ui/MediaQuery.tsx';
import { TTrackerManga } from '@/modules/tracker/services/Trackers.ts';

const TrackerMangaCardTitle = ({ title, selected }: { title: string; selected: boolean }) => (
    <Stack
        direction="row"
        sx={{
            gap: '5px',
            justifyContent: 'space-between',
        }}
    >
        <Tooltip title={title}>
            <TypographyMaxLines variant="h5" component="h1">
                {title}
            </TypographyMaxLines>
        </Tooltip>
        <CheckCircleIcon sx={{ visibility: selected ? 'visible' : 'hidden' }} color="primary" />
    </Stack>
);

const SUMMARY_COLLAPSED_SIZE = 50;
const TrackerMangaCardSummary = ({ summary }: { summary: string }) => {
    const { t } = useTranslation();

    const summaryRef = useRef<HTMLParagraphElement>(null);

    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [showSummaryExpandButton, setShowSummaryExpandButton] = useState(false);

    const summaryCollapsedSize = showSummaryExpandButton ? SUMMARY_COLLAPSED_SIZE : 0;

    useLayoutEffect(() => {
        const shouldCollapseSummary = (summaryRef.current?.clientHeight ?? 0) > SUMMARY_COLLAPSED_SIZE;

        setShowSummaryExpandButton(shouldCollapseSummary);
        setIsSummaryExpanded(!shouldCollapseSummary);
    }, []);
    return (
        <>
            {summary.length && (
                <Collapse collapsedSize={summaryCollapsedSize} in={isSummaryExpanded}>
                    <Typography ref={summaryRef} variant="body1" component="p">
                        {parseHtml(sanitizeHtml(summary, { disallowedTagsMode: 'escape' }))}
                    </Typography>
                </Collapse>
            )}
            {summary.length && showSummaryExpandButton && (
                <Button
                    component="div"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsSummaryExpanded(!isSummaryExpanded);
                    }}
                    onTouchStart={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {t(isSummaryExpanded ? 'global.button.show_less' : 'global.button.show_more')}
                </Button>
            )}
        </>
    );
};

const TrackerMangaCardLink = ({ children, url }: { children: React.ReactNode; url: string }) => (
    <Link
        href={url}
        rel="noreferrer"
        target="_blank"
        underline="none"
        color="inherit"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
    >
        {children}
    </Link>
);

export const TrackerMangaCard = ({
    manga,
    selected,
    onSelect,
}: {
    manga: TTrackerManga;
    selected: boolean;
    onSelect: () => void;
}) => {
    const { t } = useTranslation();
    const isMobileWidth = MediaQuery.useIsMobileWidth();

    return (
        <Card
            sx={{
                backgroundColor: 'background.default',
                marginBottom: 2,
                '&:last-child': { marginBottom: 8 },
            }}
        >
            <CardActionArea onClick={onSelect}>
                <CardContent sx={{ padding: '0', borderRadius: 'inherit' }}>
                    <Box
                        sx={{
                            padding: 1,
                            border: '3px solid',
                            borderRadius: 'inherit',
                            borderColor: selected ? 'primary.main' : 'transparent',
                        }}
                    >
                        <Stack
                            direction="row"
                            sx={{
                                gap: 2,
                                marginBottom: 2,
                            }}
                        >
                            <CardMedia
                                sx={{
                                    aspectRatio: '225/350',
                                    minWidth: '100px',
                                    width: '150px',
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                }}
                            >
                                <TrackerMangaCardLink url={manga.trackingUrl}>
                                    <SpinnerImage
                                        useFetchApi={false}
                                        alt={manga.title}
                                        src={manga.coverUrl}
                                        spinnerStyle={{ width: '100%', height: '100%' }}
                                        imgStyle={{
                                            width: '100%',
                                            height: isMobileWidth ? undefined : '100%',
                                            maxHeight: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </TrackerMangaCardLink>
                            </CardMedia>
                            <Stack direction="column" sx={{ width: '100%' }}>
                                <TrackerMangaCardLink url={manga.trackingUrl}>
                                    <TrackerMangaCardTitle title={manga.title} selected={selected} />
                                </TrackerMangaCardLink>
                                <Metadata title={t('global.label.type')} value={manga.publishingType} />
                                <Metadata title={t('global.label.started')} value={manga.startDate} />
                                <Metadata title={t('manga.label.status')} value={manga.publishingStatus} />
                            </Stack>
                        </Stack>
                        <TrackerMangaCardSummary summary={manga.summary} />
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};
