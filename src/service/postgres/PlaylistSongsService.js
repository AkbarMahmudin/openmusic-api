const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongs {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSongToPlaylist({ playlistId, songId }) {
    const id = `playlistsong-${nanoid(16)}`;
    const sql = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(sql);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    await this._cacheService.delete(`playlistsong:${playlistId}`);

    return result.rows[0].id;
  }

  async getSongsInPlaylist(playlistId) {
    try {
      const result = await this._cacheService.get(`playlistsong:${playlistId}`);
      return JSON.parse(result);
    } catch (error) {
      const sql = {
        text: `SELECT S.id, S.title, S.performer FROM songs S
        LEFT JOIN playlistsongs P ON P.song_id = S.id
        WHERE P.playlist_id = $1
        GROUP BY S.id`,
        values: [playlistId],
      };
      const result = await this._pool.query(sql);
      await this._cacheService.set(`playlistsong:${playlistId}`, JSON.stringify(result));
      return result.rows;
    }
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const sql = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(sql);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus dari playlist. Id tidak ditemukan');
    }

    await this._cacheService.delete(`playlistsong:${playlistId}`);
  }
}

module.exports = PlaylistSongs;
