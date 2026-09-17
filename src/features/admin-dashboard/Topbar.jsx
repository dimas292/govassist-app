import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/base/avatar/avatar";
import { updateAdminProfile } from "../../services/api";

const ADMIN_AVATAR_URL = "https://baa.unas.ac.id/wp-content/uploads/2013/07/logo-unas.png";

export default function Topbar({ onToggleSidebar, sidebarExpanded, staff, onStaffUpdated, onLogout }) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const accountMenuRef = useRef(null);

  useEffect(() => {
    if (!accountMenuOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) setAccountMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setAccountMenuOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountMenuOpen]);

  useEffect(() => {
    if (!settingsOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !profileSaving) closeSettings();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [settingsOpen, profileSaving]);

  const handleLogout = () => {
    setAccountMenuOpen(false);
    onLogout();
  };

  const openSettings = () => {
    setAccountMenuOpen(false);
    setProfileName(staff?.name || "");
    setOrganizationName(staff?.organization?.name || "");
    setProfileError("");
    setSettingsOpen(true);
  };

  const closeSettings = () => {
    if (profileSaving) return;
    setSettingsOpen(false);
    setProfileError("");
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!profileName.trim() || !organizationName.trim()) return;
    setProfileSaving(true);
    setProfileError("");
    try {
      const updatedStaff = await updateAdminProfile(profileName, organizationName);
      onStaffUpdated(updatedStaff);
      setSettingsOpen(false);
    } catch (error) {
      setProfileError(error.message || "Profil admin gagal diperbarui.");
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <>
    <header className="navbar">
      <button
        type="button"
        className="button button--ghost button--neutral button--icon-only button--flush-start"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        aria-expanded={sidebarExpanded}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M20 7H4m16 5H4m16 5H4" />
        </svg>
      </button>

      <a
        href="/"
        className="button button--ghost button--neutral button--icon-only"
        aria-label="Kembali ke halaman utama GovAssist"
        title="Beranda"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m3 10.8l9-7.3l9 7.3V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
        </svg>
      </a>

      <div className="input-group input-group--search hidden lg:flex">
        <span className="input-group__text">Cari</span>
        <input type="search" className="input" placeholder="Cari ticket atau pelapor..." aria-label="Cari" />
      </div>

      <div className="ms-auto">
        <div className="flex gap-1">
          <div className="menu" ref={accountMenuRef}>
            <button
              type="button"
              className="button button--wrap button--ghost button--neutral flex items-center gap-2"
              onClick={() => setAccountMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={accountMenuOpen}
              aria-label="Buka menu akun admin"
            >
              <span className="hidden sm:inline font-medium">{staff?.name || "Admin GovAssist"}</span>
              <Avatar verified size="md" alt={staff?.name || "Admin GovAssist"} src={ADMIN_AVATAR_URL} />
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m19 9l-7 6l-7-6" />
              </svg>
            </button>
            <div
              className="menu__popup"
              data-state={accountMenuOpen ? "open" : "closed"}
              role="menu"
              style={{ position: "absolute", top: "calc(100% + 0.25rem)", right: 0, left: "auto" }}
            >
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar verified size="md" alt={staff?.name || "Admin GovAssist"} src={ADMIN_AVATAR_URL} />
                <div>
                  <div className="font-medium">{staff?.name || "Admin GovAssist"}</div>
                  <div className="text-xs text-muted-foreground">{staff?.organization?.name || "Organisasi belum diatur"}</div>
                </div>
              </div>
              <hr className="menu__separator" />
              <button type="button" className="menu__item" role="menuitem" onClick={openSettings}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15.5a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7Zm7.4-3.5a7.6 7.6 0 0 0-.1-1.2l2-1.6l-2-3.4l-2.4 1a8 8 0 0 0-2-1.2L14.5 3h-4l-.4 2.6a8 8 0 0 0-2 1.2l-2.4-1l-2 3.4l2 1.6a7.6 7.6 0 0 0 0 2.4l-2 1.6l2 3.4l2.4-1a8 8 0 0 0 2 1.2l.4 2.6h4l.4-2.6a8 8 0 0 0 2-1.2l2.4 1l2-3.4l-2-1.6c.1-.4.1-.8.1-1.2Z" />
                </svg>
                <span>Pengaturan Profil</span>
              </button>
              <hr className="menu__separator" />
              <button type="button" className="menu__item menu__item--danger" role="menuitem" onClick={handleLogout}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-3m-4-4h11m0 0l-3-3m3 3l-3 3" />
                </svg>
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    {settingsOpen && (
      <div className="dialog dialog--sm" data-state="open" role="dialog" aria-modal="true" aria-labelledby="profile-dialog-title">
        <div className="dialog__backdrop" onClick={closeSettings} aria-hidden="true" />
        <div className="dialog__panel dialog__panel--scrollable">
          <form className="dialog__content" onSubmit={saveProfile}>
            <header className="dialog__header">
              <div>
                <h2 className="dialog__title" id="profile-dialog-title">Pengaturan Profil</h2>
                <p className="text-sm text-muted-foreground">Perbarui identitas petugas admin.</p>
              </div>
            </header>

            <div className="dialog__body flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <Avatar verified size="2xl" alt={staff?.name || "Admin GovAssist"} src={ADMIN_AVATAR_URL} />
                <div>
                  <div className="font-medium">Foto Profil</div>
                  <div className="text-sm text-muted-foreground">Penggantian avatar belum tersedia.</div>
                </div>
              </div>

              {profileError && <div className="alert alert--danger" role="alert">{profileError}</div>}

              <label className="flex flex-col gap-2">
                <span className="font-medium">Nama</span>
                <input className="input" value={profileName} onChange={(event) => setProfileName(event.target.value)} maxLength="100" required disabled={profileSaving} />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-medium">Organisasi</span>
                <input className="input" value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} maxLength="150" required disabled={profileSaving} />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-medium">Peran</span>
                <input className="input" value={staff?.role || ""} readOnly disabled />
              </label>
            </div>

            <footer className="dialog__footer">
              <button type="button" className="button button--neutral" onClick={closeSettings} disabled={profileSaving}>Batal</button>
              <button type="submit" className="button button--primary" disabled={profileSaving || profileName.trim().length < 2 || organizationName.trim().length < 2}>
                {profileSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </footer>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
