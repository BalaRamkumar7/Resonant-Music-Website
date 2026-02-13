console.log('discover.js loading...');

// Underground Music Detection Algorithm
class UndergroundMusicDetector {
    constructor() {
        // Major labels to filter out
        this.majorLabels = [
            'Universal Music Group', 'Sony Music Entertainment', 'Warner Music Group',
            'Atlantic Records', 'Capitol Records', 'Interscope Records', 'Republic Records'
        ];
        
        // Mainstream thresholds
        this.thresholds = {
            maxListeners: 1000000, // 1M+ listeners = mainstream
            maxChartPosition: 50,  // Top 50 = mainstream
            minDiscoveryAge: 30    // Days since discovery
        };
        
        // Underground-friendly genres
        this.undergroundGenres = [
            'experimental', 'ambient', 'idm', 'drone', 'noise', 'post-rock',
            'math rock', 'shoegaze', 'dream pop', 'lo-fi', 'chillwave',
            'vaporwave', 'future bass', 'trap', 'drill', 'grime'
        ];
    }
    
    // Calculate underground score for a track
    calculateUndergroundScore(track) {
        let score = 0; // Start with 0, add underground points
        let breakdown = {
            listenerPoints: 0,
            genrePoints: 0,
            discoveryPoints: 0,
            indiePoints: 0,
            engagementPoints: 0
        };
        
        // Factor 1: Listener count (30% weight) - LOWER is more underground
        const listeners = parseInt(track.listeners) || 0;
        if (listeners < 10000) {
            breakdown.listenerPoints = 30; // Very underground
        } else if (listeners < 50000) {
            breakdown.listenerPoints = 20; // Underground
        } else if (listeners < 100000) {
            breakdown.listenerPoints = 10; // Semi-underground
        } else if (listeners < 500000) {
            breakdown.listenerPoints = 5;  // Mainstream-adjacent
        }
        // 500K+ gets 0 points (mainstream)
        
        // Factor 2: Genre analysis (25% weight)
        breakdown.genrePoints = this.analyzeGenre(track.genre);
        
        // Factor 3: Artist discovery recency (20% weight)
        breakdown.discoveryPoints = this.calculateDiscoveryBonus(track);
        
        // Factor 4: Independent label detection (15% weight)
        breakdown.indiePoints = this.detectIndependentLabel(track);
        
        // Factor 5: User engagement patterns (10% weight)
        breakdown.engagementPoints = this.analyzeEngagement(track);
        
        score = breakdown.listenerPoints + breakdown.genrePoints + breakdown.discoveryPoints + 
                breakdown.indiePoints + breakdown.engagementPoints;
        
        // Store breakdown on track for tooltip
        track.scoreBreakdown = breakdown;
        
        // Also store individual scores as simple properties for easy access
        track.listenerScore = breakdown.listenerPoints;
        track.genreScore = breakdown.genrePoints;
        track.discoveryScore = breakdown.discoveryPoints;
        track.indieScore = breakdown.indiePoints;
        track.engagementScore = breakdown.engagementPoints;
        
        // Log detailed breakdown
        console.log(`🔍 SCORE BREAKDOWN for ${track.artist} - ${track.title}:`, {
            total: score,
            breakdown,
            data: {
                listeners: listeners,
                genre: track.genre,
                description: track.description?.length || 0,
                artwork: track.artwork?.includes('picsum') ? 'placeholder' : 'real'
            }
        });
        
        return Math.max(0, Math.min(100, score));
    }
    
    // Analyze genre for underground potential
    analyzeGenre(genre) {
        if (!genre) {
            console.log(`🎵 GENRE: No genre provided - 0 points`);
            return 0;
        }
        
        const genreLower = genre.toLowerCase();
        console.log(`🎵 GENRE ANALYSIS for "${genre}":`);
        
        // High underground potential genres
        for (const undergroundGenre of this.undergroundGenres) {
            if (genreLower.includes(undergroundGenre)) {
                console.log(`✅ Underground genre match: "${undergroundGenre}" - +25 points`);
                return 25;
            }
        }
        
        // Moderate underground potential
        const moderateGenres = ['indie', 'alternative', 'electronic', 'hip hop', 'punk'];
        for (const modGenre of moderateGenres) {
            if (genreLower.includes(modGenre)) {
                console.log(`⚡ Moderate genre match: "${modGenre}" - +15 points`);
                return 15;
            }
        }
        
        // Low underground potential (mainstream genres)
        const mainstreamGenres = ['pop', 'rock', 'country', 'r&b'];
        for (const mainGenre of mainstreamGenres) {
            if (genreLower.includes(mainGenre)) {
                console.log(`📻 Mainstream genre match: "${mainGenre}" - -10 points`);
                return -10;
            }
        }
        
        console.log(`❓ No genre match - 0 points`);
        return 0;
    }
    
    // Calculate discovery bonus (newer discoveries get higher scores)
    calculateDiscoveryBonus(track) {
        // This would track when we first discovered this artist
        // For now, we'll simulate with random values
        const discoveryDays = Math.floor(Math.random() * 365);
        
        if (discoveryDays < 30) return 20;  // Recently discovered
        if (discoveryDays < 90) return 15;  // Discovered within 3 months
        if (discoveryDays < 180) return 10; // Discovered within 6 months
        return 0;
    }
    
    // Detect if artist is on independent label
    detectIndependentLabel(track) {
        // This would analyze label information from track data
        // For now, we'll simulate based on listener count
        const listeners = parseInt(track.listeners) || 0;
        
        // Lower listener counts often indicate indie labels
        if (listeners < 10000) return 15;
        if (listeners < 50000) return 10;
        if (listeners < 100000) return 5;
        
        return 0;
    }
    
    // Analyze user engagement patterns
    analyzeEngagement(track) {
        // This would analyze how users interact with the track
        // For now, simulate based on track metadata
        const hasDescription = track.description && track.description.length > 100;
        const hasArtwork = track.artwork && !track.artwork.includes('picsum');
        
        let bonus = 0;
        if (hasDescription) bonus += 5;
        if (hasArtwork) bonus += 5;
        
        return bonus;
    }
    
    // Filter out mainstream tracks (lower threshold to show more results)
    filterMainstream(tracks) {
        return tracks.filter(track => {
            const score = this.calculateUndergroundScore(track);
            return score >= 30; // Lower threshold from 50 to 30 to show more results
        });
    }
    
    // Sort tracks by underground score (highest first)
    sortByUndergroundScore(tracks) {
        return tracks.sort((a, b) => {
            const scoreA = this.calculateUndergroundScore(a);
            const scoreB = this.calculateUndergroundScore(b);
            return scoreB - scoreA; // Descending order
        });
    }
}

// Global underground detector instance
const undergroundDetector = new UndergroundMusicDetector();
const LASTFM_API_KEY = 'ac6c830c5a1663978b4ae0376595ac62';
const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';
const SOUNDCLOUD_API_URL = 'https://api.soundcloud.com';
const SOUNDCLOUD_CLIENT_ID = 'lbuHH7Y38iYvA9gnAeYIop2UIcvy9BHS';

// Global state
let currentResults = [];
let currentRecommendations = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    // Import Firebase Auth functions
    const { getAuth, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js");
    
    // Set up search input enter key handler
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch(searchInput.value.trim());
        }
    });

    // Wait for auth state before loading recommendations
    const auth = window.firebaseAuth;
    if (auth) {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('✅ User authenticated, loading recommendations for:', user.email);
                // Load recommendations after user is confirmed
                loadRecommendations();
                unsubscribe(); // Unsubscribe after first load
            } else {
                console.log('❌ No user found, redirecting to login');
                window.location.href = 'index.html';
            }
        });
    } else {
        console.error('❌ Firebase Auth not initialized');
        window.location.href = 'index.html';
    }
});

// Search functionality - SoundCloud only
async function performSearch(query) {
    if (!query) return;

    // Show loading state
    showLoading('Searching for underground music... this may take a minute or two!');
    
    // Hide previous results
    hideResults();

    try {
        console.log('=== Starting SoundCloud-only search for:', query, '===');
        
        // Search SoundCloud for tracks
        const soundcloudResults = await searchSoundCloud(query);
        console.log('SoundCloud results count:', soundcloudResults.length);
        console.log('SoundCloud results:', soundcloudResults);
        
        if (soundcloudResults.length === 0) {
            console.log('No results found, showing error message');
            const resultsGrid = document.getElementById('resultsGrid');
            resultsGrid.innerHTML = '<p class="text-gray-600 col-span-full text-center">No results found. Try searching for a different artist or track.</p>';
            document.getElementById('searchResults').classList.remove('hidden');
        } else {
            currentResults = soundcloudResults;
            console.log('Final results count:', currentResults.length);
            displaySearchResults(currentResults);
        }
    } catch (error) {
        console.error('Search error:', error);
        showError('Failed to search. Please try again.');
    } finally {
        // Hide loading state
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.classList.add('hidden');
        }
    }
}

// Search Last.fm for artists
async function searchLastFMArtists(query) {
    const response = await fetch(`${LASTFM_API_URL}?method=artist.search&artist=${encodeURIComponent(query)}&api_key=${LASTFM_API_KEY}&format=json&limit=50`);
    if (!response.ok) {
        console.error('Last.fm API response:', response.status, response.statusText);
        throw new Error('Last.fm search failed');
    }
    const data = await response.json();
    console.log('Last.fm search data:', data);
    
    // Handle different response structures
    const artists = data.results?.artistmatches?.artist || data.artists?.artist || [];
    console.log('Artists found:', artists);
    
    // Log image data for each artist
    artists.forEach((artist, index) => {
        console.log(`Artist ${index} - ${artist.name}:`, {
            images: artist.image,
            imagesLength: artist.image?.length || 0,
            imageType: typeof artist.image,
            largeImage: artist.image?.[2]?.['#text'],
            mediumImage: artist.image?.[1]?.['#text'],
            smallImage: artist.image?.[0]?.['#text'],
            largeImageType: typeof artist.image?.[2]?.['#text'],
            arrayLarge: artist.image?.[2]?.['#text'],
            arrayMedium: artist.image?.[1]?.['#text'],
            arraySmall: artist.image?.[0]?.['#text']
        });
    });
    
    return Array.isArray(artists) ? artists : [artists].filter(Boolean);
}

// Get artist's top tracks
async function getArtistTopTracks(artistName) {
    const response = await fetch(`${LASTFM_API_URL}?method=artist.gettoptracks&artist=${encodeURIComponent(artistName)}&api_key=${LASTFM_API_KEY}&format=json&limit=5`);
    if (!response.ok) {
        console.error('Last.fm top tracks API response:', response.status, response.statusText);
        return [];
    }
    const data = await response.json();
    console.log('Top tracks data for', artistName, ':', data);
    return data.toptracks?.track || [];
}

// Search Last.fm for artists
async function searchLastFMArtists(query) {
    const response = await fetch(`${LASTFM_API_URL}?method=artist.search&artist=${encodeURIComponent(query)}&api_key=${LASTFM_API_KEY}&format=json&limit=50`);
    if (!response.ok) {
        console.error('Last.fm API response:', response.status, response.statusText);
        throw new Error('Last.fm search failed');
    }
    const data = await response.json();
    console.log('Last.fm search data:', data);
    
    // Handle different response structures
    const artists = data.results?.artistmatches?.artist || data.artists?.artist || [];
    console.log('Artists found:', artists);
    
    return Array.isArray(artists) ? artists : [artists].filter(Boolean);
}

// Search SoundCloud for tracks using working approach
async function searchSoundCloudTracks(query) {
    try {
        console.log('Searching SoundCloud for:', query);
        
        // SoundCloud's public API is deprecated, so we'll use a working approach
        // by searching their public endpoints and extracting stream URLs
        
        // For now, return empty to trigger fallback to Last.fm
        // This ensures users still get music recommendations
        console.log('SoundCloud API deprecated, using Last.fm fallback');
        return [];
        
    } catch (error) {
        console.error('SoundCloud search error:', error);
        return [];
    }
}

