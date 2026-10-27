import type { AppErrorCode } from "@/lib/errors";

export const STRINGS = {
  appName: "Tulisin",
  tagline: "Asisten penulisan akademik",
  selection: {
    title: "Teks terpilih",
    read: "Baca seleksi",
    reading: "Membaca…",
    empty: "Blok teks di dokumen Word, lalu tekan “Baca seleksi”.",
    characters: (count: number) => `${count.toLocaleString("id-ID")} karakter`,
  },
  directives: {
    title: "Pilih aksi",
  },
  revision: {
    title: "Usulan revisi",
    streaming: "Sedang menulis revisi…",
    apply: "Terapkan",
    applying: "Menerapkan…",
    discard: "Buang",
    cancel: "Batal",
    addedWords: (count: number) => `+${count.toLocaleString("id-ID")} kata ditambah`,
    removedWords: (count: number) => `−${count.toLocaleString("id-ID")} kata dihapus`,
    formattingWarning:
      "Teks baru mengikuti font dan warna kata pertama. Format campuran (tebal, miring, catatan kaki) di dalam seleksi tidak dipertahankan.",
    noChanges: "Teks sudah baik. Tidak ada perubahan yang disarankan.",
  },
  status: {
    applied: "Revisi diterapkan ke dokumen. Tekan Ctrl+Z di Word untuk membatalkan.",
    mockMode: "Mode pratinjau: Word tidak terdeteksi, memakai dokumen contoh.",
    loading: "Menghubungkan ke Word…",
    unsupported: "Buka Tulisin dari dalam Microsoft Word untuk mulai menulis.",
  },
  errors: {
    OFFICE_UNAVAILABLE: "Tidak dapat terhubung ke dokumen Word.",
    EMPTY_SELECTION: "Belum ada teks yang dipilih.",
    SELECTION_TOO_LONG: "Seleksi terlalu panjang. Pilih maksimal 5.000 karakter.",
    SELECTION_CHANGED:
      "Seleksi di dokumen berubah. Baca ulang seleksi sebelum menerapkan revisi.",
    INVALID_REQUEST: "Permintaan tidak valid.",
    AI_FAILED: "Layanan AI sedang bermasalah. Coba lagi sebentar lagi.",
    NETWORK_FAILED: "Koneksi terputus. Periksa jaringan Anda.",
    UNKNOWN: "Terjadi kesalahan yang tidak terduga.",
  } satisfies Record<AppErrorCode, string>,
} as const;
