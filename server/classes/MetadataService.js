const fs = require('fs');
const path = require('path');
const { parseFile } = require('music-metadata');

class MetadataService {
    constructor(audioDirectory = './audio') {
        this.audioDirectory = audioDirectory;
    }

    async getMetadata(filename) {
        try {
            const filePath = path.join(this.audioDirectory, filename);

            if (!fs.existsSync(filePath)) {
                throw new Error(`File ${filename} not found`);
            }

            const metadata = await parseFile(filePath);

            return {
                filename: filename,
                title: metadata.common.title || path.parse(filename).name,
                artist: metadata.common.artist || 'Unknown artist',
                album: metadata.common.album || 'Unknown album',
                year: metadata.common.year || null,
                genre: metadata.common.genre || [],
                duration: metadata.format.duration || 0,
                bitrate: metadata.format.bitrate || 0,
                sampleRate: metadata.format.sampleRate || 0,
                numberOfChannels: metadata.format.numberOfChannels || 0,
                codec: metadata.format.codec || null,
                lossless: metadata.format.lossless || false,
                container: metadata.format.container || null,
                albumArt: this.extractAlbumArt(metadata.common.picture)
            };
        } catch (error) {
            throw new Error(`Error extracting metadata: ${error.message}`);
        }
    }

    extractAlbumArt(pictures) {
        if (!pictures || pictures.length === 0) {
            return null;
        }

        const cover = pictures.find(pic => pic.name === 'Cover (front)') || pictures[0];

        if (cover && cover.data) {
            const base64 = cover.data.toString('base64');
            const mimeType = cover.format || 'image/jpeg';
            return `data:${mimeType};base64,${base64}`;
        }

        return null;
    }

    async getAllTracks() {
        try {
            const files = fs.readdirSync(this.audioDirectory);
            const audioExtensions = ['.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a'];

            const tracks = [];

            for (const file of files) {
                const ext = path.extname(file).toLowerCase();
                if (audioExtensions.includes(ext)) {
                    try {
                        const metadata = await this.getMetadata(file);
                        tracks.push(metadata);
                    } catch (error) {
                        console.warn(`Failed to process file ${file}: ${error.message}`);
                        tracks.push({
                            filename: file,
                            title: path.parse(file).name,
                            artist: 'Unknown artist',
                            album: 'Unknown album',
                            duration: 0,
                            error: error.message
                        });
                    }
                }
            }

            return tracks;
        } catch (error) {
            throw new Error(`Error getting tracks list: ${error.message}`);
        }
    }

    isAudioFile(filename) {
        const audioExtensions = ['.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a'];
        const ext = path.extname(filename).toLowerCase();
        return audioExtensions.includes(ext);
    }
}

module.exports = MetadataService;