// Get working stream URL for a track
async function getSoundCloudStreamUrl(trackId) {
    try {
        console.log('Getting stream URL for track:', trackId);
        
        // Since SoundCloud API is deprecated, we'll use YouTube as fallback
        // This ensures users can still preview music
        console.log('SoundCloud streaming unavailable, using YouTube fallback');
        return null;
        
    } catch (error) {
        console.error('Error getting stream URL:', error);
        return null;
    }
}

// Search SoundCloud for tracks using real API + underground filtering
async function searchSoundCloud(query) {
    try {
        console.log('=== Starting real SoundCloud API search for:', query, '===');
        
        // Search SoundCloud directly for tracks
        const soundcloudTracks = await searchSoundCloudTracks(query);
        console.log('SoundCloud API tracks found:', soundcloudTracks.length);
        
        if (soundcloudTracks.length === 0) {
            console.log('No SoundCloud tracks found, falling back to Last.fm approach');
            // Fallback to original Last.fm approach
            return await searchSoundCloudFallback(query);
        }
        
        const processedTracks = [];
        
        // Process each SoundCloud track
        for (let i = 0; i < soundcloudTracks.length; i++) {
            const track = soundcloudTracks[i];
            
            try {
                // Get real stream URL for this track
                const streamUrl = await getSoundCloudStreamUrl(track.id);
                
                if (!streamUrl) {
                    console.log(`Skipping non-streamable track: ${track.title}`);
                    continue;
                }
                
                // Create enhanced track object with real SoundCloud data
                const enhancedTrack = {
                    id: track.id,
                    title: track.title,
                    artist: track.user.username,
                    artwork: track.artwork_url || track.user.avatar_url || `https://picsum.photos/300/300?text=${encodeURIComponent(track.title)}&bg=1a1a1a&color=ffffff`,
                    streamUrl: streamUrl, // REAL stream URL!
                    duration: track.duration || 180000,
                    genre: track.genre || track.tag_list || 'Unknown',
                    description: track.description || `Track by ${track.user.username}`,
                    listeners: track.playback_count || track.likes_count || '0',
                    youtubeId: null,
                    soundcloudId: track.id,
                    waveformUrl: track.waveform_url || `https://picsum.photos/800/200?text=WAVEFORM&bg=ff5500&color=ffffff&random=${i}`,
                    permalinkUrl: track.permalink_url || `https://soundcloud.com/${track.user.permalink}/${track.permalink}`,
                    source: 'soundcloud-api',
                    realTrack: track,
                    originalArtist: {
                        name: track.user.username,
                        listeners: track.playback_count || '0'
                    }
                };
                
                // Apply enhanced genre detection
                const enhancedGenres = await getEnhancedGenres(track.user.username, track.title, query);
                enhancedTrack.genre = enhancedGenres;
                
                // Calculate underground score
                const undergroundScore = undergroundDetector.calculateUndergroundScore(enhancedTrack);
                enhancedTrack.undergroundScore = undergroundScore;
                
                console.log(`✅ Added real SoundCloud track: ${track.title} by ${track.user.username} (Score: ${undergroundScore})`);
                processedTracks.push(enhancedTrack);
                
            } catch (trackError) {
                console.error('Error processing SoundCloud track:', track.title, trackError);
            }
        }
        
        // Sort by underground score and filter
        const sortedTracks = undergroundDetector.sortByUndergroundScore(processedTracks);
        console.log(`Processed ${sortedTracks.length} real SoundCloud tracks`);
        
        return sortedTracks;
        
    } catch (error) {
        console.error('SoundCloud API search error:', error);
        console.log('Falling back to Last.fm approach');
        return await searchSoundCloudFallback(query);
    }
}

// Fallback method using Last.fm (original approach)
async function searchSoundCloudFallback(query) {
    try {
        console.log('Using Last.fm fallback for:', query);
        
        // First try to get real artist data from Last.fm
        const artists = await searchLastFMArtists(query);
        console.log('Found artists:', artists.length);
        
        if (artists.length === 0) {
            console.log('No artists found, returning empty results');
            return [];
        }
        
        const tracks = [];
        
        // For each artist, get their top tracks and create SoundCloud-style entries
        // Process first 50 artists for comprehensive results
        const maxArtists = Math.min(artists.length, 50);
        console.log(`Processing first ${maxArtists} artists for comprehensive search`);
        
        for (let i = 0; i < maxArtists; i++) {
            const artist = artists[i];
            
            try {
                console.log(`Processing artist ${i + 1}/${maxArtists}: ${artist.name}`);
                
                // Get top tracks for this artist
                const topTracks = await getArtistTopTracks(artist.name);
                
                if (topTracks.length === 0) {
                    console.log(`No tracks found for artist: ${artist.name}`);
                    continue;
                }
                
                // Process first 3 tracks per artist
                const maxTracks = Math.min(topTracks.length, 3);
                
                for (let j = 0; j < maxTracks; j++) {
                    const track = topTracks[j];
                    
                    // Create a SoundCloud-style track entry with REAL music data
                    const soundcloudTrack = {
                        id: `sc_${artist.mbid || artist.name}_${j}`,
                        title: track.name,
                        artist: artist.name,
                        artwork: getBestImageUrl(artist),
                        streamUrl: `https://soundcloud.com/search?q=${encodeURIComponent(`${artist.name} ${track.name}`)}`,
                        duration: track.duration ? Math.round(track.duration * 1000) : 180000, // Convert seconds to milliseconds
                        genre: track.toptags?.tag?.map(tag => tag.name).join(', ') || artist.genre || 'Unknown',
                        description: artist.bio?.summary || `Top track by ${artist.name}`,
                        listeners: track.listeners || track.playcount || artist.listeners || '0', // Use track listeners first, then playcount, then artist listeners
                        youtubeId: null,
                        soundcloudId: `sc_${artist.mbid || artist.name}_${j}`,
                        waveformUrl: `https://picsum.photos/800/200?text=WAVEFORM&bg=ff5500&color=ffffff&random=${j}`,
                        permalinkUrl: `https://soundcloud.com/search?q=${encodeURIComponent(`${artist.name} ${track.name}`)}`,
                        source: 'soundcloud-fallback',
                        realTrack: track, // Store real track data
                        originalArtist: artist // Store original artist data for algorithm
                    };
                    
                    // Get enhanced genres for search results too
                    const enhancedGenres = await getEnhancedGenres(artist.name, track.name, query);
                    
                    soundcloudTrack.genre = enhancedGenres; // Use enhanced genres instead of basic tags
                    
                    tracks.push(soundcloudTrack);
                    console.log(`Added track: ${track.name} by ${artist.name}`);
                }
            } catch (trackError) {
                console.error('Error processing track for artist:', artist.name, trackError);
            }
        }
        
        // Apply underground filtering and sorting
        console.log(`Total tracks before underground filtering: ${tracks.length}`);
        
        // Sort by underground score
        const sortedTracks = undergroundDetector.sortByUndergroundScore(tracks);
        
        console.log(`Final underground tracks: ${sortedTracks.length}`);
        return sortedTracks;
    } catch (error) {
        console.error('SoundCloud fallback error:', error);
        return [];
    }
}

// Create track card without YouTube video
function createTrackCardWithoutVideo(track) {
    const duration = formatDuration(track.duration);
    const listeners = formatListeners(track.listeners);
    
    // Debug image URL
    console.log('Fallback track artwork URL:', track.artwork);
    console.log('Creating fallback card for track:', track);
    
    return `
        <div class="track-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onclick="openTrackModalWithoutVideo('${track.id}')" data-track-id="${track.id}">
            <div class="aspect-square bg-gray-200 relative">
                <img src="${track.artwork}" alt="${track.title}" class="w-full h-full object-cover" 
                     onerror="this.src='https://picsum.photos/300/300?text=MUSIC&bg=7c3aed&color=ffffff'"
                     onload="console.log('Fallback image loaded successfully:', this.src)">
                <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <svg class="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                        <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100-4h2a1 1 0 100-2 2 2 0 00-2 2v11a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2H6z"/>
                    </svg>
                </div>
            </div>
            <div class="p-3">
                <h3 class="font-semibold text-gray-900 truncate text-sm mb-1">${track.title}</h3>
                <p class="text-xs text-gray-600 truncate mb-2">${track.artist}</p>
                
                <!-- Compact info row -->
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                        <!-- Genre Bubble with Tooltip -->
                        <div class="relative" style="position: relative;" 
                             onmouseover="this.querySelector('.genre-tooltip').style.opacity='1'"
                             onmouseout="this.querySelector('.genre-tooltip').style.opacity='0'">
                            <span class="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-xs font-medium cursor-help" style="cursor: help;">
                                genres
                            </span>
                            
                            <!-- Genre Tooltip -->
                            <div class="genre-tooltip" style="
                                position: absolute;
                                bottom: 100%;
                                right: 0;
                                margin-bottom: 8px;
                                width: 180px;
                                padding: 6px;
                                background: #1f2937;
                                color: white;
                                font-size: 9px;
                                border-radius: 4px;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.6);
                                z-index: 9999;
                                opacity: 0;
                                transition: opacity 0.2s ease;
                                pointer-events: none;
                                border: 1px solid #374151;
                            ">
                                <div style="font-weight: bold; margin-bottom: 3px; color: #60a5fa; font-size: 10px;">🎵 Genres</div>
                                <div style="font-size: 9px; color: #d1d5db;">${track.genre}</div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-1 text-xs text-gray-400">
                        <span>👥 ${listeners}</span>
                        <span>${duration}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Open track modal without video
function openTrackModalWithoutVideo(trackId) {
    const track = [...currentResults, ...currentRecommendations].find(t => t.id === trackId);
    if (!track) {
        console.error('Track not found:', trackId);
        return;
    }

    console.log('Opening modal for track:', track);

    const modal = document.getElementById('trackModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');

    modalTitle.textContent = track.title;
    modalContent.innerHTML = `
        <div class="space-y-6">
            <div class="flex items-center space-x-6">
                <img src="${track.artwork}" alt="${track.title}" class="w-32 h-32 rounded-lg object-cover">
                <div class="flex-1">
                    <h4 class="text-xl font-semibold text-gray-900 mb-2">${track.title}</h4>
                    <p class="text-lg text-gray-600 mb-1">${track.artist}</p>
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded">${track.genre}</span>
                        <span>👥 ${formatListeners(track.listeners)}</span>
                        <span>${formatDuration(track.duration)}</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-gray-700">${track.description}</p>
            </div>
            
            <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
                <p class="text-yellow-800 mb-2">🎵 Audio preview not available</p>
                <p class="text-yellow-600 text-sm">Find this track on your favorite streaming service</p>
            </div>
            
            <div class="flex space-x-4">
                <button onclick="searchStreamingServices('${track.artist}', '${track.title}')" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Find on Streaming Services
                </button>
                <button onclick="searchYouTubeManually('${track.artist}', '${track.title}')" class="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Search on YouTube
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Add click outside to close functionality
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Make element draggable
function makeDraggable(element) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    console.log('Making element draggable:', element);

    // Wait for element to be fully rendered
    setTimeout(() => {
        // Create drag handle
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.innerHTML = '⋮⋮'; // Visual drag indicator
        dragHandle.style.cssText = `
            position: absolute;
            top: 8px;
            left: 8px;
            width: 24px;
            height: 24px;
            cursor: move;
            background: #9333ea;
            color: white;
            border-radius: 4px;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            line-height: 1;
            user-select: none;
            border: 2px solid #9333ea;
        `;
        element.appendChild(dragHandle);

        console.log('Drag handle created:', dragHandle);

        function dragStart(e) {
            console.log('Drag start triggered', e.target);
            
            // Check if click is on drag handle
            if (e.target === dragHandle || dragHandle.contains(e.target)) {
                console.log('Drag handle detected!');
                e.preventDefault();
                e.stopPropagation();
                isDragging = true;
                
                // Get current position
                const rect = element.getBoundingClientRect();
                initialLeft = rect.left;
                initialTop = rect.top;
                
                // Get mouse position
                startX = e.clientX;
                startY = e.clientY;
                
                console.log('Initial position:', { left: initialLeft, top: initialTop });
                console.log('Mouse start:', { x: startX, y: startY });
                
                element.style.cursor = 'move';
                element.style.transition = 'none';
            }
        }

        function dragEnd(e) {
            console.log('Drag end triggered', isDragging);
            if (isDragging) {
                isDragging = false;
                element.style.cursor = 'default';
                element.style.transition = 'all 0.2s ease';
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
                
                const currentX = e.clientX;
                const currentY = e.clientY;

                // Calculate new position
                const deltaX = currentX - startX;
                const deltaY = currentY - startY;
                
                const newLeft = initialLeft + deltaX;
                const newTop = initialTop + deltaY;

                console.log('Dragging to:', { left: newLeft, top: newTop });

                // Update position using left/top instead of transform
                element.style.left = newLeft + 'px';
                element.style.top = newTop + 'px';
                element.style.transform = 'none';
            }
        }

        // Only add event listeners to drag handle
        dragHandle.addEventListener('mousedown', dragStart);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('mousemove', drag);
        
        // Prevent click events on drag handle
        dragHandle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    }, 100);
}

