const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongs {
  constructor() {
    this._pool = new Pool();
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

    return result.rows[0].id;
  }

  async getSongsInPlaylist(playlistId) {
    const sql = {
      text: `SELECT S.id, S.title, S.performer FROM songs S
      LEFT JOIN playlistsongs P ON P.song_id = S.id
      WHERE P.playlist_id = $1
      GROUP BY S.id`,
      values: [playlistId],
    };

    const result = await this._pool.query(sql);
    return result.rows;
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
  }
}

module.exports = PlaylistSongs;
