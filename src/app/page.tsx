export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 min-h-[60vh]">
      <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center shadow-lg">
        <span
          className="material-symbols-outlined text-white text-2xl"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
        >
          local_fire_department
        </span>
      </div>
      <h1 className="text-2xl font-black tracking-tighter text-on-surface uppercase">
        Corrales
      </h1>
      <p className="text-sm text-on-surface-variant">Pollería &amp; Fastfood</p>
    </div>
  );
}
