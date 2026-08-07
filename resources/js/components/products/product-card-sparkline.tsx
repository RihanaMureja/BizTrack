type Point = {
    date: string;
    units: number;
};

export function ProductCardSparkline({ data }: { data: Point[] }) {
    const width = 160;
    const height = 42;
    const max = Math.max(...data.map((point) => point.units), 1);
    const step = data.length > 1 ? width / (data.length - 1) : width;
    const points = data
        .map((point, index) => {
            const x = index * step;
            const y = height - (point.units / max) * (height - 6) - 3;

            return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-11 w-full overflow-visible" role="img" aria-label="30-day units sold trend">
            <polyline
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                points={points}
                className="text-primary"
            />
            <line x1="0" y1={height - 2} x2={width} y2={height - 2} className="stroke-muted" strokeWidth="1" />
        </svg>
    );
}
