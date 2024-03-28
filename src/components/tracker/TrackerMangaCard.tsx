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
import {
    Box,
    CardActionArea,
    CardMedia,
    Collapse,
    Link,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useLayoutEffect, useRef, useState } from 'react';
import parseHtml from 'html-react-parser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { SpinnerImage } from '@/components/util/SpinnerImage.tsx';
import { TrackerManga } from '@/lib/data/Trackers.ts';

const TrackerMangaCardTitle = ({ title, selected }: { title: string; selected: boolean }) => (
    <Stack direction="row" gap="5px" justifyContent="space-between">
        <Typography variant="h5" component="h1">
            {title}
        </Typography>
        {selected && <CheckCircleIcon color="primary" />}
    </Stack>
);

const TrackerMangaCardInfo = ({ title, value }: { title: string; value: string }) => (
    <Stack direction="row" gap="5px" flexWrap="wrap">
        <Typography variant="body1">{title}</Typography>
        <Typography variant="body1" color="text.secondary">
            {value}
        </Typography>
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
                        {parseHtml(summary)}
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
    manga: TrackerManga;
    selected: boolean;
    onSelect: () => void;
}) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobileWidth = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Card
            sx={{
                marginBottom: '15px',
                '&:last-child': { marginBottom: '60px' },
            }}
        >
            <CardActionArea onClick={onSelect}>
                <CardContent sx={{ padding: '0', borderRadius: 'inherit' }}>
                    <Box
                        sx={{
                            padding: '10px',
                            border: '3px solid',
                            borderRadius: 'inherit',
                            borderColor: selected ? theme.palette.primary.main : 'transparent',
                        }}
                    >
                        <Stack direction="row" gap="15px" marginBottom="15px">
                            <CardMedia
                                sx={{
                                    aspectRatio: '225/350',
                                    minWidth: '100px',
                                    width: '150px',
                                    borderRadius: '4px',
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
                                <TrackerMangaCardInfo title={t('global.label.type')} value={manga.publishingType} />
                                <TrackerMangaCardInfo title={t('global.label.started')} value={manga.startDate} />
                                <TrackerMangaCardInfo title={t('manga.label.status')} value={manga.publishingStatus} />
                            </Stack>
                        </Stack>
                        <TrackerMangaCardSummary summary={manga.summary} />
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};
