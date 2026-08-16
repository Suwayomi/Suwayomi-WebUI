/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { pythonApolloClient } from '@/features/manga-explore/PythonGraphQLClient.ts';

import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';

const GET_MANGA_EXPLORE_DETAIL = gql`
    query GetMangaExploreDetail($id: Int!) {
        media(id: $id) {
            id
            title {
                english
                romaji
                native
            }
            cover_image
            description
            status
            format
            average_score
            episodes
            genres {
                genre_id
                name
            }
            media_metadata {
                start_date
                end_date
                status
                format
                chapters
                volumes
                popularity
            }
            relations {
                id
                type
                title {
                    english
                    romaji
                }
                cover_image
            }
            recommendations {
                id
                type
                title {
                    english
                    romaji
                }
                cover_image
            }
        }
    }
`;

interface MangaExploreDetailData {
    media?: {
        id: number;
        title?: {
            english?: string;
            romaji?: string;
            native?: string;
        };
        cover_image?: string;
        description?: string;
        status?: string;
        format?: string;
        average_score?: number;
        episodes?: number;
        genres?: Array<{
            genre_id: number;
            name: string;
        }>;
        media_metadata?: {
            start_date?: string;
            end_date?: string;
            status?: string;
            format?: string;
            chapters?: number;
            volumes?: number;
            popularity?: number;
        };
        relations?: Array<{
            id: number;
            type: string;
            title?: {
                english?: string;
                romaji?: string;
            };
            cover_image?: string;
        }>;
        recommendations?: Array<{
            id: number;
            type: string;
            title?: {
                english?: string;
                romaji?: string;
            };
            cover_image?: string;
        }>;
    };
}

export const MangaExploreDetailScreen: React.FC = () => {
    const { mangaId } = useParams<{ mangaId: string }>();
    const navigate = useNavigate();

    const { data, loading, error } = useQuery<MangaExploreDetailData>(GET_MANGA_EXPLORE_DETAIL, {
        variables: { id: mangaId ? parseInt(mangaId, 10) : undefined },
        client: pythonApolloClient,
        skip: !mangaId,
    });

    const manga = data?.media;
    const title = manga?.title?.english || manga?.title?.romaji || manga?.title?.native || 'Manga Details';
    useAppTitle(title);

    const handleSearchInExtensions = (searchTitle: string) => {
        navigate(AppRoutes.sources.children.searchAll.path(searchTitle));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !manga) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                    Failed to load manga details.
                </Typography>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(AppRoutes.mangaExplore.path)}>
                    Back to Catalog
                </Button>
            </Box>
        );
    }

    const relations = manga.relations || [];
    const recommendations = manga.recommendations || [];

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ mb: 4 }}>
                <Box sx={{ minWidth: 220, maxWidth: 260, mx: { xs: 'auto', md: 0 } }}>
                    <CardMedia
                        component="img"
                        image={manga.cover_image || '/placeholder.png'}
                        alt={title}
                        sx={{ borderRadius: 2, boxShadow: 3, height: 360, objectFit: 'cover' }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SearchIcon />}
                        onClick={() => handleSearchInExtensions(title)}
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Find in Extensions
                    </Button>
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {title}
                    </Typography>
                    {manga.title?.romaji && manga.title.english && (
                        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                            {manga.title.romaji}
                        </Typography>
                    )}

                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {manga.format && <Chip label={manga.format} color="primary" variant="outlined" size="small" />}
                        {manga.status && (
                            <Chip label={manga.status} color="secondary" variant="outlined" size="small" />
                        )}
                        {manga.average_score && (
                            <Chip label={`★ ${manga.average_score}`} color="warning" size="small" />
                        )}
                        {manga.media_metadata?.chapters && (
                            <Chip label={`${manga.media_metadata.chapters} Chapters`} size="small" />
                        )}
                        {manga.media_metadata?.volumes && (
                            <Chip label={`${manga.media_metadata.volumes} Volumes`} size="small" />
                        )}
                    </Stack>

                    {manga.genres && manga.genres.length > 0 && (
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5, mb: 3 }}>
                            {manga.genres.map((genre) => (
                                <Chip
                                    key={genre.genre_id}
                                    label={genre.name}
                                    size="small"
                                    clickable
                                    onClick={() =>
                                        navigate(
                                            `${AppRoutes.mangaExplore.path}?genre=${encodeURIComponent(genre.name)}`,
                                        )
                                    }
                                />
                            ))}
                        </Stack>
                    )}

                    {manga.description && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Synopsis
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}
                            >
                                {manga.description.replaceAll(/<[^>]*>?/gm, '')}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Stack>

            {/* Relations Section */}
            {relations.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                        Relations
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
                        {relations.map((rel) => {
                            const relTitle = rel.title?.english || rel.title?.romaji || 'Unknown Title';
                            return (
                                <Card
                                    key={rel.id}
                                    sx={{
                                        minWidth: 140,
                                        maxWidth: 140,
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'translateY(-4px)' },
                                    }}
                                    onClick={() => navigate(AppRoutes.mangaExplore.children.detail.path(rel.id))}
                                >
                                    <CardMedia
                                        component="img"
                                        height="190"
                                        image={rel.cover_image || '/placeholder.png'}
                                        alt={relTitle}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            {rel.type}
                                        </Typography>
                                        <Typography variant="body2" noWrap title={relTitle} sx={{ fontWeight: 'bold' }}>
                                            {relTitle}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Stack>
                </Box>
            )}

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                        Recommendations
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
                        {recommendations.map((rec) => {
                            const recTitle = rec.title?.english || rec.title?.romaji || 'Unknown Title';
                            return (
                                <Card
                                    key={rec.id}
                                    sx={{
                                        minWidth: 140,
                                        maxWidth: 140,
                                        cursor: 'pointer',
                                        flexShrink: 0,
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'translateY(-4px)' },
                                    }}
                                    onClick={() => navigate(AppRoutes.mangaExplore.children.detail.path(rec.id))}
                                >
                                    <CardMedia
                                        component="img"
                                        height="190"
                                        image={rec.cover_image || '/placeholder.png'}
                                        alt={recTitle}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                        <Typography variant="body2" noWrap title={recTitle} sx={{ fontWeight: 'bold' }}>
                                            {recTitle}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Stack>
                </Box>
            )}
        </Box>
    );
};
