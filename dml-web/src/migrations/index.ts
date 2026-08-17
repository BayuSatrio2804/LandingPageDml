import * as migration_20260817_044739_fondasi_users from './20260817_044739_fondasi_users';
import * as migration_20260817_045606_tambah_media from './20260817_045606_tambah_media';
import * as migration_20260817_050714_tambah_inquiries from './20260817_050714_tambah_inquiries';

export const migrations = [
  {
    up: migration_20260817_044739_fondasi_users.up,
    down: migration_20260817_044739_fondasi_users.down,
    name: '20260817_044739_fondasi_users',
  },
  {
    up: migration_20260817_045606_tambah_media.up,
    down: migration_20260817_045606_tambah_media.down,
    name: '20260817_045606_tambah_media',
  },
  {
    up: migration_20260817_050714_tambah_inquiries.up,
    down: migration_20260817_050714_tambah_inquiries.down,
    name: '20260817_050714_tambah_inquiries'
  },
];
