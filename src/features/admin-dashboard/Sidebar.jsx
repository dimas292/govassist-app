const menu = [
  { id: "dashboard", label: "Dashboard", href: "#dashboard", icon: "dashboard" },
  { id: "tickets", label: "Ticket/Laporan", href: "#tickets", icon: "ticket" },
];

function Icon({ children }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  );
}

function MenuIcon({ name }) {
  const icons = {
    dashboard: (
      <Icon>
        <path
          fill="currentColor"
          d="M2 6.5c0-2.121 0-3.182.659-3.841S4.379 2 6.5 2s3.182 0 3.841.659S11 4.379 11 6.5s0 3.182-.659 3.841S8.621 11 6.5 11s-3.182 0-3.841-.659S2 8.621 2 6.5m11 11c0-2.121 0-3.182.659-3.841S15.379 13 17.5 13s3.182 0 3.841.659S22 15.379 22 17.5s0 3.182-.659 3.841S19.621 22 17.5 22s-3.182 0-3.841-.659S13 19.621 13 17.5"
          opacity=".5"
        />
        <path
          fill="currentColor"
          d="M2 17.5c0-2.121 0-3.182.659-3.841S4.379 13 6.5 13s3.182 0 3.841.659S11 15.379 11 17.5s0 3.182-.659 3.841S8.621 22 6.5 22s-3.182 0-3.841-.659S2 19.621 2 17.5m11-11c0-2.121 0-3.182.659-3.841S15.379 2 17.5 2s3.182 0 3.841.659S22 4.379 22 6.5s0 3.182-.659 3.841S19.621 11 17.5 11s-3.182 0-3.841-.659S13 8.621 13 6.5"
        />
      </Icon>
    ),
    ticket: (
      <Icon>
        <path
          fill="currentColor"
          d="M16.755 2h-9.51c-1.159 0-1.738 0-2.206.163a3.05 3.05 0 0 0-1.881 1.936C3 4.581 3 5.177 3 6.37v14.004c0 .858.985 1.314 1.608.744a.946.946 0 0 1 1.284 0l.483.442a1.657 1.657 0 0 0 2.25 0a1.657 1.657 0 0 1 2.25 0a1.657 1.657 0 0 0 2.25 0a1.657 1.657 0 0 1 2.25 0a1.657 1.657 0 0 0 2.25 0l.483-.442a.946.946 0 0 1 1.284 0c.623.57 1.608.114 1.608-.744V6.37c0-1.193 0-1.79-.158-2.27a3.05 3.05 0 0 0-1.881-1.937C18.493 2 17.914 2 16.755 2Z"
          opacity=".5"
        />
        <path
          fill="currentColor"
          d="M7 7.5a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 7 7.5m0 4a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 7 11.5m0 4a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5A.75.75 0 0 1 7 15.5"
        />
      </Icon>
    ),
    category: (
      <Icon>
        <path
          fill="currentColor"
          d="M2 6.5c0-2.121 0-3.182.659-3.841S4.379 2 6.5 2s3.182 0 3.841.659S11 4.379 11 6.5s0 3.182-.659 3.841S8.621 11 6.5 11s-3.182 0-3.841-.659S2 8.621 2 6.5"
        />
        <path
          fill="currentColor"
          d="M13 6.5c0-2.121 0-3.182.659-3.841S15.379 2 17.5 2s3.182 0 3.841.659S22 4.379 22 6.5s0 3.182-.659 3.841S19.621 11 17.5 11s-3.182 0-3.841-.659S13 8.621 13 6.5M2 17.5c0-2.121 0-3.182.659-3.841S4.379 13 6.5 13s3.182 0 3.841.659S11 15.379 11 17.5s0 3.182-.659 3.841S8.621 22 6.5 22s-3.182 0-3.841-.659S2 19.621 2 17.5m11 0c0-2.121 0-3.182.659-3.841S15.379 13 17.5 13s3.182 0 3.841.659S22 15.379 22 17.5s0 3.182-.659 3.841S19.621 22 17.5 22s-3.182 0-3.841-.659S13 19.621 13 17.5"
          opacity=".55"
        />
      </Icon>
    ),
  };

  return icons[name] || icons.dashboard;
}

export default function Sidebar({ collapsed, currentView, onNavigate, ticketCount }) {
  return (
    <aside className="sidebar sidebar--lg sidebar--app" data-stisla-sidebar data-collapsed={collapsed || undefined}>
      <header className="sidebar__header">
        <a className="sidebar__brand" href="#dashboard" onClick={() => onNavigate("dashboard")}>
          <Icon>
            <path
              fill="currentColor"
              d="M12 1.5l3.4 7.1 7.1 3.4-7.1 3.4-3.4 7.1-3.4-7.1L1.5 12l7.1-3.4z"
              opacity=".45"
            />
            <path fill="currentColor" d="M12 1.5l3.4 7.1L12 12 8.6 8.6z" />
          </Icon>
          <span>GovAssist</span>
        </a>
      </header>

      <div className="sidebar__search">
        <div className="input-group input-group--search">
          <span className="input-group__text">Cari</span>
          <input className="input" type="search" placeholder="Cari ticket atau pelapor..." aria-label="Cari" />
        </div>
      </div>

      <div className="sidebar__content">
        <nav className="sidebar__menu">
          <div className="sidebar__group">
            <span className="sidebar__group-title">Admin</span>
            <ul className="sidebar__list">
              {menu.map((item) => (
                <li className="sidebar__item" key={item.label}>
                  <a className="sidebar__button" href={item.href} onClick={() => onNavigate(item.id)} aria-current={currentView === item.id ? "page" : undefined}>
                    <MenuIcon name={item.icon} />
                    <span>{item.label}</span>
                  </a>
                  {item.label === "Ticket/Laporan" && (
                    <span className="sidebar__item-action"><span className="badge badge--primary">{ticketCount}</span></span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <footer className="sidebar__footer">
        <div className="copyright">
          <hr className="separator my-3" style={{ "--separator-color": "var(--sidebar-submenu-border-color)" }} />
          <p className="text-xs text-muted-foreground">GovAssist Admin</p>
        </div>
      </footer>
    </aside>
  );
}
