export default function Topbar({ onToggleSidebar, sidebarExpanded, theme, onToggleTheme, staff, onLogout }) {
  return (
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

      <div className="input-group input-group--search hidden lg:flex">
        <span className="input-group__text">Cari</span>
        <input type="search" className="input" placeholder="Cari ticket atau pelapor..." aria-label="Cari" />
      </div>

      <div className="ms-auto">
        <div className="flex gap-1">
          <button
            type="button"
            className="button button--ghost button--neutral button--icon-only"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Mode terang" : "Mode gelap"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="m21.067 11.857l-.642-.388zm-8.924-8.924l-.388-.642zM21.25 12A9.25 9.25 0 0 1 12 21.25v1.5c5.937 0 10.75-4.813 10.75-10.75zM12 21.25A9.25 9.25 0 0 1 2.75 12h-1.5c0 5.937 4.813 10.75 10.75 10.75zM2.75 12A9.25 9.25 0 0 1 12 2.75v-1.5C6.063 1.25 1.25 6.063 1.25 12zm12.75 2.25A5.75 5.75 0 0 1 9.75 8.5h-1.5a7.25 7.25 0 0 0 7.25 7.25zm4.925-2.781A5.75 5.75 0 0 1 15.5 14.25v1.5a7.25 7.25 0 0 0 6.21-3.505zM9.75 8.5a5.75 5.75 0 0 1 2.781-4.925l-.776-1.284A7.25 7.25 0 0 0 8.25 8.5zM12 2.75a.38.38 0 0 1-.268-.118a.3.3 0 0 1-.082-.155c-.004-.031-.002-.121.105-.186l.776 1.284c.503-.304.665-.861.606-1.299c-.062-.455-.42-1.026-1.137-1.026zm9.71 9.495c-.066.107-.156.109-.187.105a.3.3 0 0 1-.155-.082a.38.38 0 0 1-.118-.268h1.5c0-.717-.571-1.075-1.026-1.137c-.438-.059-.995.103-1.299.606z"
              />
            </svg>
          </button>
          <div className="menu">
            <button type="button" className="button button--ghost button--neutral flex items-center gap-2" onClick={onLogout} aria-label="Keluar dari dashboard admin" title="Keluar">
              <span className="hidden sm:inline font-medium">{staff?.name || "Admin GovAssist"}</span>
              <span className="avatar avatar--sm avatar--circle" data-stisla-avatar>
                <span className="avatar__fallback">AG</span>
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m19 9l-7 6l-7-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