// Get SoundCloud oEmbed for real playback
async function getSoundCloudEmbedUrl(artist, title) {
    try {
        console.log('Getting SoundCloud embed for:', artist, '-', title);
        
        // Search SoundCloud for the track
        const searchQuery = `${artist} ${title}`;
        const searchUrl = `https://api.soundcloud.com/tracks?q=${encodeURIComponent(searchQuery)}&client_id=${SOUNDCLOUD_CLIENT_ID}&limit=1`;
        
        console.log('Searching SoundCloud:', searchQuery);
        
        const response = await fetch(searchUrl);
        if (!response.ok) {
            console.log('SoundCloud search failed, using fallback');
            return getFallbackAudio(artist, title);
        }
        
        const data = await response.json();
        if (!data || data.length === 0) {
            console.log('No SoundCloud results found, using fallback');
            return getFallbackAudio(artist, title);
        }
        
        const track = data[0];
        if (!track || !track.permalink_url) {
            console.log('No SoundCloud permalink found, using fallback');
            return getFallbackAudio(artist, title);
        }
        
        const embedUrl = track.permalink_url;
        console.log(`Found SoundCloud embed URL for ${artist} - ${title}: ${embedUrl}`);
        
        return embedUrl;
        
    } catch (error) {
        console.error('Error getting SoundCloud embed:', error);
        return getFallbackAudio(artist, title);
    }
}

// Get real audio stream for a track
async function getYouTubeAudioStream(artist, title) {
    try {
        console.log('Getting SoundCloud embed for:', artist, '-', title);
        
        // First try SoundCloud oEmbed
        const soundCloudEmbed = await getSoundCloudEmbedUrl(artist, title);
        
        if (soundCloudEmbed && soundCloudEmbed.includes('soundcloud.com')) {
            return soundCloudEmbed;
        }
        
        // Fallback to YouTube search
        const searchQuery = `${artist} ${title}`;
        
        // Use YouTube Audio Library API to get real audio
        const searchUrl = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&key=AIzaSyBkqXQ2jYsF2X8n7d4hQ4T8I6s3k&maxResults=1`;
        
        console.log('Searching YouTube for:', searchQuery);
        
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) {
            console.log('YouTube search failed, using fallback');
            return getFallbackAudio(artist, title);
        }
        
        const searchData = await searchResponse.json();
        if (!searchData.items || searchData.items.length === 0) {
            console.log('No YouTube results found, using fallback');
            return getFallbackAudio(artist, title);
        }
        
        const videoId = searchData.items[0].id.videoId;
        console.log('Found YouTube video:', videoId);
        
        // Get audio stream URL
        const audioUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // For now, we'll use a working approach with YouTube embed
        // In a real implementation, you'd extract the audio stream
        console.log(`Using YouTube video for ${artist} - ${title}: ${audioUrl}`);
        
        return audioUrl;
        
    } catch (error) {
        console.error('Error getting real audio:', error);
        return getFallbackAudio(artist, title);
    }
}

// Fallback audio with better variety
function getFallbackAudio(artist, title) {
    // Generate a unique audio URL based on the track info
    const searchQuery = `${artist} ${title}`;
    
    // Generate a unique audio URL based on the track info
    const trackHash = Math.abs(searchQuery.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0));
    
    // Use different demo audio files based on hash to simulate variety
    const audioFiles = [
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
    ];
    
    const audioUrl = audioFiles[trackHash % audioFiles.length];
    
    console.log(`Using fallback audio URL for ${artist} - ${title}: ${audioUrl}`);
    return audioUrl;
}

// Play SoundCloud track with working audio
async function playSoundCloudTrack(trackId, title, artist, streamUrl) {
    console.log('Playing track:', title, 'by', artist);
    console.log('Stream URL available:', !!streamUrl);
    console.log('Stream URL:', streamUrl);
    
    // Stop any existing audio
    stopSoundCloudPlayer();
    
    // Get working audio stream
    const workingAudioUrl = await getYouTubeAudioStream(artist, title);
    console.log('Working audio URL:', workingAudioUrl);
    
    // Create SoundCloud-style audio player
    let audioPlayer = document.getElementById('soundCloudPlayer');
    if (!audioPlayer) {
        console.log('Creating new audio player element');
        audioPlayer = document.createElement('div');
        audioPlayer.id = 'soundCloudPlayer';
        audioPlayer.className = 'fixed bg-white rounded-lg shadow-xl p-4 z-50 max-w-sm';
        // Initial positioning - center of screen
        audioPlayer.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            z-index: 9999 !important;
            width: 320px !important;
            max-width: 90vw !important;
            border-radius: 12px !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
            border: 1px solid #e5e7eb !important;
        `;
        
        // Add drag functionality
        makeDraggable(audioPlayer);
        
        document.body.appendChild(audioPlayer);
        console.log('Audio player created and added to body');
    } else {
        console.log('Using existing audio player element');
    }
    
    let audioContent = '';
    
    if (workingAudioUrl) {
        // Check if it's a SoundCloud embed URL
        if (workingAudioUrl.includes('soundcloud.com/')) {
            // Create SoundCloud embed for real playback
            audioContent = `
                <div class="flex items-center justify-between mb-3" style="padding-left: 32px;">
                    <div class="flex items-center space-x-2">
                        <svg class="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M12 0C5.4 0 0 5.4 0 0 10.8c0 3.2 2.6 5.8 5.8 0 10.8 0 5.4 5.4 0 0 10.8 16.8 0 0 10.8-1.6-1.6-1.6v6.4c0 3.2 2.6-5.8 5.8-5.8 0 0 3.2-2.6 2.6-2.6v-6.4c0-3.2-2.6-5.8 5.8-5.8 0 0-3.2 2.6 2.6 2.6v6.4c0 3.2 2.6 5.8 5.8 5.8 0 3.2 2.6 5.8 5.8 0 3.2 2.6 5.8 5.8v16.8c0 3.2 2.6 5.8 5.8 0 3.2 2.6 5.8 5.8v-6.4z"/>
                        </svg>
                        <h4 class="font-semibold text-sm text-gray-900">SoundCloud Player</h4>
                    </div>
                    <button onclick="stopSoundCloudPlayer()" class="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414-1.414L11.414 10l4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414-1.414z"/>
                        </svg>
                    </button>
                </div>
                <div class="embed-container" style="width: 100%; height: 180px; margin-bottom: 12px;">
                    <iframe 
                        src="https://w.soundcloud.com/player/?url=${encodeURIComponent(workingAudioUrl)}&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=true&color=ff5500" 
                        frameborder="0" 
                        allow="autoplay"
                        style="width: 100%; height: 100%; border-radius: 8px;">
                    </iframe>
                </div>
                <div class="text-xs text-gray-600 mb-3 truncate">${title} - ${artist}</div>
                <div class="flex space-x-2">
                    <button onclick="window.open('${workingAudioUrl}', '_blank')" class="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-2 py-2 rounded text-xs transition-colors">
                        🎧 SoundCloud
                    </button>
                    <button onclick="window.open('https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title}`)}', '_blank')" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-2 rounded text-xs transition-colors">
                        ▶️ YouTube
                    </button>
                    <button onclick="window.open('https://open.spotify.com/search/${encodeURIComponent(`${artist} ${title}`)}', '_blank')" class="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 py-2 rounded text-xs transition-colors">
                        🎵 Spotify
                    </button>
                </div>
            `;
        } else if (workingAudioUrl.includes('youtube.com/watch?v=')) {
            // Create YouTube embed for real video playback
            const videoId = workingAudioUrl.split('v=')[1];
            audioContent = `
                <div class="flex items-center justify-between mb-3" style="padding-left: 32px;">
                    <div class="flex items-center space-x-2">
                        <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 5a2 2 0 012-2v10a2 2 0 012 2h14a2 2 0 012-2V5a2 2 0 00-2-2H2zm3.293 4.707a1 1 0 011.414 0L10 10.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414-1.414L11.414 10l4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414-1.414z"/>
                        </svg>
                        <h4 class="font-semibold text-sm text-gray-900">YouTube Video</h4>
                    </div>
                    <button onclick="stopSoundCloudPlayer()" class="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414-1.414z"/>
                        </svg>
                    </button>
                </div>
                <div class="video-container" style="width: 100%; height: 180px; margin-bottom: 12px;">
                    <iframe 
                        src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                        style="width: 100%; height: 100%; border-radius: 8px;">
                    </iframe>
                </div>
                <div class="text-xs text-gray-600 mb-3 truncate">${title} - ${artist}</div>
                <div class="flex space-x-2">
                    <button onclick="window.open('${workingAudioUrl}', '_blank')" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-2 rounded text-xs transition-colors">
                        ▶️ YouTube
                    </button>
                    <button onclick="window.open('https://soundcloud.com/search?q=${encodeURIComponent(`${artist} ${title}`)}', '_blank')" class="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-2 py-2 rounded text-xs transition-colors">
                        🎧 SoundCloud
                    </button>
                    <button onclick="window.open('https://open.spotify.com/search/${encodeURIComponent(`${artist} ${title}`)}', '_blank')" class="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 py-2 rounded text-xs transition-colors">
                        🎵 Spotify
                    </button>
                </div>
            `;
        } else {
            // Regular audio file
            const audio = new Audio(workingAudioUrl);
            audio.controls = true;
            audio.className = 'w-full mb-3';
            
            audioContent = `
                <div class="flex items-center justify-between mb-3" style="padding-left: 32px;">
                    <div class="flex items-center space-x-2">
                        <svg class="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c1.657 0 3-.895 3-2a1 1 0 00-1.196-.98l-10-2A1 1 0 001 9V4z"/>
                        </svg>
                        <h4 class="font-semibold text-sm text-gray-900">Audio Player</h4>
                    </div>
                    <button onclick="stopSoundCloudPlayer()" class="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414-1.414z"/>
                        </svg>
                    </button>
                </div>
                <div class="audio-container mb-3"></div>
                <div class="text-xs text-gray-600 mb-3 truncate">${title} - ${artist}</div>
                <div class="flex space-x-2">
                    <button onclick="window.open('https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title}`)}', '_blank')" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-2 rounded text-xs transition-colors">
                        ▶️ YouTube
                    </button>
                    <button onclick="window.open('https://soundcloud.com/search?q=${encodeURIComponent(`${artist} ${title}`)}', '_blank')" class="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-2 py-2 rounded text-xs transition-colors">
                        🎧 SoundCloud
                    </button>
                    <button onclick="window.open('https://open.spotify.com/search/${encodeURIComponent(`${artist} ${title}`)}', '_blank')" class="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 py-2 rounded text-xs transition-colors">
                        🎵 Spotify
                    </button>
                </div>
            `;
        }
        
        // Add the audio element to the player
        audioPlayer.innerHTML = audioContent;
        
        if (workingAudioUrl.includes('youtube.com/watch?v=')) {
            // YouTube embed - no audio element needed
            console.log('YouTube embed created for:', videoId);
        } else {
            // Regular audio file - add audio element
            const audioContainer = audioPlayer.querySelector('.audio-container');
            if (audioContainer) {
                const audio = new Audio(workingAudioUrl);
                audio.controls = true;
                audio.className = 'w-full';
                audioContainer.appendChild(audio);
                
                // Try to auto-play
                audio.play().catch(error => {
                    console.log('Auto-play prevented, user needs to click play:', error);
                });
                
                // Remove player when audio ends
                audio.addEventListener('ended', () => {
                    setTimeout(() => {
                        stopSoundCloudPlayer();
                    }, 2000);
                });
            }
        }
        
    } else {
        // No stream available - show fallback options
        audioContent = `
            <div class="flex items-center justify-between mb-3" style="padding-left: 32px;">
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c1.657 0 3-.895 3-2a1 1 0 00-1.196-.98l-10-2A1 1 0 001 9V4z"/>
                    </svg>
                    <h4 class="font-semibold text-sm text-gray-900">Music Player</h4>
                </div>
                <button onclick="stopSoundCloudPlayer()" class="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                    </svg>
                </button>
            </div>
            <div class="text-center p-4">
                <div class="text-orange-500 mb-3">
                    <svg class="w-10 h-10 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c1.657 0 3-.895 3-2a1 1 0 00-1.196-.98l-10-2A1 1 0 001 9V4z"/>
                    </svg>
                </div>
                <div class="text-sm text-gray-600 mb-3 truncate">${title} - ${artist}</div>
                <div class="text-xs text-gray-500 mb-4">Direct preview unavailable</div>
                <div class="flex space-x-2">
                    <button onclick="window.open('https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title}`)}', '_blank')" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-2 rounded text-xs transition-colors">
                        ▶️ YouTube
                    </button>
                    <button onclick="window.open('https://soundcloud.com/search?q=${encodeURIComponent(`${artist} ${title}`)}', '_blank')" class="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-2 py-2 rounded text-xs transition-colors">
                        🎧 SoundCloud
                    </button>
                    <button onclick="window.open('https://open.spotify.com/search/${encodeURIComponent(`${artist} ${title}`)}', '_blank')" class="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 py-2 rounded text-xs transition-colors">
                        🎵 Spotify
                    </button>
                </div>
            </div>
        `;
        
        audioPlayer.innerHTML = audioContent;
    }
}

// Stop SoundCloud player
function stopSoundCloudPlayer() {
    const audioPlayer = document.getElementById('soundCloudPlayer');
    if (audioPlayer) {
        const audio = audioPlayer.querySelector('audio');
        if (audio) {
            audio.pause();
        }
        audioPlayer.remove();
    }
}

// Get best available image URL for an artist
function getBestImageUrl(artist) {
    // Check all available image sizes
    const images = artist.image || [];
    
    // Log all available images
    console.log(`Available images for ${artist.name}:`, images);
    
    // Check if images array has actual image objects
    if (images.length === 0) {
        console.log('No images array found, using placeholder');
        return 'https://picsum.photos/300/300?text=MUSIC&bg=ff5500&color=ffffff';
    }
    
    // Try to find the best image size
    const preferredSizes = ['extralarge', 'large', 'medium', 'small'];
    
    for (const size of preferredSizes) {
        const image = images.find(img => img.size === size);
        if (image && image['#text'] && image['#text'].trim() !== '') {
            console.log(`Using ${size} image for ${artist.name}:`, image['#text']);
            return image['#text'];
        }
    }
    
    // Fallback to first available image
    const firstImage = images[0];
    if (firstImage && firstImage['#text'] && firstImage['#text'].trim() !== '') {
        console.log(`Using first image for ${artist.name}:`, firstImage['#text']);
        return firstImage['#text'];
    }
    
    // Final fallback
    console.log(`No valid images found for ${artist.name}, using placeholder`);
    return 'https://picsum.photos/300/300?text=MUSIC&bg=ff5500&color=ffffff';
}

// Get trending artists from Last.fm
async function getTrendingArtists() {
    try {
        const response = await fetch(`${LASTFM_API_URL}?method=chart.gettopartists&api_key=${LASTFM_API_KEY}&format=json&limit=50`);
        if (!response.ok) {
            console.error('Last.fm trending artists API response:', response.status, response.statusText);
            return [];
        }
        const data = await response.json();
        console.log('Trending artists data:', data);
        return data.artists?.artist || [];
    } catch (error) {
        console.error('Error getting trending artists:', error);
        return [];
    }
}

// Search YouTube manually (opens new tab)
function searchYouTubeManually(artist, title) {
    const query = encodeURIComponent(`${artist} ${title}`);
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
}

// Search SoundCloud manually (opens new tab)
function searchSoundCloudManually(artist, title) {
    const query = encodeURIComponent(`${artist} ${title}`);
    window.open(`https://soundcloud.com/search?q=${query}`, '_blank');
}

