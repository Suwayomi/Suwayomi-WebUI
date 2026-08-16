/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useMemo } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';

import { pythonApolloClient } from '@/features/manga-explore/PythonGraphQLClient.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';

const SEARCH_MANGA_QUERY = gql`
    query SearchManga($q: String, $format: String, $status: String, $sort: String, $page: Int, $genres: [String!]) {
        search(
            q: $q
            type: "manga"
            format: $format
            status: $status
            sort: $sort
            page: $page
            genres: $genres
            limit: 24
        ) {
            results {
                id
                title {
                    english
                    romaji
                }
                cover_image
                average_score
                status
                format
                genres {
                    genre_id
                    name
                }
            }
            totalPages
            page
        }
    }
`;

const GET_GENRES_QUERY = gql`
    query GetGenresList {
        genresList
    }
`;

interface SearchMangaQueryData {
    search?: {
        results?: Array<{
            id: string;
            title?: {
                english?: string;
                romaji?: string;
            };
            cover_image?: string;
            average_score?: number;
            status?: string;
            format?: string;
            genres?: Array<{
                genre_id: number;
                name: string;
            }>;
        }>;
        totalPages?: number;
        page?: number;
    };
}

interface GenresListData {
    genresList?: string[];
}

export const MangaExploreScreen: React.FC = () => {
    useAppTitle('Manga Explorer');
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Direct single source of truth from URL params
    const searchQuery = searchParams.get('q') || '';
    const format = searchParams.get('format') || '';
    const status = searchParams.get('status') || '';
    const sort = searchParams.get('sort') || 'POPULARITY_DESC';
    const selectedGenre = searchParams.get('genre') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);

    // Load available genres for dropdown
    const { data: genresData } = useQuery<GenresListData>(GET_GENRES_QUERY, {
        client: pythonApolloClient,
    });

    const genresList = useMemo(() => genresData?.genresList || [], [genresData]);

    // Unified param updater
    const updateParams = (updates: Record<string, string | undefined>) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, val]) => {
            if (val && val !== '') {
                next.set(key, val);
            } else {
                next.delete(key);
            }
        });
        setSearchParams(next);
    };

    // Search Manga Query
    const { data, loading } = useQuery<SearchMangaQueryData>(SEARCH_MANGA_QUERY, {
        variables: {
            q: searchQuery || undefined,
            format: format || undefined,
            status: status || undefined,
            sort: sort || undefined,
            genres: selectedGenre ? [selectedGenre] : undefined,
            page,
        },
        client: pythonApolloClient,
    });

    const results = data?.search?.results || [];
    const totalPages = data?.search?.totalPages || 1;

    const handleMangaClick = (mangaId: number | string) => {
        navigate(AppRoutes.mangaExplore.children.detail.path(mangaId));
    };

    const handleResetAllFilters = () => {
        setSearchParams(new URLSearchParams());
    };

    const hasActiveFilters = Boolean(searchQuery || format || status || selectedGenre || sort !== 'POPULARITY_DESC');

    const renderMangaGrid = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
                    <CircularProgress size={48} thickness={4} />
                </Box>
            );
        }

        if (results.length === 0) {
            return (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        borderRadius: 3,
                        my: 4,
                        bgcolor: 'background.default',
                    }}
                >
                    <Typography variant="h6" color="text.primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                        No Manga Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Try adjusting your search terms or filter selections.
                    </Typography>
                    {hasActiveFilters && (
                        <Button
                            variant="contained"
                            size="medium"
                            startIcon={<RestartAltIcon />}
                            onClick={handleResetAllFilters}
                        >
                            Reset All Filters
                        </Button>
                    )}
                </Paper>
            );
        }

        return (
            <>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: 'repeat(2, 1fr)',
                            sm: 'repeat(3, 1fr)',
                            md: 'repeat(4, 1fr)',
                            lg: 'repeat(6, 1fr)',
                        },
                        gap: 2.5,
                        mb: 4,
                    }}
                >
                    {results.map((manga: any) => {
                        const title = manga.title?.english || manga.title?.romaji || 'Unknown Title';
                        return (
                            <Card
                                key={manga.id}
                                sx={{
                                    cursor: 'pointer',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 2.5,
                                    overflow: 'hidden',
                                    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-6px)',
                                        boxShadow: 6,
                                    },
                                }}
                                onClick={() => handleMangaClick(manga.id)}
                            >
                                <Box sx={{ position: 'relative', pt: '140%', width: '100%', bgcolor: 'action.hover' }}>
                                    <CardMedia
                                        component="img"
                                        image={manga.cover_image || '/placeholder.png'}
                                        alt={title}
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                    {manga.average_score && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                bgcolor: 'rgba(0, 0, 0, 0.75)',
                                                backdropFilter: 'blur(4px)',
                                                color: '#ffc107',
                                                px: 1,
                                                py: 0.25,
                                                borderRadius: 1.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.25,
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            <StarRateRoundedIcon sx={{ fontSize: '0.95rem' }} />
                                            {manga.average_score}
                                        </Box>
                                    )}
                                    {manga.format && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: 8,
                                                left: 8,
                                                bgcolor: 'rgba(0, 0, 0, 0.75)',
                                                backdropFilter: 'blur(4px)',
                                                color: '#ffffff',
                                                px: 1,
                                                py: 0.25,
                                                borderRadius: 1,
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.5,
                                            }}
                                        >
                                            {manga.format}
                                        </Box>
                                    )}
                                </Box>
                                <CardContent sx={{ flexGrow: 1, p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                    <Typography
                                        variant="body2"
                                        title={title}
                                        sx={{
                                            fontWeight: 600,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: 1.3,
                                            mb: 0.5,
                                        }}
                                    >
                                        {title}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ textTransform: 'capitalize' }}
                                    >
                                        {manga.status?.toLowerCase().replaceAll('_', ' ') || 'Unknown'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>

                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, mb: 3 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, value) => {
                                updateParams({ page: value > 1 ? String(value) : undefined });
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            color="primary"
                            shape="rounded"
                            size="medium"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                )}
            </>
        );
    };

    return (
        <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                Manga Explorer
            </Typography>

            {/* Active Filters Pill Bar */}
            {(selectedGenre || searchQuery || format || status) && (
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        mb: 3,
                        p: 1.5,
                        bgcolor: 'action.hover',
                        borderRadius: 2,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 1,
                    }}
                >
                    <FilterListIcon color="primary" fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>
                        Active Filters:
                    </Typography>
                    {selectedGenre && (
                        <Chip
                            label={`Genre: ${selectedGenre}`}
                            size="small"
                            onDelete={() => updateParams({ genre: undefined, page: undefined })}
                            color="primary"
                            variant="outlined"
                        />
                    )}
                    {format && (
                        <Chip
                            label={`Format: ${format}`}
                            size="small"
                            onDelete={() => updateParams({ format: undefined, page: undefined })}
                            variant="outlined"
                        />
                    )}
                    {status && (
                        <Chip
                            label={`Status: ${status}`}
                            size="small"
                            onDelete={() => updateParams({ status: undefined, page: undefined })}
                            variant="outlined"
                        />
                    )}
                    {searchQuery && (
                        <Chip
                            label={`Query: "${searchQuery}"`}
                            size="small"
                            onDelete={() => updateParams({ q: undefined, page: undefined })}
                            variant="outlined"
                        />
                    )}
                    <Button
                        size="small"
                        color="inherit"
                        onClick={handleResetAllFilters}
                        sx={{ textTransform: 'none', fontSize: '0.8rem', ml: 'auto' }}
                    >
                        Reset All
                    </Button>
                </Stack>
            )}

            {/* Filter Bar with Enhanced Controls & Native Clean Dropdowns */}
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                sx={{ mb: 4, alignItems: { xs: 'stretch', md: 'center' } }}
            >
                <TextField
                    label="Search Manga..."
                    variant="outlined"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => updateParams({ q: e.target.value, page: undefined })}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery ? (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => updateParams({ q: undefined, page: undefined })}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        },
                    }}
                />

                {/* Genre Dropdown */}
                <TextField
                    select
                    label="Genre"
                    value={selectedGenre}
                    onChange={(e) => updateParams({ genre: e.target.value, page: undefined })}
                    sx={{ minWidth: { xs: '100%', sm: 180 } }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <CategoryOutlinedIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                        },
                    }}
                >
                    <MenuItem value="">All Genres</MenuItem>
                    {genresList.map((g) => (
                        <MenuItem key={g} value={g}>
                            {g}
                        </MenuItem>
                    ))}
                </TextField>

                {/* Format Dropdown */}
                <TextField
                    select
                    label="Format"
                    value={format}
                    onChange={(e) => updateParams({ format: e.target.value, page: undefined })}
                    sx={{ minWidth: { xs: '100%', sm: 150 } }}
                >
                    <MenuItem value="">All Formats</MenuItem>
                    <MenuItem value="MANGA">Manga</MenuItem>
                    <MenuItem value="MANHWA">Manhwa</MenuItem>
                    <MenuItem value="MANHUA">Manhua</MenuItem>
                    <MenuItem value="ONE_SHOT">One Shot</MenuItem>
                </TextField>

                {/* Status Dropdown */}
                <TextField
                    select
                    label="Status"
                    value={status}
                    onChange={(e) => updateParams({ status: e.target.value, page: undefined })}
                    sx={{ minWidth: { xs: '100%', sm: 150 } }}
                >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="FINISHED">Finished</MenuItem>
                    <MenuItem value="RELEASING">Releasing</MenuItem>
                    <MenuItem value="HIATUS">Hiatus</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </TextField>

                {/* Sort Dropdown */}
                <TextField
                    select
                    label="Sort By"
                    value={sort}
                    onChange={(e) => updateParams({ sort: e.target.value, page: undefined })}
                    sx={{ minWidth: { xs: '100%', sm: 170 } }}
                >
                    <MenuItem value="POPULARITY_DESC">Most Popular</MenuItem>
                    <MenuItem value="SCORE_DESC">Highest Score</MenuItem>
                    <MenuItem value="UPDATED_AT_DESC">Recently Updated</MenuItem>
                </TextField>
            </Stack>

            {renderMangaGrid()}
        </Box>
    );
};
