const fs = require('fs');
const path = require('path');

class AudioService {
    constructor(audioDirectory = './audio') {
        this.audioDirectory = audioDirectory;
    }

    async streamAudio(filename, req, res) {
        try {
            const filePath = path.join(this.audioDirectory, filename);

            if (!fs.existsSync(filePath)) {
                res.status(404).json({ error: `File ${filename} not found` });
                return;
            }

            const stat = fs.statSync(filePath);
            const fileSize = stat.size;
            const range = req.headers.range;

            if (range) {
                const parts = range.replace(/bytes=/, '').split('-');
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunksize = (end - start) + 1;

                const file = fs.createReadStream(filePath, { start, end });

                const contentType = this.getContentType(filename);

                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': contentType,
                    'Cache-Control': 'no-cache'
                };

                res.writeHead(206, head);
                file.pipe(res);

                file.on('error', (error) => {
                    console.error('Streaming error:', error);
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Server error' });
                    }
                });

            } else {
                const contentType = this.getContentType(filename);

                res.writeHead(200, {
                    'Content-Length': fileSize,
                    'Content-Type': contentType,
                    'Accept-Ranges': 'bytes'
                });

                const fileStream = fs.createReadStream(filePath);
                fileStream.pipe(res);

                fileStream.on('error', (error) => {
                    console.error('Streaming error:', error);
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Server error' });
                    }
                });
            }
        } catch (error) {
            console.error('Error in AudioService.streamAudio:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    getContentType(filename) {
        const ext = path.extname(filename).toLowerCase();

        const contentTypes = {
            '.mp3': 'audio/mpeg',
            '.flac': 'audio/flac',
            '.wav': 'audio/wav',
            '.aac': 'audio/aac',
            '.ogg': 'audio/ogg',
            '.m4a': 'audio/mp4'
        };

        return contentTypes[ext] || 'application/octet-stream';
    }

     getFileInfo(filename) {
        try {
            const filePath = path.join(this.audioDirectory, filename);

            if (!fs.existsSync(filePath)) {
                return null;
            }

            const stat = fs.statSync(filePath);

            return {
                filename: filename,
                size: stat.size,
                created: stat.birthtime,
                modified: stat.mtime,
                contentType: this.getContentType(filename)
            };
        } catch (error) {
            console.error('Error getting file info:', error);
            return null;
        }
    }

    fileExists(filename) {
        const filePath = path.join(this.audioDirectory, filename);
        return fs.existsSync(filePath);
    }
}

module.exports = AudioService;