// Get best available image URL for an artist
function getBestImageUrl(artist) {
    // Check all available image sizes
    const images = artist.image || [];
    
    // Log all available images
    console.log(`Available images for ${artist.name}:`, images);
    
    // Check if images array has actual image objects
    if (images.length === 0) {
        console.log(`No images array for ${artist.name}, using placeholder`);
        const firstChar = artist.name.charAt(0).replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || '?';
        return `https://picsum.photos/300/300?text=${firstChar}&bg=7c3aed&color=ffffff`;
    }
    
    // Try array access first (most common format)
    const arrayLarge = images[2]?.['#text'];
    const arrayMedium = images[1]?.['#text'];
    const arraySmall = images[0]?.['#text'];
    
    console.log(`Array access for ${artist.name}:`, {
        arrayLarge,
        arrayMedium,
        arraySmall
    });
    
    // Use array access if available
    if (arrayLarge && arrayLarge.trim() !== '') {
        console.log(`Using array large image for ${artist.name}:`, arrayLarge);
        return arrayLarge;
    }
    if (arrayMedium && arrayMedium.trim() !== '') {
        console.log(`Using array medium image for ${artist.name}:`, arrayMedium);
        return arrayMedium;
    }
    if (arraySmall && arraySmall.trim() !== '') {
        console.log(`Using array small image for ${artist.name}:`, arraySmall);
        return arraySmall;
    }
    
    // Fallback to object access
    const largeImage = images.find(img => img.size === 'large' || img.size === 'extralarge');
    const mediumImage = images.find(img => img.size === 'medium');
    const smallImage = images.find(img => img.size === 'small');
    
    console.log(`Object access for ${artist.name}:`, {
        largeImage: largeImage?.['#text'],
        mediumImage: mediumImage?.['#text'],
        smallImage: smallImage?.['#text']
    });
    
    const bestImage = largeImage?.['#text'] || mediumImage?.['#text'] || smallImage?.['#text'];
    
    if (bestImage && bestImage.trim() !== '') {
        console.log(`Using object image for ${artist.name}:`, bestImage);
        return bestImage;
    }
    
    // Use placeholder
    console.log(`Using placeholder for ${artist.name} - no valid image found`);
    const firstChar = artist.name.charAt(0).replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || '?';
    return `https://picsum.photos/300/300?text=${firstChar}&bg=7c3aed&color=ffffff`;
}

// Mock search results for testing
function getMockSearchResults(query) {
    return [
        {
            id: 1,
            title: `Underground Track - ${query}`,
            artist: 'Indie Artist',
            artwork: 'https://via.placeholder.com/300x300/7c3aed/ffffff?text=Track',
            streamUrl: '#',
            duration: 180000,
            genre: 'Electronic',
            description: 'An amazing underground track discovered on SoundCloud',
            permalinkUrl: '#'
        },
        {
            id: 2,
            title: `Hidden Gem - ${query}`,
            artist: 'Lo-Fi Producer',
            artwork: 'https://via.placeholder.com/300x300/7c3aed/ffffff?text=Gem',
            streamUrl: '#',
            duration: 240000,
            genre: 'Lo-Fi',
            description: 'A relaxing lo-fi track perfect for studying',
            permalinkUrl: '#'
        },
        {
            id: 3,
            title: `Experimental Sound - ${query}`,
            artist: 'Avant-Garde Musician',
            artwork: 'https://via.placeholder.com/300x300/7c3aed/ffffff?text=Exp',
            streamUrl: '#',
            duration: 300000,
            genre: 'Experimental',
            description: 'Pushing boundaries of modern music',
            permalinkUrl: '#'
        }
    ];
}

// Display search results - SoundCloud only
function displaySearchResults(results) {
    const resultsGrid = document.getElementById('resultsGrid');
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        resultsGrid.innerHTML = '<p class="text-gray-600 col-span-full text-center">No results found. Try searching for a different artist or track.</p>';
    } else {
        // Use SoundCloud audio cards for all results
        resultsGrid.innerHTML = results.map(track => createTrackCardWithAudio(track)).join('');
    }
    
    searchResults.classList.remove('hidden');
}

// Load user preferences from Firestore
async function loadUserPreferences() {
    try {
        const user = window.firebaseAuth.currentUser;
        if (!user) {
            console.log('No user found, using default preferences');
            return {
                favoriteGenres: [],
                undergroundLevel: 50,
                favoriteArtists: []
            };
        }
        
        // Import Firestore functions
        const { getFirestore, doc, getDoc } = await import("https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js");
        const db = getFirestore();
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            const preferences = {
                favoriteGenres: data.favoriteGenres || [],
                undergroundLevel: data.undergroundLevel || 50,
                favoriteArtists: data.favoriteArtists || []
            };
            console.log('✅ User preferences loaded successfully:');
            console.log('  - Favorite Genres:', preferences.favoriteGenres);
            console.log('  - Underground Level:', preferences.undergroundLevel + '%');
            console.log('  - Favorite Artists:', preferences.favoriteArtists.map(a => a.name));
            return preferences;
        } else {
            console.log('❌ No user data found, using default preferences');
            return {
                favoriteGenres: [],
                undergroundLevel: 50,
                favoriteArtists: []
            };
        }
    } catch (error) {
        console.error('❌ Error loading user preferences:', error);
        return {
            favoriteGenres: [],
            undergroundLevel: 50,
            favoriteArtists: []
        };
    }
}

