const AudioServer = require('./classes/AudioServer');

const config = {
    port: process.env.PORT || 9339,
    audioDirectory: process.env.AUDIO_DIR || './audio'
};

const server = new AudioServer(config);

server.start().catch((error) => {
    console.error('Server startup error:', error);
    process.exit(1);
});

module.exports = server;
