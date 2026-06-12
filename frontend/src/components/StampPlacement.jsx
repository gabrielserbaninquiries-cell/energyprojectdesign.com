/**
 * StampPlacement — UI drag-drop pe foaie A4 simulată.
 *
 * Props:
 *   stampUrl: string  — preview URL al imaginii ștampilei
 *   stampSizeCm: number  — diametrul ștampilei în centimetri (default 4cm)
 *   initialX: number, initialY: number — coordonate inițiale în cm (default centru-jos)
 *   onChange: ({x_cm, y_cm}) => void
 *
 * A4 = 21cm × 29.7cm. Scalate la 1 cm = 18 px → 378px × 535px.
 */
import { useEffect, useRef, useState } from 'react';
import { Move, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const CM_TO_PX = 18;
const A4_WIDTH_CM = 21;
const A4_HEIGHT_CM = 29.7;

export default function StampPlacement({
  stampUrl,
  stampSizeCm = 4,
  initialX = (A4_WIDTH_CM - 4) / 2,
  initialY = A4_HEIGHT_CM - 6,
  onChange,
}) {
  const [x, setX] = useState(initialX);
  const [y, setY] = useState(initialY);
  const [size, setSize] = useState(stampSizeCm);
  const [dragging, setDragging] = useState(false);
  const sheetRef = useRef(null);
  const offsetRef = useRef({ ox: 0, oy: 0 });

  useEffect(() => { onChange?.({ x_cm: x, y_cm: y, size_cm: size }); }, [x, y, size, onChange]);

  const onMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    const rect = sheetRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    offsetRef.current = { ox: px - x * CM_TO_PX, oy: py - y * CM_TO_PX };
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    const rect = sheetRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left - offsetRef.current.ox;
    const py = e.clientY - rect.top - offsetRef.current.oy;
    const nx = Math.max(0, Math.min(A4_WIDTH_CM - size, px / CM_TO_PX));
    const ny = Math.max(0, Math.min(A4_HEIGHT_CM - size, py / CM_TO_PX));
    setX(nx);
    setY(ny);
  };
  const onMouseUp = () => setDragging(false);

  const reset = () => {
    setX((A4_WIDTH_CM - size) / 2);
    setY(A4_HEIGHT_CM - size - 2);
  };

  return (
    <div className="space-y-3" data-testid="stamp-placement">
      <div className="flex items-center gap-2 text-xs">
        <Move className="w-3 h-3 text-zinc-500" />
        <span className="text-zinc-700">Trageți ștampila pe foaie. Mărime:</span>
        <button onClick={() => setSize((s) => Math.max(2, +(s - 0.5).toFixed(1)))} className="border border-zinc-300 px-1.5 py-0.5 hover:bg-zinc-50" data-testid="stamp-zoom-out">
          <ZoomOut className="w-3 h-3" />
        </button>
        <span className="font-mono text-zinc-900 tabular-nums w-12 text-center">{size} cm</span>
        <button onClick={() => setSize((s) => Math.min(10, +(s + 0.5).toFixed(1)))} className="border border-zinc-300 px-1.5 py-0.5 hover:bg-zinc-50" data-testid="stamp-zoom-in">
          <ZoomIn className="w-3 h-3" />
        </button>
        <button onClick={reset} className="border border-zinc-300 px-1.5 py-0.5 hover:bg-zinc-50 ml-auto flex items-center gap-1" data-testid="stamp-reset">
          <RotateCcw className="w-3 h-3" /> reset
        </button>
      </div>

      <div
        ref={sheetRef}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className="relative bg-white border-2 border-zinc-300 shadow-md mx-auto select-none"
        style={{ width: A4_WIDTH_CM * CM_TO_PX, height: A4_HEIGHT_CM * CM_TO_PX, cursor: dragging ? 'grabbing' : 'default' }}
        data-testid="stamp-placement-sheet"
      >
        {/* Rulers */}
        <div className="absolute top-0 left-0 w-full h-3 border-b border-dashed border-zinc-200 text-[7px] text-zinc-400 flex">
          {[...Array(A4_WIDTH_CM)].map((_, i) => (
            <div key={i} className="border-r border-zinc-200" style={{ width: CM_TO_PX }}>
              {i % 5 === 0 && <span className="ml-0.5">{i}</span>}
            </div>
          ))}
        </div>
        <div className="absolute top-0 left-0 h-full w-3 border-r border-dashed border-zinc-200 text-[7px] text-zinc-400 flex flex-col">
          {[...Array(Math.floor(A4_HEIGHT_CM))].map((_, i) => (
            <div key={i} className="border-b border-zinc-200" style={{ height: CM_TO_PX }}>
              {i % 5 === 0 && <span className="ml-0.5">{i}</span>}
            </div>
          ))}
        </div>

        {/* Doc placeholder content */}
        <div className="absolute top-12 left-12 right-12 space-y-1 text-zinc-200 select-none pointer-events-none">
          <div className="h-2 bg-zinc-100 w-1/2" />
          <div className="h-2 bg-zinc-100 w-3/4" />
          <div className="h-2 bg-zinc-100 w-2/3" />
          <div className="h-2 bg-zinc-100 w-1/2" />
          <div className="h-2 bg-zinc-100 w-5/6" />
          <div className="h-2 bg-zinc-100 w-3/5" />
        </div>

        {/* Stamp */}
        <div
          onMouseDown={onMouseDown}
          className="absolute rounded-full border-2 border-blue-600 bg-blue-50/60 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing shadow-md"
          style={{
            width: size * CM_TO_PX,
            height: size * CM_TO_PX,
            left: x * CM_TO_PX,
            top: y * CM_TO_PX,
          }}
          data-testid="stamp-placement-marker"
        >
          {stampUrl ? (
            <img src={stampUrl} alt="ștampilă" className="w-full h-full object-contain pointer-events-none" />
          ) : (
            <div className="text-[9px] text-blue-700 font-semibold text-center leading-tight">
              ȘTAMPILĂ<br/>{size}×{size}cm
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="font-mono text-zinc-700">
          Poziție: <span className="font-bold tabular-nums text-zinc-950">X = {x.toFixed(2)} cm</span>, <span className="font-bold tabular-nums text-zinc-950">Y = {y.toFixed(2)} cm</span>
        </div>
        <div className="font-mono text-zinc-500">A4 = {A4_WIDTH_CM}×{A4_HEIGHT_CM} cm</div>
      </div>
    </div>
  );
}