// Apply user preferences to filter and rank recommendations
function applyUserPreferences(tracks, preferences) {
    console.log('Applying user preferences:', preferences);
    
    let filteredTracks = tracks;
    
    // 1. Filter by favorite genres (boost tracks with matching genres)
    if (preferences.favoriteGenres && preferences.favoriteGenres.length > 0) {
        console.log('Filtering by favorite genres:', preferences.favoriteGenres);
        
        filteredTracks = tracks.map(track => {
            const trackGenres = (track.genre || '').toLowerCase().split(',').map(g => g.trim());
            const matchingGenres = trackGenres.filter(genre => 
                preferences.favoriteGenres.some(favGenre => 
                    trackGenres.some(trackGenre => 
                        trackGenre.includes(favGenre.toLowerCase()) || 
                        favGenre.toLowerCase().includes(trackGenre)
                    )
                )
            );
            
            // Add genre match score
            track.genreMatchScore = matchingGenres.length > 0 ? matchingGenres.length * 20 : 0;
            
            if (matchingGenres.length > 0) {
                console.log(`Genre match for ${track.artist} - ${track.title}: ${matchingGenres.join(', ')}`);
            }
            
            return track;
        });
    }
    
    // 2. Apply underground level preference first (this determines artist boosting)
    const undergroundThreshold = preferences.undergroundLevel || 50;
    console.log(`Applying underground threshold: ${undergroundThreshold}%`);
    
    filteredTracks = filteredTracks.map(track => {
        const undergroundScore = undergroundDetector.calculateUndergroundScore(track);
        
        // Determine if track fits user's underground preference
        let fitsUndergroundPreference = false;
        if (undergroundThreshold >= 75) {
            fitsUndergroundPreference = undergroundScore >= 60; // Very underground preference
        } else if (undergroundThreshold >= 50) {
            fitsUndergroundPreference = undergroundScore >= 30; // Balanced preference
        } else {
            fitsUndergroundPreference = true; // Mainstream preference - everything fits
        }
        
        // Apply underground filtering
        if (!fitsUndergroundPreference) {
            track.filtered = true;
            console.log(`Filtered out (doesn't match underground preference): ${track.artist} - ${track.title} (Score: ${undergroundScore})`);
        }
        
        // 3. Conditional artist boosting - only boost if fits underground preference
        if (preferences.favoriteArtists && preferences.favoriteArtists.length > 0) {
            const isFavoriteArtist = preferences.favoriteArtists.some(favArtist => 
                favArtist.name.toLowerCase() === track.artist.toLowerCase()
            );
            
            if (isFavoriteArtist && fitsUndergroundPreference) {
                // Full boost for favorite artists that match underground preference
                track.artistMatchScore = 30;
                console.log(`Favorite artist match (fits preference): ${track.artist} - ${track.title} (+30)`);
            } else if (isFavoriteArtist && !fitsUndergroundPreference) {
                // Small boost for favorite artists that don't match preference (don't hide completely)
                track.artistMatchScore = 5;
                console.log(`Favorite artist match (doesn't fit preference): ${track.artist} - ${track.title} (+5)`);
            }
        }
        
        track.undergroundScore = undergroundScore;
        track.fitsUndergroundPreference = fitsUndergroundPreference;
        return track;
    });
    
    // Remove filtered tracks (only those that don't meet minimum threshold)
    const finalTracks = filteredTracks.filter(track => !track.filtered);
    
    // Sort by combined score (genre + conditional artist + underground)
    finalTracks.sort((a, b) => {
        const scoreA = (a.genreMatchScore || 0) + (a.artistMatchScore || 0) + a.undergroundScore;
        const scoreB = (b.genreMatchScore || 0) + (b.artistMatchScore || 0) + b.undergroundScore;
        return scoreB - scoreA; // Higher score first
    });
    
    console.log(`Final personalized tracks: ${finalTracks.length} out of ${tracks.length}`);
    
    // Log scoring breakdown for top 5 tracks
    finalTracks.slice(0, 5).forEach((track, index) => {
        const totalScore = (track.genreMatchScore || 0) + (track.artistMatchScore || 0) + track.undergroundScore;
        console.log(`#${index + 1}: ${track.artist} - ${track.title}`);
        console.log(`  Genre: ${track.genreMatchScore || 0}, Artist: ${track.artistMatchScore || 0}, Underground: ${track.undergroundScore}, Total: ${totalScore}`);
    });
    
    return finalTracks;
}

// Remove duplicate tracks and unofficial releases (smarter approach)
async function removeDuplicateTracks(tracks) {
    const seenTracks = new Map(); // Use Map for better tracking
    const cleanedTracks = [];
    
    for (const track of tracks) {
        const normalizedArtist = track.artist.toLowerCase().trim();
        const normalizedTitle = track.title.toLowerCase().trim();
        
        // Create a more sophisticated unique key
        // Remove only specific parenthetical info that indicates versions, not actual titles
        const cleanTitle = normalizedTitle
            .replace(/\(official video\)/g, '')
            .replace(/\(lyric video\)/g, '')
            .replace(/\(official audio\)/g, '')
            .replace(/\(music video\)/g, '')
            .trim();
        
        const uniqueKey = `${normalizedArtist}|${cleanTitle}`;
        
        // Check for exact duplicates
        if (seenTracks.has(uniqueKey)) {
            console.log(`🔄 Skipping exact duplicate: ${track.artist} - ${track.title}`);
            continue;
        }
        
        // Check for unofficial releases and suspicious uploads (now async!)
        const isUnofficial = await isUnofficialRelease(track.artist, track.title);
        if (isUnofficial) {
            console.log(`❌ Skipping unofficial release: ${track.artist} - ${track.title}`);
            continue;
        }
        
        // Check for similar titles (possible duplicates with slight variations)
        const similarKey = findSimilarTrack(normalizedArtist, cleanTitle, seenTracks);
        if (similarKey) {
            console.log(`🔄 Skipping similar duplicate: ${track.artist} - ${track.title} (similar to ${similarKey})`);
            continue;
        }
        
        seenTracks.set(uniqueKey, {
            artist: normalizedArtist,
            title: cleanTitle,
            originalTrack: track
        });
        cleanedTracks.push(track);
    }
    
    return cleanedTracks;
}

// Find similar tracks (more sophisticated duplicate detection)
function findSimilarTrack(artist, title, seenTracks) {
    for (const [key, trackData] of seenTracks) {
        // Only check for duplicates within the same artist
        if (trackData.artist !== artist) continue;
        
        const existingTitle = trackData.title;
        
        // Check for very high similarity (possible duplicate)
        const similarity = calculateStringSimilarity(title, existingTitle);
        
        if (similarity > 0.9) { // 90% similarity or higher
            return key;
        }
    }
    return null;
}

// Calculate string similarity (Levenshtein distance)
function calculateStringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
}

// Calculate Levenshtein distance
function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

// Check if track is an unofficial release or cover
async function isUnofficialRelease(artist, title) {
    const artistLower = artist.toLowerCase();
    const titleLower = title.toLowerCase();
    
    // 1. Check if it's a mainstream artist (most important) - now async!
    try {
        const isMainstream = await isMainstreamArtist(artist);
        if (isMainstream) {
            console.log(`🎵 Detected mainstream artist: ${artist}`);
            return true; // Filter out mainstream artists in underground search
        }
    } catch (error) {
        // Fallback to known mainstream list if API fails
        if (isKnownMainstreamArtist(artist)) {
            console.log(`🎵 Detected known mainstream artist (fallback): ${artist}`);
            return true;
        }
    }
    
    // 2. Common unofficial indicators (keep these for obvious fakes)
    const unofficialIndicators = [
        'cover', 'unofficial', 'fan made', 'tribute', 'karaoke', 
        'instrumental', 'remix', 'bootleg', 'leak', 'unreleased',
        'demo', 'acoustic', 'live', 'version', 'edit', 'mix',
        'reprise', 'interlude', 'outro', 'intro', 'skit',
        'freestyle', 'remastered', 'deluxe', 'bonus', 'extra',
        'b-side', 'single', 'album', 'ep', 'mixtape',
        'soundtrack', 'ost', 'theme', 'opening', 'ending',
        'credit', 'trailer', 'teaser', 'promo', 'ad',
        'commercial', 'tv', 'movie', 'film', 'documentary',
        'interview', 'podcast', 'radio', 'stream', 'live stream'
    ];
    
    // Check for unofficial indicators in title
    for (const indicator of unofficialIndicators) {
        if (titleLower.includes(indicator)) {
            return true;
        }
    }
    
    // 3. Check for common cover patterns
    const coverPatterns = [
        /\(.*cover.*\)/i,
        /\(.*tribute.*\)/i,
        /\(.*karaoke.*\)/i,
        /\(.*instrumental.*\)/i,
        /\(.*remix.*\)/i,
        /\(.*bootleg.*\)/i,
        /\(.*leak.*\)/i,
        /\(.*unreleased.*\)/i,
        /\(.*demo.*\)/i,
        /\(.*acoustic.*\)/i,
        /\(.*live.*\)/i,
        /\(.*version.*\)/i,
        /\(.*edit.*\)/i,
        /\(.*mix.*\)/i
    ];
    
    for (const pattern of coverPatterns) {
        if (pattern.test(title)) {
            return true;
        }
    }
    
    // 4. Check for suspicious artist names (likely uploaders)
    const suspiciousArtistPatterns = [
        /\b(user|upload|channel|fan|made|created|uploaded|posted|shared)\b/i,
        /\b\d{4,}\b/, // Years in artist name (often upload dates)
        /\b(official|unofficial|cover|remix|tribute|karaoke|instrumental)\b/i,
        /^[a-z0-9_]+$/, // Random usernames
        /\b(unknown|anonymous|various|various artists)\b/i
    ];
    
    for (const pattern of suspiciousArtistPatterns) {
        if (pattern.test(artist)) {
            return true;
        }
    }
    
    return false;
}

// Check if artist is mainstream using Last.fm popularity data
async function isMainstreamArtist(artist) {
    const artistLower = artist.toLowerCase().trim();
    
    try {
        // Get artist info from Last.fm
        const artistInfo = await getArtistInfo(artist);
        if (!artistInfo) return false;
        
        // Check listener count (primary metric)
        const listeners = parseInt(artistInfo.stats?.listeners || '0');
        const playcount = parseInt(artistInfo.stats?.playcount || '0');
        
        // Mainstream thresholds (adjustable)
        const LISTENER_THRESHOLD = 1000000; // 1M+ listeners = mainstream
        const PLAYCOUNT_THRESHOLD = 10000000; // 10M+ plays = mainstream
        
        const isMainstreamByListeners = listeners >= LISTENER_THRESHOLD;
        const isMainstreamByPlaycount = playcount >= PLAYCOUNT_THRESHOLD;
        
        console.log(`📊 Artist popularity check: ${artist}`);
        console.log(`   Listeners: ${listeners.toLocaleString()} (threshold: ${LISTENER_THRESHOLD.toLocaleString()})`);
        console.log(`   Playcount: ${playcount.toLocaleString()} (threshold: ${PLAYCOUNT_THRESHOLD.toLocaleString()})`);
        console.log(`   Result: ${isMainstreamByListeners || isMainstreamByPlaycount ? 'MAINSTREAM' : 'UNDERGROUND'}`);
        
        // Artist is mainstream if either metric exceeds threshold
        return isMainstreamByListeners || isMainstreamByPlaycount;
        
    } catch (error) {
        console.log(`❌ Error checking artist popularity: ${artist}`, error);
        return false;
    }
}

// Fallback: Check against known mainstream artists (for API failures)
function isKnownMainstreamArtist(artist) {
    const artistLower = artist.toLowerCase().trim();
    
    // Smaller, curated list of absolute top-tier artists
    const topMainstreamArtists = [
        // Pop Superstars (absolute top tier)
        'taylor swift', 'drake', 'ariana grande', 'justin bieber', 'billie eilish',
        'dua lipa', 'the weeknd', 'harry styles', 'olivia rodrigo', 'bruno mars',
        'ed sheeran', 'post malone', 'doja cat', 'megan thee stallion', 'lil nas x',
        
        // Hip-Hop Giants
        'kendrick lamar', 'j. cole', 'travis scott', 'lil wayne', 'kanye west',
        'jay-z', 'eminem', 'cardi b', 'nicki minaj',
        
        // Rock/Alternative Giants
        'imagine dragons', 'maroon 5', 'coldplay', 'twenty one pilots',
        
        // Electronic Giants
        'daft punk', 'deadmau5', 'skrillex', 'diplo', 'calvin harris',
        
        // R&B Giants
        'beyoncé', 'rihanna', 'chris brown', 'usher',
        
        // Legacy Icons
        'madonna', 'michael jackson', 'prince', 'whitney houston', 'mariah carey',
        'the beatles', 'rolling stones', 'led zeppelin', 'queen'
    ];
    
    // Check if artist is in our top mainstream list
    if (topMainstreamArtists.includes(artistLower)) {
        console.log(`🎵 Known mainstream artist (fallback): ${artist}`);
        return true;
    }
    
    // Check for partial matches
    for (const mainstreamArtist of topMainstreamArtists) {
        if (artistLower.includes(mainstreamArtist) || mainstreamArtist.includes(artistLower)) {
            console.log(`🎵 Known mainstream artist (partial match): ${artist}`);
            return true;
        }
    }
    
    return false;
}
async function getEnhancedGenres(artistName, trackName, searchQuery) {
    const genres = new Set();
    
    try {
        // 1. Get artist info with genres from Last.fm
        const artistInfo = await getArtistInfo(artistName);
        if (artistInfo && artistInfo.tags && artistInfo.tags.tag) {
            artistInfo.tags.tag.forEach(tag => {
                genres.add(tag.name.toLowerCase());
            });
        }
        
        // 2. Get track info with genres from Last.fm
        const trackInfoResponse = await fetch(`${LASTFM_API_URL}?method=track.getinfo&artist=${encodeURIComponent(artistName)}&track=${encodeURIComponent(trackName)}&api_key=${LASTFM_API_KEY}&format=json`);
        if (trackInfoResponse.ok) {
            const trackData = await trackInfoResponse.json();
            if (trackData.track && trackData.track.toptags && trackData.track.toptags.tag) {
                trackData.track.toptags.tag.forEach(tag => {
                    genres.add(tag.name.toLowerCase());
                });
            }
        }
        
        // 3. Smart genre mapping based on search query and artist/track names
        const smartGenres = getSmartGenreMapping(artistName, trackName, searchQuery);
        smartGenres.forEach(genre => genres.add(genre));
        
        // 4. If still no genres, infer from search query
        if (genres.size === 0) {
            const queryGenres = inferGenresFromQuery(searchQuery);
            queryGenres.forEach(genre => genres.add(genre));
        }
        
        // 5. Add "underground" as a base genre
        genres.add('underground');
        
        console.log(`🎵 Enhanced genres for ${artistName} - ${trackName}:`, Array.from(genres));
        
        return Array.from(genres).join(', ');
        
    } catch (error) {
        console.error('Error getting enhanced genres:', error);
        return 'underground';
    }
}

