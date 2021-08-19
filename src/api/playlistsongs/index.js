const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistSongs',
  version: '1.0.0',
  register: async (server, {
    service, playlistsService, songsService, validator,
  }) => {
    const playlistSongsHandler = new PlaylistSongsHandler(
      service, playlistsService, songsService, validator,
    );
    server.route(routes(playlistSongsHandler));
  },
};
