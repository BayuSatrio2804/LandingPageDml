import * as migration_20260817_044739_fondasi_users from './20260817_044739_fondasi_users';

export const migrations = [
  {
    up: migration_20260817_044739_fondasi_users.up,
    down: migration_20260817_044739_fondasi_users.down,
    name: '20260817_044739_fondasi_users'
  },
];