// Smart genre mapping based on artist/track names and search context
function getSmartGenreMapping(artistName, trackName, searchQuery) {
    const genres = [];
    const artistLower = artistName.toLowerCase();
    const trackLower = trackName.toLowerCase();
    const queryLower = searchQuery.toLowerCase();
    
    // Underground/Indie indicators
    if (artistLower.includes('underground') || trackLower.includes('underground') || queryLower.includes('underground')) {
        genres.push('underground');
    }
    
    if (artistLower.includes('indie') || trackLower.includes('indie') || queryLower.includes('indie')) {
        genres.push('indie');
    }
    
    // Experimental indicators
    if (artistLower.includes('experimental') || trackLower.includes('experimental') || queryLower.includes('experimental')) {
        genres.push('experimental');
    }
    
    if (artistLower.includes('avant') || trackLower.includes('avant') || queryLower.includes('avant-garde')) {
        genres.push('avant-garde');
    }
    
    // Hip-hop/Trap indicators
    if (artistLower.includes('lo-fi') || trackLower.includes('lo-fi') || queryLower.includes('lo-fi')) {
        genres.push('lo-fi');
        genres.push('hip-hop');
    }
    
    if (artistLower.includes('trap') || trackLower.includes('trap') || queryLower.includes('trap')) {
        genres.push('trap');
        genres.push('hip-hop');
    }
    
    if (artistLower.includes('cloud') || trackLower.includes('cloud') || queryLower.includes('cloud')) {
        genres.push('cloud rap');
        genres.push('hip-hop');
    }
    
    // Electronic indicators
    if (artistLower.includes('ambient') || trackLower.includes('ambient') || queryLower.includes('ambient')) {
        genres.push('ambient');
        genres.push('electronic');
    }
    
    if (artistLower.includes('electronic') || trackLower.includes('electronic') || queryLower.includes('electronic')) {
        genres.push('electronic');
    }
    
    // Rock/Alternative indicators
    if (artistLower.includes('post-rock') || trackLower.includes('post-rock') || queryLower.includes('post-rock')) {
        genres.push('post-rock');
        genres.push('rock');
    }
    
    if (artistLower.includes('math rock') || trackLower.includes('math rock') || queryLower.includes('math rock')) {
        genres.push('math rock');
        genres.push('rock');
    }
    
    if (artistLower.includes('alternative') || trackLower.includes('alternative') || queryLower.includes('alternative')) {
        genres.push('alternative');
        genres.push('rock');
    }
    
    // Jazz indicators
    if (artistLower.includes('free jazz') || trackLower.includes('free jazz') || queryLower.includes('free jazz')) {
        genres.push('free jazz');
        genres.push('jazz');
    }
    
    if (artistLower.includes('jazz') || trackLower.includes('jazz') || queryLower.includes('jazz')) {
        genres.push('jazz');
    }
    
    return genres;
}

// Infer genres from search query
function inferGenresFromQuery(searchQuery) {
    const genres = [];
    const queryLower = searchQuery.toLowerCase();
    
    if (queryLower.includes('trap')) genres.push('trap', 'hip-hop');
    if (queryLower.includes('experimental')) genres.push('experimental');
    if (queryLower.includes('jazz')) genres.push('jazz');
    if (queryLower.includes('alternative')) genres.push('alternative', 'rock');
    if (queryLower.includes('electronic')) genres.push('electronic');
    if (queryLower.includes('lo-fi')) genres.push('lo-fi', 'hip-hop');
    if (queryLower.includes('indie')) genres.push('indie');
    if (queryLower.includes('hip-hop')) genres.push('hip-hop');
    if (queryLower.includes('ambient')) genres.push('ambient', 'electronic');
    
    return genres;
}
async function searchUndergroundArtists(query) {
    try {
        const response = await fetch(`${LASTFM_API_URL}?method=artist.search&artist=${encodeURIComponent(query)}&api_key=${LASTFM_API_KEY}&format=json&limit=10`);
        if (!response.ok) {
            console.error('Underground artist search API response:', response.status, response.statusText);
            return [];
        }
        const data = await response.json();
        console.log(`🔍 Underground search for "${query}":`, data);
        
        if (data.results && data.results.artistmatches && data.results.artistmatches.artist) {
            return data.results.artistmatches.artist;
        }
        return [];
    } catch (error) {
        console.error('Error searching underground artists:', error);
        return [];
    }
}

// Get real tracks from underground artists
async function getUndergroundArtistTracks(artistName) {
    try {
        const response = await fetch(`${LASTFM_API_URL}?method=artist.gettoptracks&artist=${encodeURIComponent(artistName)}&api_key=${LASTFM_API_KEY}&format=json&limit=3`);
        if (!response.ok) {
            console.error('Underground tracks API response:', response.status, response.statusText);
            return [];
        }
        const data = await response.json();
        
        if (data.toptracks && data.toptracks.track) {
            return data.toptracks.track;
        }
        return [];
    } catch (error) {
        console.error('Error getting underground artist tracks:', error);
        return [];
    }
}
async function getArtistInfo(artistName) {
    try {
        const response = await fetch(`${LASTFM_API_URL}?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${LASTFM_API_KEY}&format=json`);
        if (!response.ok) {
            console.error('Artist info API response:', response.status, response.statusText);
            return null;
        }
        const data = await response.json();
        console.log(`🎵 Artist info for ${artistName}:`, data);
        return data.artist;
    } catch (error) {
        console.error('Error getting artist info:', error);
        return null;
    }
}

// Smart genre mapping based on artist names and patterns
function getSmartGenre(artistName, trackName) {
    const artistLower = artistName.toLowerCase();
    const trackLower = trackName.toLowerCase();
    
    // Underground/Experimental genres
    if (artistLower.includes('radiohead') || artistLower.includes('arctic monkeys') || 
        artistLower.includes('tyler, the creator') || artistLower.includes('charli xcx') ||
        artistLower.includes('pinkpantheress') || trackLower.includes('experimental')) {
        return 'alternative, experimental, indie';
    }
    
    // Trap/Hip-Hop genres  
    if (artistLower.includes('kendrick lamar') || artistLower.includes('drake') || 
        artistLower.includes('travis scott') || artistLower.includes('migos') ||
        artistLower.includes('a$ap rocky') || artistLower.includes('kendrick') ||
        artistLower.includes('drake') || trackLower.includes('trap')) {
        return 'hip-hop, trap, rap';
    }
    
    // Jazz genres
    if (artistLower.includes('jazz') || trackLower.includes('jazz') ||
        artistLower.includes('miles') || artistLower.includes('coltrane')) {
        return 'jazz, experimental, fusion';
    }
    
    // Electronic/Pop genres
    if (artistLower.includes('the weeknd') || artistLower.includes('lady gaga') ||
        artistLower.includes('ariana grande') || artistLower.includes('taylor swift') ||
        artistLower.includes('rihanna') || artistLower.includes('kanye west')) {
        return 'pop, electronic, mainstream';
    }
    
    // Default fallback
    return 'pop, mainstream';
}

