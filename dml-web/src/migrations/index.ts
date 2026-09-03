import * as migration_20260817_044739_fondasi_users from './20260817_044739_fondasi_users';
import * as migration_20260817_045606_tambah_media from './20260817_045606_tambah_media';
import * as migration_20260817_050714_tambah_inquiries from './20260817_050714_tambah_inquiries';
import * as migration_20260823_163711_tambah_posts from './20260823_163711_tambah_posts';
import * as migration_20260830_095252_tambah_kategori_dan_halaman_artikel from './20260830_095252_tambah_kategori_dan_halaman_artikel';
import * as migration_20260830_095332_ubah_kategori_jadi_relasi from './20260830_095332_ubah_kategori_jadi_relasi';
import * as migration_20260831_011204_tambah_profil_perusahaan_dan_navigasi from './20260831_011204_tambah_profil_perusahaan_dan_navigasi';
import * as migration_20260831_015547_tambah_klien_sertifikasi_lini_bisnis_armada from './20260831_015547_tambah_klien_sertifikasi_lini_bisnis_armada';
import * as migration_20260831_023504_fleet_classes from './20260831_023504_fleet_classes';
import * as migration_20260831_024641_legal_documents from './20260831_024641_legal_documents';
import * as migration_20260903_034511_tambah_home_hero from './20260903_034511_tambah_home_hero';
import * as migration_20260903_052445_tambah_home_sections from './20260903_052445_tambah_home_sections';
import * as migration_20260903_054622_tambah_about_page from './20260903_054622_tambah_about_page';
import * as migration_20260903_055715_tambah_business_page from './20260903_055715_tambah_business_page';
import * as migration_20260903_060744_tambah_business_subpages from './20260903_060744_tambah_business_subpages';
import * as migration_20260903_061458_tambah_contact_career from './20260903_061458_tambah_contact_career';

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
    name: '20260817_050714_tambah_inquiries',
  },
  {
    up: migration_20260823_163711_tambah_posts.up,
    down: migration_20260823_163711_tambah_posts.down,
    name: '20260823_163711_tambah_posts',
  },
  {
    up: migration_20260830_095252_tambah_kategori_dan_halaman_artikel.up,
    down: migration_20260830_095252_tambah_kategori_dan_halaman_artikel.down,
    name: '20260830_095252_tambah_kategori_dan_halaman_artikel',
  },
  {
    up: migration_20260830_095332_ubah_kategori_jadi_relasi.up,
    down: migration_20260830_095332_ubah_kategori_jadi_relasi.down,
    name: '20260830_095332_ubah_kategori_jadi_relasi',
  },
  {
    up: migration_20260831_011204_tambah_profil_perusahaan_dan_navigasi.up,
    down: migration_20260831_011204_tambah_profil_perusahaan_dan_navigasi.down,
    name: '20260831_011204_tambah_profil_perusahaan_dan_navigasi',
  },
  {
    up: migration_20260831_015547_tambah_klien_sertifikasi_lini_bisnis_armada.up,
    down: migration_20260831_015547_tambah_klien_sertifikasi_lini_bisnis_armada.down,
    name: '20260831_015547_tambah_klien_sertifikasi_lini_bisnis_armada',
  },
  {
    up: migration_20260831_023504_fleet_classes.up,
    down: migration_20260831_023504_fleet_classes.down,
    name: '20260831_023504_fleet_classes',
  },
  {
    up: migration_20260831_024641_legal_documents.up,
    down: migration_20260831_024641_legal_documents.down,
    name: '20260831_024641_legal_documents',
  },
  {
    up: migration_20260903_034511_tambah_home_hero.up,
    down: migration_20260903_034511_tambah_home_hero.down,
    name: '20260903_034511_tambah_home_hero',
  },
  {
    up: migration_20260903_052445_tambah_home_sections.up,
    down: migration_20260903_052445_tambah_home_sections.down,
    name: '20260903_052445_tambah_home_sections',
  },
  {
    up: migration_20260903_054622_tambah_about_page.up,
    down: migration_20260903_054622_tambah_about_page.down,
    name: '20260903_054622_tambah_about_page',
  },
  {
    up: migration_20260903_055715_tambah_business_page.up,
    down: migration_20260903_055715_tambah_business_page.down,
    name: '20260903_055715_tambah_business_page',
  },
  {
    up: migration_20260903_060744_tambah_business_subpages.up,
    down: migration_20260903_060744_tambah_business_subpages.down,
    name: '20260903_060744_tambah_business_subpages',
  },
  {
    up: migration_20260903_061458_tambah_contact_career.up,
    down: migration_20260903_061458_tambah_contact_career.down,
    name: '20260903_061458_tambah_contact_career'
  },
];
