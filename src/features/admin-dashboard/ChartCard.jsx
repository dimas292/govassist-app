import Chart from "react-apexcharts";

export default function ChartCard({ title, children, options, series, type = "area", height = "100%", scroll = false }) {
  const chart = (
    <div className="chart">
      <Chart options={options} series={series} type={type} height={height} />
    </div>
  );

  return (
    <article className="card h-full">
      <header className="card__header">
        <span className="card__title">{title}</span>
        {children}
      </header>
      <div className="card__body">
        {scroll ? <div className="chart-scroll">{chart}</div> : chart}
      </div>
    </article>
  );
}

