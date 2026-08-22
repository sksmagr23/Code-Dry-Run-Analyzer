import React, { useState } from "react";
import { Image as ImageIcon, Maximize2, Minimize2, Sparkles, Download } from "lucide-react";

interface ImageViewerCardProps {
  imageUrl?: string;
  title?: string;
  description?: string;
  promptSummary?: string;
  onViewFull?: () => void;
}

export const ImageViewerCard: React.FC<ImageViewerCardProps> = ({
  imageUrl,
  title = "On-Demand Educational Dry Run",
  description = "Visual representation of execution steps, variable state shifts, and pointer transitions generated on-demand by AI Agent.",
  promptSummary = "Array state visualization: nums = [2, 7, 11, 15], target = 9 with Hash Map lookups",
  onViewFull
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  // Placeholder svg generator for educational diagram when imageUrl is absent/mock
  const mockImagePlaceholder = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%23121214"/><text x="400" y="40" fill="%2310b981" font-family="monospace" font-size="18" text-anchor="middle" font-weight="bold">AI EDUCATIONAL DRY RUN DIAGRAM</text><rect x="50" y="80" width="700" height="80" fill="%2318181b" stroke="%2327272a" stroke-width="2"/><text x="70" y="110" fill="%239ca3af" font-family="monospace" font-size="14">nums = [2, 7, 11, 15]</text><rect x="70" y="125" width="100" height="25" fill="%2310b981" fill-opacity="0.2" stroke="%2310b981"/><text x="120" y="142" fill="%2334d399" font-family="monospace" font-size="12" text-anchor="middle">i = 0 (2)</text><rect x="180" y="125" width="100" height="25" fill="%236366f1" fill-opacity="0.2" stroke="%236366f1"/><text x="230" y="142" fill="%23818cf8" font-family="monospace" font-size="12" text-anchor="middle">complement 7</text><rect x="50" y="190" width="700" height="220" fill="%2318181b" stroke="%2327272a" stroke-width="2"/><text x="70" y="220" fill="%23f59e0b" font-family="monospace" font-size="14" font-weight="bold">Hash Map Lookup Table:</text><text x="70" y="250" fill="%23e5e7eb" font-family="monospace" font-size="13">Step 1: Check complement (9 - 2 = 7) in Map -&gt; Not Found</text><text x="70" y="275" fill="%23e5e7eb" font-family="monospace" font-size="13">Step 1: Store Map[2] = 0</text><text x="70" y="310" fill="%2334d399" font-family="monospace" font-size="13" font-weight="bold">Step 2: Check complement (9 - 7 = 2) in Map -&gt; FOUND at index 0!</text><text x="70" y="340" fill="%2310b981" font-family="monospace" font-size="14" font-weight="bold">RETURN Indices: [0, 1] (Solution Verified)</text></svg>`;

  const activeSrc = imageUrl || mockImagePlaceholder;

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-none overflow-hidden flex flex-col mb-6">
      <div className="h-10 bg-[#131316] border-b border-[#27272a] flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
            {title}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {onViewFull ? (
            <button
              onClick={onViewFull}
              className="flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 bg-[#27272a] hover:bg-[#3f3f46] text-emerald-300 border border-[#3f3f46] transition cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              <span>View Full</span>
            </button>
          ) : (
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-1 text-gray-400 hover:text-white hover:bg-[#27272a] transition"
              title="Toggle Expand Modal"
            >
              {isZoomed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-xs text-gray-400 leading-relaxed">
          {description}
        </p>

        <div className="relative group bg-[#121214] border border-[#27272a] p-3 overflow-hidden flex items-center justify-center min-h-64">
          <img
            src={activeSrc}
            alt="Educational Dry Run Visualization"
            className="w-full h-auto max-h-96 object-contain rounded-none border border-[#27272a]"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-3">
            <button
              onClick={() => setIsZoomed(true)}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-mono flex items-center space-x-1.5 hover:bg-indigo-500 transition"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Expand Diagram</span>
            </button>
          </div>
        </div>

        {promptSummary && (
          <div className="text-[11px] font-mono text-gray-400 bg-[#121214] p-2 border border-[#27272a] flex items-center space-x-2">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{promptSummary}</span>
          </div>
        )}
      </div>

      {/* Fullscreen Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#27272a]">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white font-mono">{title}</h3>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href={activeSrc}
                download="dry_run_diagram.png"
                className="px-3 py-1.5 bg-[#27272a] text-gray-300 hover:text-white text-xs font-mono flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </a>
              <button
                onClick={() => setIsZoomed(false)}
                className="px-3 py-1.5 bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-mono hover:bg-rose-600/30"
              >
                Close
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <img
              src={activeSrc}
              alt="Expanded Dry Run Diagram"
              className="max-w-full max-h-full object-contain border border-[#27272a]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
