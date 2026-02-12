export default function BrandHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-6 py-4 flex items-center justify-center">
        <img
          src="/assets/generated/airshare-logo.dim_512x512.png"
          alt="AirShare"
          className="h-10 w-10 shrink-0 object-contain"
        />
        <h1 className="ml-3 text-xl font-bold">AirShare</h1>
      </div>
    </header>
  );
}
