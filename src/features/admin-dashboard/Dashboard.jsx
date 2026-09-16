import ChartCard from "./ChartCard.jsx";
import StatCard from "./StatCard.jsx";
import TicketTable from "./TicketTable.jsx";

function color(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function baseChart(theme) {
  const muted = color("--color-muted-foreground");
  const border = color("--color-border");
  return {
    chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: "inherit", background: "transparent" },
    dataLabels: { enabled: false },
    grid: { borderColor: border, strokeDashArray: 4 },
    theme: { mode: theme === "dark" ? "dark" : "light" },
    xaxis: {
      axisBorder: { color: border },
      axisTicks: { color: border },
      labels: { style: { colors: muted } },
    },
    yaxis: { labels: { style: { colors: muted } } },
  };
}

function trendOptions(theme, trend) {
  const base = baseChart(theme);
  const primary = color("--color-primary");
  return {
    ...base,
    chart: { ...base.chart, type: "area", height: "100%" },
    colors: [primary],
    series: [{ name: "Ticket masuk", data: trend.values }],
    xaxis: {
      ...base.xaxis,
      categories: trend.labels,
    },
    yaxis: {
      ...base.yaxis,
      min: 0,
      max: 60,
      tickAmount: 6,
      labels: {
        ...base.yaxis.labels,
        formatter: (value) => value.toFixed(0),
      },
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        gradientToColors: [primary],
        inverseColors: false,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    legend: { show: false },
    tooltip: { y: { formatter: (value) => `${value.toLocaleString()} ticket` } },
  };
}

function categoryOptions(theme, categorySummary) {
  return {
  ...baseChart(theme),
  labels: categorySummary.map((item) => item.label),
  colors: [color("--color-primary"), color("--color-info"), color("--color-success")],
  legend: { position: "bottom" },
  plotOptions: { pie: { donut: { size: "68%" } } },
  };
}

function statusOptions(theme, statusSummary) {
  return {
  ...baseChart(theme),
  colors: [color("--color-primary")],
  plotOptions: { bar: { horizontal: true, borderRadius: 8, barHeight: "55%" } },
  xaxis: { categories: statusSummary.map((item) => item.label) },
  };
}

export default function Dashboard({ theme, data, onViewTickets }) {
  const { activities, categorySummary, stats, statusSummary, tickets, trend } = data;
  return (
    <div className="page content">
      <div className="content__container">
        <header className="page__header">
          <div className="page__headline">
            <h1 className="page__title">Dashboard Admin GovAssist</h1>
            <p className="page__description">
              Pantau ticket pengaduan program pemerintah dari kanal suara ke teks.
            </p>
          </div>
          <div className="page__action">
            <button type="button" className="button button--neutral">Ekspor</button>
            <a href="#tickets" className="button button--primary" onClick={onViewTickets}>Lihat Semua Ticket</a>
          </div>
        </header>

        <div className="page__body">
          <section className="page__section">
            <div className="grid grid-cols-12 gap-4">
              {stats.map((item) => (
                <div className="col-span-6 lg:col-span-3" key={item.label}>
                  <StatCard {...item} />
                </div>
              ))}
            </div>
          </section>

          <section className="page__section">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 xl:col-span-8">
                <ChartCard
                  title="Tren Ticket Masuk"
                  options={trendOptions(theme, trend)}
                  series={[{ name: "Ticket masuk", data: trend.values }]}
                  height="100%"
                  scroll
                >
                  <span className="badge badge--soft badge--success ms-auto">+18% minggu ini</span>
                </ChartCard>
              </div>
              <div className="col-span-12 xl:col-span-4">
                <ChartCard
                  title="Ticket per Kategori"
                  options={categoryOptions(theme, categorySummary)}
                  series={categorySummary.map((item) => item.value)}
                  type="donut"
                  height="100%"
                />
              </div>
            </div>
          </section>

          <section className="page__section">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-6">
                <ChartCard
                  title="Status Ticket"
                  options={statusOptions(theme, statusSummary)}
                  series={[{ name: "Ticket", data: statusSummary.map((item) => item.value) }]}
                  type="bar"
                  height="100%"
                />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <article className="card h-full">
                  <div className="card__header"><span className="card__title">Aktivitas Terbaru</span></div>
                  <div className="card__body">
                    <ol className="timeline">
                      {activities.map((activity) => (
                        <li className="timeline__item" key={activity.id}>
                          <span className={`timeline__marker timeline__marker--${activity.tone}`} />
                          <div className="timeline__body">
                            <div className="timeline__title">{activity.text}</div>
                            <div className="timeline__time">{activity.time}</div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section className="page__section">
            <TicketTable tickets={tickets} />
          </section>
        </div>
      </div>
    </div>
  );
}
