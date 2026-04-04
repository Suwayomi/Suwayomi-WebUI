/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { MangaStatus } from '@/lib/graphql/generated/graphql.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import { SpinnerImage } from '@/base/components/SpinnerImage.tsx';
import { MANGA_STATUS_TO_TRANSLATION } from '@/features/manga/Manga.constants.ts';
import type {
    MangaArtistInfo,
    MangaAuthorInfo,
    MangaDescriptionInfo,
    MangaGenreInfo,
    MangaIdInfo,
    MangaStatusInfo,
    MangaThumbnailInfo,
    MangaTitleInfo,
} from '@/features/manga/Manga.types.ts';

type EditableManga = MangaIdInfo &
    MangaTitleInfo &
    MangaStatusInfo &
    MangaAuthorInfo &
    MangaArtistInfo &
    MangaDescriptionInfo &
    MangaGenreInfo &
    MangaThumbnailInfo;

interface SearchResult {
    externalId: string;
    title: string;
    author: string | null;
    coverUrl: string | null;
    year: number | null;
    description: string | null;
}

const STATUS_OPTIONS = [
    MangaStatus.Unknown,
    MangaStatus.Ongoing,
    MangaStatus.Completed,
    MangaStatus.Licensed,
    MangaStatus.PublishingFinished,
    MangaStatus.Cancelled,
    MangaStatus.OnHiatus,
];

const PROVIDERS = ['AniList', 'MangaUpdates'];

const EditTab = ({ manga, onClose }: { manga: EditableManga; onClose: () => void }) => {
    const { t } = useLingui();

    const [title, setTitle] = useState(manga.title);
    const [author, setAuthor] = useState(manga.author ?? '');
    const [artist, setArtist] = useState(manga.artist ?? '');
    const [description, setDescription] = useState(manga.description ?? '');
    const [genre, setGenre] = useState<string[]>(manga.genre ?? []);
    const [status, setStatus] = useState<MangaStatus>(manga.status);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            const patch = {
                title: title !== manga.title ? title : undefined,
                author: author !== (manga.author ?? '') ? author : undefined,
                artist: artist !== (manga.artist ?? '') ? artist : undefined,
                description: description !== (manga.description ?? '') ? description : undefined,
                genre: JSON.stringify(genre) !== JSON.stringify(manga.genre ?? []) ? genre : undefined,
                status: status !== manga.status ? status : undefined,
            };

            const hasTextChanges = Object.values(patch).some((v) => v !== undefined);
            if (hasTextChanges) {
                await requestManager.updateMangaDetails(manga.id, patch).response;
            }

            if (coverFile) {
                await requestManager.uploadMangaCover(manga.id, coverFile).response;
            }

            makeToast(t`Metadata updated successfully`, 'success');
            onClose();
        } catch (e) {
            makeToast(t`Failed to update metadata`, 'error', getErrorMessage(e));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <DialogContent>
                <Stack sx={{ gap: 2, mt: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Box sx={{ position: 'relative', flexShrink: 0, width: 120 }}>
                            <SpinnerImage
                                src={coverPreview ?? Mangas.getThumbnailUrl(manga)}
                                alt={manga.title}
                                imgStyle={{
                                    width: 120,
                                    height: 180,
                                    objectFit: 'cover',
                                    borderRadius: 4,
                                }}
                            />
                            <IconButton
                                component="label"
                                sx={{
                                    position: 'absolute',
                                    bottom: 4,
                                    right: 4,
                                    bgcolor: 'background.paper',
                                    '&:hover': { bgcolor: 'action.hover' },
                                }}
                                size="small"
                            >
                                <PhotoCameraIcon fontSize="small" />
                                <input type="file" hidden accept="image/*" onChange={handleCoverSelect} />
                            </IconButton>
                        </Box>
                        <Stack sx={{ gap: 1, flex: 1 }}>
                            <TextField
                                label={t`Title`}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label={t`Author`}
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label={t`Artist`}
                                value={artist}
                                onChange={(e) => setArtist(e.target.value)}
                                fullWidth
                                size="small"
                            />
                        </Stack>
                    </Box>
                    <TextField
                        select
                        label={t`Status`}
                        value={status}
                        onChange={(e) => setStatus(e.target.value as MangaStatus)}
                        fullWidth
                        size="small"
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <MenuItem key={s} value={s}>
                                {t(MANGA_STATUS_TO_TRANSLATION[s])}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Autocomplete
                        multiple
                        freeSolo
                        options={[]}
                        value={genre}
                        onChange={(_, newValue) => setGenre(newValue)}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    key={option}
                                    variant="outlined"
                                    label={option}
                                    size="small"
                                    {...getTagProps({ index })}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField {...params} label={t`Genres`} size="small" placeholder={t`Add genre`} />
                        )}
                    />
                    <TextField
                        label={t`Description`}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        minRows={3}
                        maxRows={6}
                        size="small"
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    {t`Cancel`}
                </Button>
                <Button onClick={handleSubmit} color="primary" disabled={isSaving}>
                    {isSaving ? t`Saving...` : t`Save`}
                </Button>
            </DialogActions>
        </>
    );
};

