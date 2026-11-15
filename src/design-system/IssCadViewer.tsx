interface IssCadViewerProps {
  className?: string;
  src?: string;
}

export function IssCadViewer({ className, src = "/iss-cad.glb" }: IssCadViewerProps) {
  return (
    <div className={className}>
      <div className="relative w-full h-64 rounded-xl overflow-hidden border border-ig-line bg-black/40">
        <model-viewer
          src={src}
          alt="ISS CAD model"
          auto-rotate
          camera-controls
          camera-orbit="45deg 75deg 2m"
          width="100%"
          height="100%"
          shadow-intensity="1"
        >
          <div
            slot="poster"
            className="absolute inset-0 flex items-center justify-center bg-black/60 text-ig-muted text-sm"
          >
            ISS CAD model — drop public/iss-cad.glb to view
          </div>
        </model-viewer>
      </div>
    </div>
  );
}
