'use client';

import * as React from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Info, 
  MapPin, 
  Navigation2, 
  ArrowLeft,
  Layers,
  Compass
} from 'lucide-react';
import { 
  campusLandmarks, 
  blockCFloor1, 
  blockCFloor2, 
  parseCampusQuery,
  RoomLayout,
  CampusLandmark
} from '@/lib/campusData';

interface CampusMapProps {
  highlightedBuilding?: string;
  highlightedRoom?: string;
}

export default function CampusMap({ highlightedBuilding, highlightedRoom }: CampusMapProps) {
  // Navigation View: 'global' | 'block-c'
  const [view, setView] = React.useState<'global' | 'block-c'>('global');
  const [activeFloor, setActiveFloor] = React.useState<number>(1);
  
  // Interactive zoom & pan states
  const [scale, setScale] = React.useState<number>(1);
  const [translate, setTranslate] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // UI state for details overlay
  const [selectedLandmark, setSelectedLandmark] = React.useState<CampusLandmark | null>(null);
  const [selectedRoom, setSelectedRoom] = React.useState<RoomLayout | null>(null);

  const mapContainerRef = React.useRef<HTMLDivElement>(null);

  // Automatically adjust view based on highlighted targets
  React.useEffect(() => {
    if (highlightedBuilding) {
      const cleanBuilding = highlightedBuilding.toLowerCase();
      if (cleanBuilding.includes('block c') || highlightedRoom) {
        setView('block-c');
        if (highlightedRoom) {
          const room1Match = blockCFloor1.find(r => r.name.toLowerCase() === highlightedRoom.toLowerCase());
          const room2Match = blockCFloor2.find(r => r.name.toLowerCase() === highlightedRoom.toLowerCase() || r.name.toLowerCase().includes(highlightedRoom.toLowerCase()));
          if (room2Match) {
            setActiveFloor(2);
            setSelectedRoom(room2Match);
          } else if (room1Match) {
            setActiveFloor(1);
            setSelectedRoom(room1Match);
          }
        } else {
          // Highlight entire Block C
          const bMatch = campusLandmarks.find(l => l.id === 'block-c');
          if (bMatch) setSelectedLandmark(bMatch);
        }
      } else {
        setView('global');
        const bMatch = campusLandmarks.find(l => l.name.toLowerCase() === highlightedBuilding.toLowerCase() || l.id === highlightedBuilding.toLowerCase());
        if (bMatch) {
          setSelectedLandmark(bMatch);
        }
      }
    }
  }, [highlightedBuilding, highlightedRoom]);

  // Pointer Event Handlers for Dragging & Panning (Unified touch & mouse support)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with left click or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setTranslate({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Zoom Math Utilities
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.6));
  };

  const handleReset = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setSelectedLandmark(null);
    setSelectedRoom(null);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    const direction = e.deltaY < 0 ? 1 : -1;
    setScale(prev => {
      const next = prev + direction * zoomFactor;
      return Math.min(Math.max(next, 0.6), 4);
    });
  };

  // Highlight matches check
  const isLandmarkHighlighted = (landmark: CampusLandmark) => {
    if (highlightedBuilding && !highlightedRoom) {
      return (
        landmark.name.toLowerCase() === highlightedBuilding.toLowerCase() ||
        landmark.id === highlightedBuilding.toLowerCase() ||
        (highlightedBuilding.toLowerCase() === 'block c' && landmark.id === 'block-c')
      );
    }
    return false;
  };

  const isRoomHighlighted = (room: RoomLayout) => {
    if (highlightedRoom) {
      return (
        room.name.toLowerCase() === highlightedRoom.toLowerCase() ||
        room.id === highlightedRoom.toLowerCase() ||
        room.name.toLowerCase().includes(highlightedRoom.toLowerCase())
      );
    }
    return false;
  };

  // Switch between Global Map and Floor plan
  const handleBackToGlobal = () => {
    setView('global');
    setSelectedRoom(null);
    const bMatch = campusLandmarks.find(l => l.id === 'block-c');
    if (bMatch) setSelectedLandmark(bMatch);
  };

  return (
    <div className="w-full border border-color-border bg-color-surface/30 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl relative select-none font-jakarta flex flex-col h-[480px]">
      
      {/* Self-contained visual keyframe animations for glow pulsing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-snu-glow {
          0% {
            stroke: #f2a900;
            stroke-width: 3px;
            fill: rgba(242, 169, 0, 0.35);
            filter: drop-shadow(0 0 4px rgba(242, 169, 0, 0.6));
          }
          50% {
            stroke: #ffca28;
            stroke-width: 4px;
            fill: rgba(242, 169, 0, 0.55);
            filter: drop-shadow(0 0 12px rgba(242, 169, 0, 0.9));
          }
          100% {
            stroke: #f2a900;
            stroke-width: 3px;
            fill: rgba(242, 169, 0, 0.35);
            filter: drop-shadow(0 0 4px rgba(242, 169, 0, 0.6));
          }
        }
        .animate-snu-glow {
          animation: pulse-snu-glow 2s infinite ease-in-out;
        }
        .map-interactive-shape {
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }
        .map-interactive-shape:hover {
          fill-opacity: 0.15;
          stroke: #f2a900;
          stroke-width: 1.5px;
        }
      `}} />

      {/* Map Header Panel */}
      <div className="border-b border-color-border px-5 py-3.5 bg-color-surface/40 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-color-text">
              {view === 'global' ? 'SNU Campus Blueprint' : 'Block C Indoor Navigator'}
            </h4>
            <p className="text-[9px] text-color-muted font-mono uppercase tracking-widest mt-0.5">
              {view === 'global' ? 'Interactive Vector Map' : `Floor ${activeFloor} Map • Smart Highlights`}
            </p>
          </div>
        </div>

        {/* View Toggle Controller */}
        <div className="flex items-center gap-1.5">
          {view === 'block-c' ? (
            <button
              onClick={handleBackToGlobal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-color-surface-hover/60 hover:bg-color-surface-hover border border-color-border text-color-text hover:text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Global Map</span>
            </button>
          ) : (
            <button
              onClick={() => { setView('block-c'); setSelectedRoom(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Explore Floorplans</span>
            </button>
          )}
        </div>
      </div>

      {/* SVG Vector Map Area */}
      <div 
        ref={mapContainerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="flex-1 w-full bg-[#fbfbfb] dark:bg-[#070707] relative overflow-hidden cursor-grab active:cursor-grabbing transition-colors"
      >
        {/* Dynamic Watermark Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.06)_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        {/* Zoomed/Panned SVG Canvas Group */}
        <div 
          className="w-full h-full transform-gpu origin-center select-none"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}
        >
          {view === 'global' ? (
            /* GLOBAL MAP SVG */
            <svg 
              viewBox="0 0 800 600" 
              className="w-full h-full max-h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Roads & Campus Arterial Highways */}
              <path d="M 50 200 L 750 200" stroke="rgba(128,128,128,0.12)" strokeWidth="16" fill="none" strokeLinecap="round" />
              <path d="M 50 490 L 750 490" stroke="rgba(128,128,128,0.12)" strokeWidth="16" fill="none" strokeLinecap="round" />
              <path d="M 150 100 L 150 550" stroke="rgba(128,128,128,0.12)" strokeWidth="12" fill="none" strokeLinecap="round" />
              <path d="M 650 100 L 650 550" stroke="rgba(128,128,128,0.12)" strokeWidth="12" fill="none" strokeLinecap="round" />
              <path d="M 400 100 L 400 550" stroke="rgba(128,128,128,0.07)" strokeWidth="8" fill="none" strokeDasharray="6,6" />
              
              {/* Natural Landscaping elements */}
              <rect x="50" y="50" width="700" height="500" fill="none" stroke="rgba(128,128,128,0.08)" strokeWidth="2" strokeDasharray="4,4" />

              {/* Loop and render all landmarks */}
              {campusLandmarks.map((landmark) => {
                const isSelected = selectedLandmark?.id === landmark.id;
                const isHighlighted = isLandmarkHighlighted(landmark);
                const isCBlock = landmark.id === 'block-c';

                // Shape styling variables synced with current light/dark theme classes
                let fill = 'rgba(120,120,120,0.07)';
                let stroke = 'rgba(120,120,120,0.25)';
                let strokeWidth = '1px';
                let className = 'map-interactive-shape';

                if (isHighlighted) {
                  className += ' animate-snu-glow';
                } else if (isSelected) {
                  fill = 'rgba(242, 169, 0, 0.25)';
                  stroke = '#f2a900';
                  strokeWidth = '2px';
                } else {
                  // Standard styling by category
                  if (landmark.category === 'academic') {
                    fill = 'rgba(59, 130, 246, 0.05)';
                    stroke = 'rgba(59, 130, 246, 0.3)';
                  } else if (landmark.category === 'dining') {
                    fill = 'rgba(239, 68, 68, 0.05)';
                    stroke = 'rgba(239, 68, 68, 0.3)';
                  } else if (landmark.category === 'hostel') {
                    fill = 'rgba(168, 85, 247, 0.05)';
                    stroke = 'rgba(168, 85, 247, 0.3)';
                  } else if (landmark.category === 'natural') {
                    fill = 'rgba(16, 185, 129, 0.1)';
                    stroke = 'rgba(16, 185, 129, 0.25)';
                  }
                }

                // Render dynamic SVG shape
                return (
                  <g key={landmark.id} onClick={(e) => {
                    e.stopPropagation();
                    if (isCBlock) {
                      setView('block-c');
                      setSelectedRoom(null);
                    } else {
                      setSelectedLandmark(landmark);
                      setSelectedRoom(null);
                    }
                  }}>
                    {landmark.svgShape === 'rect' && (() => {
                      const [x, y, w, h] = landmark.coords.split(',').map(Number);
                      return <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} />;
                    })()}

                    {landmark.svgShape === 'ellipse' && (() => {
                      const [cx, cy, rx, ry] = landmark.coords.split(',').map(Number);
                      return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} />;
                    })()}

                    {landmark.svgShape === 'polygon' && (
                      <polygon points={landmark.coords} fill={fill} stroke={stroke} strokeWidth={strokeWidth} className={className} />
                    )}

                    {/* Labels with dynamic text coloring synced with theme styles */}
                    <text 
                      x={landmark.labelX} 
                      y={landmark.labelY} 
                      textAnchor="middle" 
                      className={`text-[9px] font-extrabold font-jakarta tracking-tight pointer-events-none fill-neutral-700 dark:fill-neutral-300 ${
                        isHighlighted || isSelected ? 'fill-amber-500 dark:fill-amber-500 font-black' : ''
                      }`}
                    >
                      {landmark.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            /* BLOCK C INDOOR FLOORPLAN */
            <svg 
              viewBox="0 0 800 500" 
              className="w-full h-full max-h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer structural walls of Block C */}
              <rect x="50" y="80" width="700" height="340" rx="16" fill="none" stroke="rgba(128,128,128,0.18)" strokeWidth="3" />
              
              {/* Inner hallway / structural corridor lines */}
              <line x1="100" y1="220" x2="700" y2="220" stroke="rgba(128,128,128,0.14)" strokeWidth="12" />
              <line x1="230" y1="220" x2="230" y2="420" stroke="rgba(128,128,128,0.14)" strokeWidth="10" />
              <line x1="570" y1="220" x2="570" y2="420" stroke="rgba(128,128,128,0.14)" strokeWidth="10" />

              {/* Loop and render specific floor layouts */}
              {(activeFloor === 1 ? blockCFloor1 : blockCFloor2).map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                const isHighlighted = isRoomHighlighted(room);

                let fill = 'rgba(128, 128, 128, 0.04)';
                let stroke = 'rgba(128, 128, 128, 0.2)';
                let strokeWidth = '1px';
                let className = 'map-interactive-shape';

                if (isHighlighted) {
                  className += ' animate-snu-glow';
                } else if (isSelected) {
                  fill = 'rgba(242, 169, 0, 0.25)';
                  stroke = '#f2a900';
                  strokeWidth = '2px';
                } else {
                  if (room.type === 'classroom') {
                    fill = 'rgba(59, 130, 246, 0.04)';
                    stroke = 'rgba(59, 130, 246, 0.2)';
                  } else if (room.type === 'lab') {
                    fill = 'rgba(168, 85, 247, 0.04)';
                    stroke = 'rgba(168, 85, 247, 0.2)';
                  } else if (room.type === 'office') {
                    fill = 'rgba(249, 115, 22, 0.04)';
                    stroke = 'rgba(249, 115, 22, 0.2)';
                  } else if (room.type === 'lobby') {
                    fill = 'rgba(16, 185, 129, 0.04)';
                    stroke = 'rgba(16, 185, 129, 0.2)';
                  }
                }

                return (
                  <g key={room.id} onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRoom(room);
                    setSelectedLandmark(null);
                  }}>
                    <rect 
                      x={room.x} 
                      y={room.y} 
                      width={room.width} 
                      height={room.height} 
                      rx={8} 
                      fill={fill} 
                      stroke={stroke} 
                      strokeWidth={strokeWidth} 
                      className={className} 
                    />
                    
                    {/* Text Label */}
                    <text 
                      x={room.x + room.width / 2} 
                      y={room.y + room.height / 2 + 3} 
                      textAnchor="middle" 
                      className={`text-[9px] font-bold font-jakarta tracking-tight fill-neutral-700 dark:fill-neutral-300 pointer-events-none ${
                        isHighlighted || isSelected ? 'fill-amber-500 dark:fill-amber-500 font-black' : ''
                      }`}
                    >
                      {room.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Floating Zoom & Pan Control Overlay */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-1.5 z-10">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-xl bg-color-surface/85 backdrop-blur-md border border-color-border text-color-text hover:text-amber-500 flex items-center justify-center shadow-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-xl bg-color-surface/85 backdrop-blur-md border border-color-border text-color-text hover:text-amber-500 flex items-center justify-center shadow-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-xl bg-color-surface/85 backdrop-blur-md border border-color-border text-color-text hover:text-amber-500 flex items-center justify-center shadow-lg transition-colors"
            title="Reset Map View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floor Level Selector Overlay (Only visible in Block C Indoor floorplan) */}
        {view === 'block-c' && (
          <div className="absolute left-4 bottom-4 flex bg-color-surface/85 backdrop-blur-md border border-color-border p-1 rounded-2xl shadow-lg z-10">
            <button
              onClick={() => { setActiveFloor(1); setSelectedRoom(null); }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                activeFloor === 1 
                  ? 'bg-amber-500 text-black shadow-md' 
                  : 'text-color-muted hover:text-color-text'
              }`}
            >
              Floor 1
            </button>
            <button
              onClick={() => { setActiveFloor(2); setSelectedRoom(null); }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                activeFloor === 2 
                  ? 'bg-amber-500 text-black shadow-md' 
                  : 'text-color-muted hover:text-color-text'
              }`}
            >
              Floor 2
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Drawer Panel: Landmark details overlay */}
      {(selectedLandmark || selectedRoom) && (
        <div className="border-t border-color-border px-5 py-4 bg-color-surface/50 backdrop-blur-md z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mt-0.5 flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wide text-color-text">
                  {selectedRoom ? selectedRoom.name : selectedLandmark?.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-color-border text-color-muted font-mono text-[8px] font-bold tracking-wider uppercase">
                  {selectedRoom ? selectedRoom.type : selectedLandmark?.category}
                </span>
              </div>
              <p className="text-[11px] text-color-muted mt-1 leading-relaxed max-w-xl">
                {selectedRoom ? selectedRoom.description : selectedLandmark?.description}
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 flex gap-2">
            {/* If clicking Block C, give quick shortcut */}
            {selectedLandmark?.id === 'block-c' && (
              <button
                onClick={() => setView('block-c')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/15"
              >
                Go Inside Block C
              </button>
            )}
            <button
              onClick={() => { setSelectedLandmark(null); setSelectedRoom(null); }}
              className="px-4 py-2 border border-color-border hover:bg-color-surface-hover/80 text-color-text rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Floating Instructions Banner (Only visible when map triggers without interaction) */}
      {!selectedLandmark && !selectedRoom && (
        <div className="absolute left-4 top-16 bg-color-surface/85 backdrop-blur-md border border-color-border py-1.5 px-3 rounded-2xl shadow-md pointer-events-none flex items-center gap-2 z-10 transition-opacity">
          <Info className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[9px] font-bold tracking-wide text-color-text uppercase">
            Drag to pan • Pinch / Scroll to zoom
          </span>
        </div>
      )}
    </div>
  );
}
