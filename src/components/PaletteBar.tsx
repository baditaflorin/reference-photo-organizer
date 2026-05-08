import { readableTextColor } from '../features/library/color';
import type { ColorSwatch } from '../features/library/types';

interface PaletteBarProps {
  palette: ColorSwatch[];
  compact?: boolean;
}

export function PaletteBar({ palette, compact = false }: PaletteBarProps) {
  return (
    <div className={`palette-bar ${compact ? 'h-7' : 'h-9'}`} aria-label="Color palette">
      {palette.map((swatch) => (
        <span
          key={`${swatch.hex}-${swatch.role}`}
          className="grid min-w-0 flex-1 place-items-center text-[10px] font-bold uppercase"
          style={{ backgroundColor: swatch.hex, color: readableTextColor(swatch.hex) }}
          title={`${swatch.role} ${swatch.hex}`}
        >
          {compact ? '' : swatch.hex.replace('#', '')}
        </span>
      ))}
    </div>
  );
}
