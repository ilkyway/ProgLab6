const express = require('express');
const cors = require('cors');
const path = require('path');
const AudioService = require('./AudioService');
const MetadataService = require('./MetadataService');

class AudioServer {
    constructor(options = {}) {
        this.port = options.port || 3000;
        this.audioDirectory = options.audioDirectory || './audio';
        this.app = express();

        this.audioService = new AudioService(this.audioDirectory);
        this.metadataService = new MetadataService(this.audioDirectory);

        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        this.app.use('/static', express.static(this.audioDirectory));

        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
            next();
        });
    }

    setupRoutes() {
        this.app.get('/api/stream/:filename', async (req, res) => {
            try {
                const { filename } = req.params;

                if (!this.audioService.fileExists(filename)) {
                    return res.status(404).json({
                        error: 'File not found',
                        filename: filename
                    });
                }

                await this.audioService.streamAudio(filename, req, res);
            } catch (error) {
                console.error('Streaming error:', error);
                res.status(500).json({
                    error: 'Server error during streaming',
                    details: error.message
                });
            }
        });

        this.app.get('/api/metadata/:filename', async (req, res) => {
            try {
                const { filename } = req.params;

                if (!this.audioService.fileExists(filename)) {
                    return res.status(404).json({
                        error: 'File not found',
                        filename: filename
                    });
                }

                const metadata = await this.metadataService.getMetadata(filename);
                res.json(metadata);
            } catch (error) {
                console.error('Metadata extraction error:', error);
                res.status(500).json({
                    error: 'Error extracting metadata',
                    details: error.message
                });
            }
        });

        this.app.get('/api/tracks', async (req, res) => {
            try {
                const tracks = await this.metadataService.getAllTracks();
                const simplifiedTracks = tracks.map(track => ({
                    name: track.title || track.filename,
                    artist: track.artist || 'Unknown artist',
                    art: track.albumArt || null,
                    filename: track.filename
                }));
                res.json({
                    count: simplifiedTracks.length,
                    tracks: simplifiedTracks
                });
            } catch (error) {
                console.error('Error getting tracks list:', error);
                res.status(500).json({
                    error: 'Error getting tracks list',
                    details: error.message
                });
            }
        });

        this.app.get('/api/info/:filename', (req, res) => {
            try {
                const { filename } = req.params;
                const fileInfo = this.audioService.getFileInfo(filename);

                if (!fileInfo) {
                    return res.status(404).json({
                        error: 'File not found',
                        filename: filename
                    });
                }

                res.json(fileInfo);
            } catch (error) {
                console.error('Error getting file info:', error);
                res.status(500).json({
                    error: 'Error getting file info',
                    details: error.message
                });
            }
        });

        this.app.get('/', (req, res) => {
            res.json({
                message: 'Audio Streaming Server API',
                version: '1.0.0',
                endpoints: {
                    'GET /api/stream/:filename': 'Stream audio file',
                    'GET /api/metadata/:filename': 'Audio file metadata',
                    'GET /api/tracks': 'List of all tracks with metadata',
                    'GET /api/info/:filename': 'File information'
                }
            });
        });

        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Route not found',
                availableRoutes: [
                    'GET /',
                    'GET /api/stream/:filename',
                    'GET /api/metadata/:filename',
                    'GET /api/tracks',
                    'GET /api/info/:filename'
                ]
            });
        });

        this.app.use((error, req, res, next) => {
            console.error('Unhandled error:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        });
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(this.port, () => {
                    console.log(`Server started on port ${this.port}`);
                    resolve(this.server);
                });

                this.server.on('error', (error) => {
                    console.error('Server startup error:', error);
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    console.log('Server stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = AudioServer;