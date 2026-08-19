type Point = {
    date: string;
    units: number;
};

export function ProductCardSparkline({ data }: { data: Point[] }) {
    const width = 160;
    const height = 58;
    const max = Math.max(...data.map((point) => point.units), 1);
    const step = data.length > 1 ? width / (data.length - 1) : width;
    const chartPoints = data.length > 0 ? data : [{ date: 'empty', units: 0 }];
    const points = chartPoints
        .map((point, index) => {
            const x = index * step;
            const y = height - (point.units / max) * (height - 12) - 7;

            return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');
    const areaPoints = `0,${height} ${points} ${width},${height}`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-full overflow-visible" role="img" aria-label="30-day units sold trend">
            <defs>
                <linearGradient id="product-card-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} className="fill-primary" opacity="0.28" />
            {[0.25, 0.5, 0.75].map((ratio) => (
                <line
                    key={ratio}
                    x1="0"
                    x2={width}
                    y1={height * ratio}
                    y2={height * ratio}
                    className="stroke-border"
                    strokeWidth="0.8"
                    strokeDasharray="4 4"
                />
            ))}
            <polyline
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3.5"
                points={points}
                className="text-primary"
            />
            {chartPoints.some((point) => point.units > 0) && (
                <circle
                    cx={(chartPoints.length - 1) * step}
                    cy={height - ((chartPoints.at(-1)?.units ?? 0) / max) * (height - 12) - 7}
                    r="3"
                    className="fill-primary"
                />
            )}
        </svg>
    );
}
