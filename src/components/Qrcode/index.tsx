import React, { useMemo } from "react";
import qrcode from "qrcode-generator";

type Props = {
  content: string;
  logo?: string;
  width?: number;
  height?: number;
};

function diamond(cx: number, cy: number, r: number) {
  return `M ${cx} ${cy - r}
          L ${cx + r} ${cy}
          L ${cx} ${cy + r}
          L ${cx - r} ${cy}
          Z`;
}

function Finder({
  x,
  y,
  size,
  color,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
}) {
  const radius = size * 0.25;

  return (
    <g>
      <rect x={x} y={y} width={size} height={size} rx={radius} fill={color} />

      <rect
        x={x + size * 0.18}
        y={y + size * 0.18}
        width={size * 0.64}
        height={size * 0.64}
        rx={radius * 0.7}
        fill="white"
      />

      <rect
        x={x + size * 0.33}
        y={y + size * 0.33}
        width={size * 0.34}
        height={size * 0.34}
        rx={radius * 0.5}
        fill={color}
      />
    </g>
  );
}

function isFinder(row: number, col: number, count: number) {
  return (
    (row < 7 && col < 7) ||
    (row < 7 && col >= count - 7) ||
    (row >= count - 7 && col < 7)
  );
}

export default function CustomQr({
  content,
  logo,
  width = 320,
  height = 320,
}: Props) {
  const qr = useMemo(() => {
    const q = qrcode(0, "H");
    q.addData(content);
    q.make();
    return q;
  }, [content]);

  const count = qr.getModuleCount();
  const size = Math.min(width, height);
  const cell = size / count;

  const logoSize = size * 0.22;
  const logoCells = Math.ceil(logoSize / cell);

  const centerStart = Math.floor(count / 2 - logoCells / 2);
  const centerEnd = centerStart + logoCells;

  const modules = [];

  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!qr.isDark(row, col)) continue;

      if (isFinder(row, col, count)) continue;

      if (
        row >= centerStart &&
        row <= centerEnd &&
        col >= centerStart &&
        col <= centerEnd
      ) {
        continue;
      }

      const cx = col * cell + cell / 2;
      const cy = row * cell + cell / 2;

      modules.push(
        <path
          key={`${row}-${col}`}
          d={diamond(cx, cy, cell * 0.45)}
          fill="#000"
        />,
      );
    }
  }

  const finderSize = cell * 7;

  const logoBgSize = 65;
  const logoSizeCenter = 46;

  const centerX = size / 2;
  const centerY = size / 2;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" />

      {modules}

      <Finder x={0} y={0} size={finderSize} color="#000" />

      <Finder x={size - finderSize} y={0} size={finderSize} color="#000" />

      <Finder x={0} y={size - finderSize} size={finderSize} color="#000" />

      {logo && (
        <>
          <circle cx={centerX} cy={centerY} r={logoBgSize / 2} fill="white" />

          <image
            href={logo}
            x={centerX - logoSizeCenter / 2}
            y={centerY - logoSizeCenter / 2}
            width={logoSizeCenter}
            height={logoSizeCenter}
            preserveAspectRatio="xMidYMid meet"
          />
        </>
      )}
    </svg>
  );
}