const MatchTab = ({ manga, onClose }: { manga: EditableManga; onClose: () => void }) => {
    const { t } = useLingui();

    const [provider, setProvider] = useState(PROVIDERS[0]);
    const [searchQuery, setSearchQuery] = useState(manga.title);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [includeCover, setIncludeCover] = useState(true);
    const [isApplying, setIsApplying] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            return;
        }
        setIsSearching(true);
        setResults([]);
        setSelectedId(null);
        try {
            const response = await requestManager.searchMetadataProvider(provider, searchQuery.trim()).response;
            setResults(response.data?.searchMetadataProvider?.results ?? []);
        } catch (e) {
            makeToast(t`Search failed`, 'error', getErrorMessage(e));
        } finally {
            setIsSearching(false);
        }
    };

    const handleApply = async () => {
        if (!selectedId) {
            return;
        }
        setIsApplying(true);
        try {
            await requestManager.applyMetadataMatch(manga.id, provider, selectedId, includeCover).response;
            makeToast(t`Metadata applied successfully`, 'success');
            onClose();
        } catch (e) {
            makeToast(t`Failed to apply metadata`, 'error', getErrorMessage(e));
        } finally {
            setIsApplying(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <>
            <DialogContent>
                <Stack sx={{ gap: 2, mt: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            select
                            label={t`Provider`}
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            size="small"
                            sx={{ minWidth: 150 }}
                        >
                            {PROVIDERS.map((p) => (
                                <MenuItem key={p} value={p}>
                                    {p}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label={t`Search`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            fullWidth
                            size="small"
                        />
                        <IconButton
                            onClick={handleSearch}
                            disabled={isSearching || !searchQuery.trim()}
                            color="primary"
                        >
                            {isSearching ? <CircularProgress size={24} /> : <SearchIcon />}
                        </IconButton>
                    </Box>

                    {results.length > 0 && (
                        <Stack sx={{ gap: 1, maxHeight: 400, overflowY: 'auto' }}>
                            {results.map((result) => (
                                <Card
                                    key={result.externalId}
                                    variant="outlined"
                                    sx={{
                                        border: selectedId === result.externalId ? 2 : 1,
                                        borderColor: selectedId === result.externalId ? 'primary.main' : 'divider',
                                    }}
                                >
                                    <CardActionArea onClick={() => setSelectedId(result.externalId)}>
                                        <Box sx={{ display: 'flex', minHeight: 90 }}>
                                            {result.coverUrl && (
                                                <CardMedia
                                                    component="img"
                                                    image={result.coverUrl}
                                                    alt={result.title}
                                                    sx={{ width: 60, height: 90, objectFit: 'cover', flexShrink: 0 }}
                                                />
                                            )}
                                            <CardContent
                                                sx={{
                                                    flex: 1,
                                                    py: 1,
                                                    '&:last-child': { pb: 1 },
                                                    minWidth: 0,
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Typography variant="subtitle2" noWrap sx={{ flex: 1 }}>
                                                        {result.title}
                                                    </Typography>
                                                    {result.year && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {result.year}
                                                        </Typography>
                                                    )}
                                                    {selectedId === result.externalId && (
                                                        <CheckCircleIcon color="primary" fontSize="small" />
                                                    )}
                                                </Box>
                                                {result.author && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {result.author}
                                                    </Typography>
                                                )}
                                                {result.description && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        component="p"
                                                        sx={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            mt: 0.5,
                                                            wordBreak: 'break-word',
                                                        }}
                                                    >
                                                        {result.description}
                                                    </Typography>
                                                )}
                                            </CardContent>
                                        </Box>
                                    </CardActionArea>
                                </Card>
                            ))}
                        </Stack>
                    )}

                    {!isSearching && results.length === 0 && searchQuery && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                            {t`Search for manga to match metadata`}
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <FormControlLabel
                    control={<Checkbox checked={includeCover} onChange={(e) => setIncludeCover(e.target.checked)} />}
                    label={t`Include cover image`}
                    sx={{ mr: 'auto', ml: 1 }}
                />
                <Button onClick={onClose} color="primary">
                    {t`Cancel`}
                </Button>
                <Button onClick={handleApply} color="primary" disabled={!selectedId || isApplying}>
                    {isApplying ? t`Applying...` : t`Apply`}
                </Button>
            </DialogActions>
        </>
    );
};

export const EditMangaMetadataDialog = ({ manga, onClose }: { manga: EditableManga; onClose: () => void }) => {
    const { t } = useLingui();
    const [tab, setTab] = useState(0);

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
                <Tab label={t`Edit`} />
                <Tab label={t`Match`} />
            </Tabs>
            {tab === 0 && <EditTab manga={manga} onClose={onClose} />}
            {tab === 1 && <MatchTab manga={manga} onClose={onClose} />}
        </Dialog>
    );
};