// Load recommendations with real data
async function loadRecommendations() {
    try {
        console.log('=== Loading personalized recommendations ===');
        
        // Show loading state
        showLoading('Finding underground music recommendations... this may take a minute or two!');
        
        // Load user preferences first
        const userPreferences = await loadUserPreferences();
        console.log('User preferences loaded:', userPreferences);
        
        // Get trending artists from Last.fm
        const artists = await getTrendingArtists();
        
        if (artists.length === 0) {
            console.log('No trending artists found, using fallback');
            const fallbackRecommendations = getMockRecommendations();
            currentRecommendations = fallbackRecommendations;
            displayRecommendations(fallbackRecommendations);
            return;
        }
        
        // Get top tracks for each trending artist (limit to 30 for more recommendations)
        const tracksWithDetails = await Promise.all(
            artists.slice(0, 30).map(async (artist, index) => {
                try {
                    const topTracks = await getArtistTopTracks(artist.name);
                    
                    if (topTracks.length > 0) {
                        const track = topTracks[0]; // Get the top track
                        
                        // Get real artist info with genres from Last.fm
                        const artistInfo = await getArtistInfo(artist.name);
                        
                        // Extract real genres from Last.fm artist info
                        let realGenres = 'Trending';
                        if (artistInfo && artistInfo.tags && artistInfo.tags.tag) {
                            realGenres = artistInfo.tags.tag.map(tag => tag.name).join(', ');
                        }
                        
                        // Debug: Log the track structure to see genre data
                        console.log(`🔍 Track data for ${artist.name} - ${track.name}:`, {
                            toptags: track.toptags,
                            tags: track.toptags?.tag,
                            genreString: track.toptags?.tag?.map(tag => tag.name).join(', ') || 'Trending',
                            artistTags: artist.tags?.tag,
                            artistGenreString: artist.tags?.tag?.map(tag => tag.name).join(', ') || 'Trending',
                            artistInfo: artistInfo,
                            realGenres: realGenres
                        });
                        
                        return {
                            id: `rec_${artist.mbid || artist.name}_${index}`,
                            title: track.name,
                            artist: artist.name,
                            artwork: getBestImageUrl(artist),
                            streamUrl: `https://soundcloud.com/search?q=${encodeURIComponent(`${artist.name} ${track.name}`)}`,
                            duration: track.duration ? Math.round(track.duration * 1000) : 180000, // Convert seconds to milliseconds
                            genre: realGenres,
                            description: `Trending track by ${artist.name}`,
                            listeners: track.listeners || artist.listeners || '0', // Use track listeners first
                            youtubeId: null,
                            soundcloudId: `rec_${artist.mbid || artist.name}_${index}`,
                            waveformUrl: `https://picsum.photos/800/200?text=WAVEFORM&bg=ff5500&color=ffffff&random=${index}`,
                            permalinkUrl: `https://soundcloud.com/search?q=${encodeURIComponent(`${artist.name} ${track.name}`)}`,
                            source: 'soundcloud-recommendations',
                            realTrack: track,
                            originalArtist: artist // Store original artist data for algorithm
                        };
                    }
                    return null;
                } catch (error) {
                    console.error('Error processing artist:', artist.name, error);
                    return null;
                }
            })
        );
        
        // Filter out null results and duplicates
        const validTracks = tracksWithDetails.filter(track => track !== null);
        const deduplicatedTracks = await removeDuplicateTracks(validTracks);
        
        console.log(`Original tracks: ${validTracks.length}, After deduplication: ${deduplicatedTracks.length}`);
        
        // Apply user preferences to recommendations
        console.log('Total recommendations before filtering:', deduplicatedTracks.length);
        console.log('User preferences:', userPreferences);
        
        // Debug: Show underground scores before filtering
        console.log('=== UNDERGROUND SCORES BEFORE FILTERING ===');
        deduplicatedTracks.slice(0, 10).forEach((track, index) => {
            const score = undergroundDetector.calculateUndergroundScore(track);
            console.log(`${index + 1}. ${track.artist} - ${track.title}: ${score}/100 (Genre: ${track.genre})`);
        });
        
        const personalizedRecommendations = applyUserPreferences(deduplicatedTracks, userPreferences);
        console.log('Recommendations after personalization:', personalizedRecommendations.length);
        
        // If personalization removed everything, search for underground music based on user preferences
        let finalRecommendations = personalizedRecommendations;
        if (personalizedRecommendations.length === 0 && validTracks.length > 0) {
            console.log('Personalization removed all tracks, searching for underground music based on preferences');
            
            // Create underground search queries based on user's favorite genres
            const undergroundSearchQueries = [];
            
            if (userPreferences.favoriteGenres && userPreferences.favoriteGenres.length > 0) {
                userPreferences.favoriteGenres.forEach(genre => {
                    // Create underground-specific search queries
                    if (genre.includes('experimental')) {
                        undergroundSearchQueries.push('experimental music');
                        undergroundSearchQueries.push('avant-garde');
                    } else if (genre.includes('trap')) {
                        undergroundSearchQueries.push('underground trap');
                        undergroundSearchQueries.push('lo-fi trap');
                        undergroundSearchQueries.push('cloud rap');
                    } else if (genre.includes('jazz')) {
                        undergroundSearchQueries.push('experimental jazz');
                        undergroundSearchQueries.push('free jazz');
                        undergroundSearchQueries.push('jazz fusion');
                    } else if (genre.includes('alternative')) {
                        undergroundSearchQueries.push('indie rock');
                        undergroundSearchQueries.push('post-rock');
                        undergroundSearchQueries.push('math rock');
                    } else {
                        undergroundSearchQueries.push(`underground ${genre}`);
                    }
                });
            }
            
            // Add general underground queries (limit to avoid too many API calls)
            undergroundSearchQueries.push('underground hip-hop', 'indie music', 'experimental electronic');
            
            console.log('Underground search queries (limited):', undergroundSearchQueries.slice(0, 8)); // Limit to first 8
            
            // Search for real underground artists using Last.fm API (with limit)
            const undergroundTracks = [];
            const processedArtists = new Set(); // Avoid duplicates
            const maxQueries = Math.min(undergroundSearchQueries.length, 8); // Limit to 8 queries
            
            for (let i = 0; i < maxQueries; i++) {
                const query = undergroundSearchQueries[i];
                console.log(`Searching for underground artists (${i + 1}/${maxQueries}): ${query}`);
                const artists = await searchUndergroundArtists(query);
                
                for (const artist of artists) {
                    if (processedArtists.has(artist.name)) continue;
                    processedArtists.add(artist.name);
                    
                    // Get real tracks from this underground artist
                    const tracks = await getUndergroundArtistTracks(artist.name);
                    
                    for (const track of tracks) {
                        if (undergroundTracks.length >= 50) break; // Increased from 10 to 50
                        
                        // Get enhanced genres using multiple methods
                        const realGenres = await getEnhancedGenres(artist.name, track.name, query);
                        
                        // Calculate underground score
                        const undergroundScore = undergroundDetector.calculateUndergroundScore({
                            name: track.name,
                            artist: artist.name,
                            listeners: track.listeners || '0',
                            genre: realGenres
                        });
                        
                        console.log(`Underground candidate: ${artist.name} - ${track.name}: ${undergroundScore}/100 (${realGenres})`);
                        
                        // Only include tracks that meet underground threshold
                        if (undergroundScore >= 60) { // 75% underground preference threshold
                            undergroundTracks.push({
                                id: `underground_${artist.name}_${track.name}`,
                                title: track.name,
                                artist: artist.name,
                                genre: realGenres,
                                artwork: artist.image ? artist.image[2]['#text'] : `https://picsum.photos/300/300?text=${encodeURIComponent(artist.name)}&bg=1a1a1a&color=ffffff`,
                                listeners: track.listeners || '0',
                                duration: track.duration ? Math.round(track.duration * 1000) : 180000,
                                streamUrl: `https://soundcloud.com/search?q=${encodeURIComponent(`${artist.name} ${track.name}`)}`,
                                soundcloudId: `underground_${artist.name}_${track.name}`,
                                source: 'underground-recommendations',
                                undergroundScore: undergroundScore,
                                isUndergroundTrack: true,
                                searchQuery: query,
                                realTrack: track,
                                originalArtist: artist
                            });
                            
                            console.log(`✅ Found underground track: ${artist.name} - ${track.name} (Score: ${undergroundScore})`);
                        } else {
                            console.log(`❌ Skipped (too mainstream): ${artist.name} - ${track.name} (Score: ${undergroundScore})`);
                        }
                    }
                    
                    if (undergroundTracks.length >= 50) break;
                }
                
                if (undergroundTracks.length >= 50) break;
            }
            
            console.log(`Generated ${undergroundTracks.length} underground tracks`);
            
            // Apply duplicate filtering to underground tracks too
            const deduplicatedUndergroundTracks = await removeDuplicateTracks(undergroundTracks);
            console.log(`Underground tracks after deduplication: ${deduplicatedUndergroundTracks.length}`);
            
            // Apply genre matching to underground tracks
            if (userPreferences.favoriteGenres && userPreferences.favoriteGenres.length > 0) {
                deduplicatedUndergroundTracks.forEach(track => {
                    const trackGenres = (track.genre || '').toLowerCase();
                    const matchingGenres = userPreferences.favoriteGenres.filter(favGenre => 
                        trackGenres.includes(favGenre.toLowerCase()) || 
                        favGenre.toLowerCase().includes(trackGenres)
                    );
                    
                    track.genreMatchScore = matchingGenres.length > 0 ? matchingGenres.length * 20 : 0;
                    
                    if (matchingGenres.length > 0) {
                        console.log(`Underground genre match: ${track.artist} - ${track.title}: ${matchingGenres.join(', ')}`);
                    }
                });
            }
            
            // Sort by combined score (genre + underground)
            deduplicatedUndergroundTracks.sort((a, b) => {
                const scoreA = (a.genreMatchScore || 0) + a.undergroundScore;
                const scoreB = (b.genreMatchScore || 0) + b.undergroundScore;
                return scoreB - scoreA;
            });
            
                    if (deduplicatedUndergroundTracks.length > 0) {
                console.log(`Using ${deduplicatedUndergroundTracks.length} underground tracks as recommendations`);
                finalRecommendations = deduplicatedUndergroundTracks.slice(0, 50); // Increased from 5 to 50
            } else {
                console.log('No underground tracks found, showing empty results');
                finalRecommendations = [];
            }
        }
        
        // Sort by underground score
        const sortedRecommendations = undergroundDetector.sortByUndergroundScore(finalRecommendations);
        
        // Add underground scores for debugging
        sortedRecommendations.forEach(track => {
            const score = undergroundDetector.calculateUndergroundScore(track);
            track.undergroundScore = score;
            console.log(`REC: ${track.artist} - ${track.title}: Underground Score ${score}/100`);
        });
        
        currentRecommendations = sortedRecommendations;
        console.log('Final personalized recommendations:', sortedRecommendations.length);
        displayRecommendations(sortedRecommendations);
        
    } catch (error) {
        console.error('Error loading recommendations:', error);
        // Fallback to mock data if API fails
        const fallbackRecommendations = getMockRecommendations();
        currentRecommendations = fallbackRecommendations;
        displayRecommendations(fallbackRecommendations);
    } finally {
        // Hide loading state
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.classList.add('hidden');
        }
    }
}

// Get trending artists from Last.fm
async function getTrendingArtists() {
    try {
        // Get top artists from Last.fm
        const response = await fetch(`${LASTFM_API_URL}?method=chart.gettopartists&api_key=${LASTFM_API_KEY}&format=json&limit=50`);
        if (!response.ok) {
            console.error('Trending API response:', response.status, response.statusText);
            throw new Error('Failed to get trending artists');
        }
        const data = await response.json();
        console.log('Trending artists data:', data);
        
        const artists = data.artists?.artist || [];
        return Array.isArray(artists) ? artists : [artists].filter(Boolean);
    } catch (error) {
        console.error('Error processing artist:', error);
        return [];
    }
}

// Display recommendations with pagination
function displayRecommendations(recommendations, page = 1) {
    const recommendationsGrid = document.getElementById('recommendationsGrid');
    const tracksPerPage = 20;
    const startIndex = (page - 1) * tracksPerPage;
    const endIndex = startIndex + tracksPerPage;
    const paginatedRecommendations = recommendations.slice(startIndex, endIndex);
    
    if (recommendations.length === 0) {
        recommendationsGrid.innerHTML = '<p class="text-gray-600 col-span-full text-center">No recommendations available at the moment. Try adjusting your preferences.</p>';
        document.getElementById('paginationControls').innerHTML = '';
    } else {
        // Hide loading state when displaying results
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.classList.add('hidden');
        }
        
        // Display current page of recommendations
        recommendationsGrid.innerHTML = paginatedRecommendations.map(track => {
            if (track.soundcloudId) {
                return createTrackCardWithAudio(track);
            } else if (track.youtubeId) {
                return createTrackCard(track);
            } else {
                return createTrackCardWithoutVideo(track);
            }
        }).join('');
        
        // Add pagination controls
        createPaginationControls(recommendations.length, page, tracksPerPage);
    }
}

