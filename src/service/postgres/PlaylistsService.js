const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const sql = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(sql);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal dibuat');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const sql = {
      // text: 'SELECT * FROM playlists WHERE owner = $1',
      text: `SELECT P.id, P.name, U.username FROM playlists P
      LEFT JOIN users U ON U.id = P.owner
      WHERE P.owner = $1
      GROUP BY P.id, U.id`,
      values: [owner],
    };
    const result = await this._pool.query(sql);
    return result.rows;
    // console.log(result.rows);
  }

  async deletePlaylistById(id) {
    const sql = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(sql);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyOwner(id, owner) {
    const sql = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(sql);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak dapat mengakses resource ini');
    }
  }
}

module.exports = PlaylistsService;
