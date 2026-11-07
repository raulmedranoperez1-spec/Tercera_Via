interface StyleAuditResultProps {
  result: string;
}

export default function StyleAuditResult({ result }: StyleAuditResultProps) {
  return (
    <div className="rounded-xl border border-earth-700/25 bg-white p-5 shadow-sm">
      <p className="mb-3 font-serif text-xl font-semibold text-black">Listado de correcciones del Libro de Estilo</p>
      <div className="whitespace-pre-line text-sm leading-relaxed text-black/80">{result}</div>
    </div>
  );
}