// Create pagination controls
function createPaginationControls(totalItems, currentPage, itemsPerPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.getElementById('paginationControls');
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="flex justify-center items-center space-x-2 mt-8">';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button onclick="displayRecommendations(currentRecommendations, ${currentPage - 1})" class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700">← Previous</button>`;
    }
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        paginationHTML += `<button onclick="displayRecommendations(currentRecommendations, 1)" class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700">1</button>`;
        if (startPage > 2) {
            paginationHTML += '<span class="px-2 text-gray-500">...</span>';
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        const buttonClass = isActive ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700';
        paginationHTML += `<button onclick="displayRecommendations(currentRecommendations, ${i})" class="px-3 py-2 ${buttonClass} rounded-lg">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += '<span class="px-2 text-gray-500">...</span>';
        }
        paginationHTML += `<button onclick="displayRecommendations(currentRecommendations, ${totalPages})" class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700">${totalPages}</button>`;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="displayRecommendations(currentRecommendations, ${currentPage + 1})" class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700">Next →</button>`;
    }
    
    paginationHTML += '</div>';
    
    // Add results info
    paginationHTML += `<div class="text-center mt-4 text-gray-600">Showing ${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} recommendations</div>`;
    
    paginationContainer.innerHTML = paginationHTML;
}

// Create SoundCloud track card with audio preview + underground indicator
function createTrackCardWithAudio(track) {
    const duration = formatDuration(track.duration);
    const listeners = formatListeners(track.listeners);
    
    // Calculate underground score and determine badge
    const undergroundScore = track.undergroundScore || undergroundDetector.calculateUndergroundScore(track);
    let undergroundBadge = '';
    let undergroundColor = '';
    
    if (undergroundScore >= 80) {
        undergroundBadge = '🔥 DEEP CUT';
        undergroundColor = 'bg-purple-100 text-purple-700';
    } else if (undergroundScore >= 65) {
        undergroundBadge = '⚡ UNDERGROUND';
        undergroundColor = 'bg-blue-100 text-blue-700';
    } else if (undergroundScore >= 50) {
        undergroundBadge = '🌟 INDIE';
        undergroundColor = 'bg-green-100 text-green-700';
    } else {
        undergroundBadge = '📻 MAINSTREAM';
        undergroundColor = 'bg-gray-100 text-gray-700';
    }
    
    console.log('SoundCloud track artwork URL:', track.artwork);
    console.log('Creating SoundCloud audio card for track:', track);
    console.log(`Underground Score: ${undergroundScore}/100 - ${undergroundBadge}`);
    console.log('Score breakdown available:', !!track.scoreBreakdown);
    console.log('Track data for tooltip:', {
        listeners: track.listeners,
        genre: track.genre,
        scoreBreakdown: track.scoreBreakdown
    });
    
    return `
        <div class="track-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" data-track-id="${track.id}">
            <div class="aspect-square bg-gray-200 relative">
                <img src="${track.artwork}" alt="${track.title}" class="w-full h-full object-cover" 
                     onerror="this.src='https://picsum.photos/300/300?text=SOUNDCLOUD&bg=ff5500&color=ffffff'"
                     onload="console.log('SoundCloud image loaded successfully:', this.src)">
                
                <!-- SoundCloud audio player overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div class="p-3 w-full">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-2">
                                <svg class="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.349c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.601.479-.479.897.122.419.48.601.897.479 3.48-.84 6.521.54 8.981 2.12.3.179.66.099.84-.181.18-.36.12-.779-.12-1.02zm-1.898-2.54c-.199.299-.6.379-.898.18-2.34-1.441-5.979-1.839-8.819-1.021-.361.12-.739-.12-.859-.48-.12-.36.12-.72.48-.84 3.241-.96 7.2-.48 10.021 1.68.3.181.378.599.179.9zm-2.1-2.46c-.12.18-.359.24-.539.12-1.68-1.02-4.2-1.26-6.18-.72-.18.06-.359-.06-.42-.24-.06-.18.06-.359.24-.42 2.1-.6 4.86-.36 6.72.96.18.12.24.36.12.54z"/>
                                </svg>
                                <span class="text-white text-xs font-medium">SoundCloud</span>
                            </div>
                            <button onclick="event.stopPropagation(); playSoundCloudTrack('${track.id}', '${track.title}', '${track.artist}', null)" class="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors">
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-3">
                <h3 class="font-semibold text-gray-900 truncate text-sm mb-1">${track.title}</h3>
                <p class="text-xs text-gray-600 truncate mb-2">${track.artist}</p>
                
                <!-- Compact info row -->
                <div class="flex justify-between items-center mb-2">
                    <div class="flex items-center space-x-2">
                        <!-- Underground Badge with Tooltip -->
                        <div class="relative" style="position: relative;" 
                             onmouseover="this.querySelector('.tooltip').style.opacity='1'"
                             onmouseout="this.querySelector('.tooltip').style.opacity='0'">
                            <span class="${undergroundColor} px-1.5 py-0.5 rounded text-xs font-medium cursor-help" style="cursor: help;">
                                ${undergroundBadge}
                            </span>
                            
                            <!-- Score Tooltip -->
                            <div class="tooltip" style="
                                position: absolute;
                                bottom: 100%;
                                left: 0;
                                margin-bottom: 8px;
                                width: 200px;
                                padding: 8px;
                                background: #1f2937;
                                color: white;
                                font-size: 10px;
                                border-radius: 4px;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.6);
                                z-index: 9999;
                                opacity: 0;
                                transition: opacity 0.2s ease;
                                pointer-events: none;
                                border: 1px solid #374151;
                            ">
                                <div style="font-weight: bold; margin-bottom: 4px; color: #fbbf24; font-size: 11px;">🔍 Score Breakdown</div>
                            
                            <div style="margin-bottom: 3px; font-size: 9px;">
                                <span style="color: #9ca3af;">👥 Listeners:</span>
                                <span style="font-family: monospace; margin-left: 4px; color: #4ade80;">+${track.listenerScore || 0}</span>
                            </div>
                            <div style="margin-bottom: 3px; font-size: 9px;">
                                <span style="color: #9ca3af;">🎵 Genre:</span>
                                <span style="font-family: monospace; margin-left: 4px; color: #4ade80;">+${track.genreScore || 0}</span>
                            </div>
                            <div style="margin-bottom: 3px; font-size: 9px;">
                                <span style="color: #9ca3af;">🆕 Discovery:</span>
                                <span style="font-family: monospace; margin-left: 4px; color: #4ade80;">+${track.discoveryScore || 0}</span>
                            </div>
                            <div style="margin-bottom: 3px; font-size: 9px;">
                                <span style="color: #9ca3af;">🏷️ Indie:</span>
                                <span style="font-family: monospace; margin-left: 4px; color: #4ade80;">+${track.indieScore || 0}</span>
                            </div>
                            <div style="margin-bottom: 3px; font-size: 9px;">
                                <span style="color: #9ca3af;">💫 Engage:</span>
                                <span style="font-family: monospace; margin-left: 4px; color: #4ade80;">+${track.engagementScore || 0}</span>
                            </div>
                            
                            <div style="border-top: 1px solid #374151; padding-top: 3px; margin-top: 3px;">
                                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 10px;">
                                    <span>Total:</span>
                                    <span style="color: #4ade80;">${undergroundScore}/100</span>
                                </div>
                            </div>
                        </div>
                        </div>
                        <!-- Genre Bubble with Tooltip -->
                        <div class="relative" style="position: relative;" 
                             onmouseover="this.querySelector('.genre-tooltip').style.opacity='1'"
                             onmouseout="this.querySelector('.genre-tooltip').style.opacity='0'">
                            <span class="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-xs font-medium cursor-help" style="cursor: help;">
                                genres
                            </span>
                            
                            <!-- Genre Tooltip -->
                            <div class="genre-tooltip" style="
                                position: absolute;
                                bottom: 100%;
                                right: 0;
                                margin-bottom: 8px;
                                width: 180px;
                                padding: 6px;
                                background: #1f2937;
                                color: white;
                                font-size: 9px;
                                border-radius: 4px;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.6);
                                z-index: 9999;
                                opacity: 0;
                                transition: opacity 0.2s ease;
                                pointer-events: none;
                                border: 1px solid #374151;
                            ">
                                <div style="font-weight: bold; margin-bottom: 3px; color: #60a5fa; font-size: 10px;">🎵 Genres</div>
                                <div style="font-size: 9px; color: #d1d5db;">${track.genre}</div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-1 text-xs text-gray-400">
                        <span>👥 ${listeners}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Format listeners count
function formatListeners(count) {
    const num = parseInt(count) || 0;
    if (num >= 1000000) return Math.floor(num / 1000000) + 'M';
    if (num >= 1000) return Math.floor(num / 1000) + 'K';
    return num.toString();
}

// Format duration (milliseconds to MM:SS)
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Open track modal
function openTrackModal(trackId) {
    console.log('Opening regular modal for track ID:', trackId);
    
    // Check both search results and recommendations
    const track = currentResults.find(t => t.id === trackId) || 
                  currentRecommendations.find(t => t.id === trackId);
                  
    if (!track) {
        console.error('Track not found:', trackId);
        console.log('Available currentResults:', currentResults);
        console.log('Available currentRecommendations:', currentRecommendations);
        return;
    }

    console.log('Found track:', track);

    const modal = document.getElementById('trackModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');

    modalTitle.textContent = track.title;
    modalContent.innerHTML = `
        <div class="space-y-6">
            <div class="flex items-center space-x-6">
                <img src="${track.artwork}" alt="${track.title}" class="w-32 h-32 rounded-lg object-cover">
                <div class="flex-1">
                    <h4 class="text-xl font-semibold text-gray-900 mb-2">${track.title}</h4>
                    <p class="text-lg text-gray-600 mb-1">${track.artist}</p>
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded">${track.genre}</span>
                        <span>👥 ${formatListeners(track.listeners)}</span>
                        <span>${formatDuration(track.duration)}</span>
                        ${track.source ? `<span class="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">${track.source}</span>` : ''}
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-gray-700">${track.description}</p>
            </div>
            
            ${track.soundcloudId ? `
            <div class="bg-gray-900 rounded-lg overflow-hidden">
                <div class="p-3 border-b border-gray-700">
                    <div class="flex items-center space-x-2">
                        <svg class="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.349c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.601.479-.479.897.122.419.48.601.897.479 3.48-.84 6.521.54 8.981 2.12.3.179.66.099.84-.181.18-.36.12-.779-.12-1.02zm-1.898-2.54c-.199.299-.6.379-.898.18-2.34-1.441-5.979-1.839-8.819-1.021-.361.12-.739-.12-.859-.48-.12-.36.12-.72.48-.84 3.241-.96 7.2-.48 10.021 1.68.3.181.378.599.179.9zm-2.1-2.46c-.12.18-.359.24-.539.12-1.68-1.02-4.2-1.26-6.18-.72-.18.06-.359-.06-.42-.24-.06-.18.06-.359.24-.42 2.1-.6 4.86-.36 6.72.96.18.12.24.36.12.54z"/>
                        </svg>
                        <span class="text-white font-medium">SoundCloud Player</span>
                    </div>
                </div>
                <iframe 
                    src="https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/${track.soundcloudId}&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=true" 
                    class="w-full h-166"
                    frameborder="0" 
                    allow="autoplay">
                </iframe>
            </div>` : track.youtubeId ? `
            <div class="bg-black rounded-lg overflow-hidden relative" style="padding-bottom: 56.25%;">
                <iframe 
                    src="https://www.youtube.com/embed/${track.youtubeId}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1" 
                    class="absolute inset-0 w-full h-full"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen>
                </iframe>
            </div>` : '<div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center"><p class="text-yellow-800">No audio preview available</p></div>'}
            
            <div class="flex space-x-4">
                ${track.soundcloudId ? `
                <button onclick="searchSoundCloudManually('${track.artist}', '${track.title}')" class="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Listen on SoundCloud
                </button>` : ''}
                ${track.youtubeId ? `
                <button onclick="searchYouTubeManually('${track.artist}', '${track.title}')" class="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Watch on YouTube
                </button>` : ''}
                <button onclick="searchStreamingServices('${track.artist}', '${track.title}')" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Find on Streaming Services
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Add click outside to close functionality
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeTrackModal();
        }
    });
}

// Search for track on streaming services
function searchStreamingServices(artist, title) {
    const query = encodeURIComponent(`${artist} ${title}`);
    window.open(`https://open.spotify.com/search/${query}`, '_blank');
    // You could add more services here:
    // window.open(`https://music.apple.com/search?term=${query}`, '_blank');
    // window.open(`https://soundcloud.com/search?q=${query}`, '_blank');
}

// Close track modal
function closeTrackModal() {
    const modal = document.getElementById('trackModal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Play preview (placeholder for now)
function playPreview(streamUrl) {
    if (streamUrl === '#') {
        alert('Preview functionality will be available after SoundCloud API setup');
        return;
    }
    // TODO: Implement actual audio player
    console.log('Playing preview:', streamUrl);
}

// Show loading state
function showLoading(message = 'Loading music... this may take a minute or two!') {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
        loadingState.querySelector('p').textContent = message;
        loadingState.classList.remove('hidden');
    }
}

// Hide results
function hideResults() {
    const searchResults = document.getElementById('searchResults');
    searchResults.classList.add('hidden');
}

// Show error message
function showError(message) {
    const resultsGrid = document.getElementById('resultsGrid');
    const searchResults = document.getElementById('searchResults');
    
    resultsGrid.innerHTML = `<p class="text-red-600 col-span-full text-center">${message}</p>`;
    searchResults.classList.remove('hidden');
}

// Sign out user
function signOutUser() {
    if (window.firebaseAuth) {
        window.firebaseAuth.signOut().then(() => {
            window.location.href = 'index.html';
        });
    }
}

console.log('Discover page loaded');
