export default function BrandLogo({ className = 'h-20 w-20' }: { className?: string }) {
  return (
    <span className={`block overflow-hidden rounded-full border-2 border-brand-sand bg-brand-paper shadow-inner ${className}`}>
      <img
        src="/WhatsApp_Image_2026-11-04_at_10.00.16b.jpeg"
        alt="La Tercera Vía"
        className="h-full w-full object-cover"
      />
    </span>
  );
}
