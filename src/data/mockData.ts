// ---- Types ----

export interface FramingArticle {
  id: string;
  date: string;
  title: string;
  conservative: {
    outlet: string;
    headline: string;
    body: string;
    highlightedWords: string[];
  };
  progressive: {
    outlet: string;
    headline: string;
    body: string;
    highlightedWords: string[];
  };
  terceraVia: {
    headline: string;
    body: string;
  };
  primarySource: {
    label: string;
    type: 'BOE' | 'BOJA' | 'INE' | 'Otro';
    url: string;
  };
}

export interface ImpactCard {
  id: string;
  category: 'Becas y Universidad' | 'Vivienda y Alquiler' | 'Empleo y Contratos' | 'Impuestos';
  title: string;
  date: string;
  queCambia: string;
  aQuienBeneficia: string;
  comoSolicitarlo: string;
}

// ---- Framing Comparison Data ----

export const framingArticles: FramingArticle[] = [
  {
    id: 'f1',
    date: '2026-10-19',
    title: 'Reforma de la Ley de Vivienda',
    conservative: {
      outlet: 'Marco Prensa Conservadora',
      headline: 'El Gobierno interviene el mercado de alquiler y congela los precios',
      body: 'El Ejecutivo ha impuesto una drástica intervención en el mercado de alquiler, congelando los precios en zonas tensionadas. Los propietarios se enfrentan a una agresiva limitación de sus derechos de propiedad, mientras los inquilinos reciben una promesa electoral de precios reducidos. Una medida populista que ahuyentará la inversión.',
      highlightedWords: ['drástica', 'agresiva', 'populista', 'ahuyentará'],
    },
    progressive: {
      outlet: 'Marco Prensa Progresista',
      headline: 'Por fin se protege a los inquilinos frente a la voracidad de los fondos buitre',
      body: 'El Gobierno ha dado un paso valiente y necesario para proteger a las familias frente a la insaciable voracidad de los fondos buitre. Por fin se limita la escandalosa subida de los alquileres en las zonas donde los precios se habían disparado de forma obscena. Una medida histórica de justicia social.',
      highlightedWords: ['valiente', 'voracidad', 'insaciable', 'escandalosa', 'obscena', 'histórica'],
    },
    terceraVia: {
      headline: 'Nueva regulación limita subidas de alquiler en zonas de mercado tensionado',
      body: 'La reforma aprobada establece un límite a las subidas anuales de alquiler en aquellas zonas que cumplan criterios objetivos de tensión del mercado (varios indicadores de precio sobre ingresos). La zona se desactiva automáticamente si los indicadores mejoran. Los propietarios mantienen el derecho a actualizar el precio dentro del límite. El Real Decreto-ley publicado en el BOE detalla los umbrales y el procedimiento de solicitud.',
    },
    primarySource: {
      label: 'Real Decreto-ley 5/2026 — BOE núm. 252',
      type: 'BOE',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2026-00000',
    },
  },
  {
    id: 'f2',
    date: '2026-10-17',
    title: 'Cambio en la edad legal de acceso a la Pensión de Jubilación',
    conservative: {
      outlet: 'Marco Prensa Conservadora',
      headline: 'Retrasar la jubilación es castigar a los que toda la vida han cotizado',
      body: 'El retraso de la edad de jubilación supone un duro castigo para quienes han trabajado toda la vida. Una medida injusta que penaliza el esfuerzo y la responsabilidad fiscal, mientras el gasto público sigue siendo disparatado. Un nuevo sacrificio impuesto a la clase trabajadora para tapar los agujeros del sistema.',
      highlightedWords: ['duro castigo', 'injusta', 'penaliza', 'disparatado', 'sacrificio'],
    },
    progressive: {
      outlet: 'Marco Prensa Progresista',
      headline: 'Se retrasa la jubilación sin proteger a los trabajadores más precarios',
      body: 'El Gobierno se limita a retrasar la edad de jubilación sin ofrecer alternativas reales a los trabajadores con carreras de cotización más precarias. Una medida tímida y desigual que deja desamparados a quienes más sufren. Faltan medidas valientes de protección social para compensar el endurecimiento del acceso.',
      highlightedWords: ['tímida', 'desigual', 'desamparados', 'valientes'],
    },
    terceraVia: {
      headline: 'Se eleva la edad legal de jubilación a 67 años con coeficientes correctores',
      body: 'La Ley de Seguridad Social establece el incremento gradual de la edad legal de jubilación a 67 años, ya previsto en la reforma de 2011. Existen coeficientes correctores para carreras de cotización largas (38,5 años) que permiten acceder a los 65. La pensión mínima mantiene su complemento a cargo del Estado. La modificación se publica en el BOE y entra en vigor en enero de 2027.',
    },
    primarySource: {
      label: 'Ley 21/2026 — BOE Sección 1',
      type: 'BOE',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2026-00001',
    },
  },
  {
    id: 'f3',
    date: '2026-10-15',
    title: 'Datos del INE sobre el empleo juvenil',
    conservative: {
      outlet: 'Marco Prensa Conservadora',
      headline: 'El desempleo juvenil se mantiene en cifras alarmantes pese a las promesas del Ejecutivo',
      body: 'Los últimos datos del INE confirman un panorama desolador: el paro juvenil sigue en cotas alarmantes. Una cifra demoledora que evidencia el fracaso de las políticas del Gobierno. Los jóvenes españoles son los grandes olvidados de un modelo que ahoga el empleo con su fiscalidad asfixiante.',
      highlightedWords: ['desolador', 'alarmantes', 'demoledora', 'fracaso', 'olvidados', 'asfixiante'],
    },
    progressive: {
      outlet: 'Marco Prensa Progresista',
      headline: 'El paro juvenil cae por primera vez en una primavera gracias a las políticas activas',
      body: 'Una excelente noticia: el paro juvenil se reduce de forma significativa por primera vez en una primavera. Los datos del INE confirman el acierto de las políticas activas de empleo del Gobierno, que han logrado tirar de un mercado tradicionalmente abandonado. Un avance esperanzador para las nuevas generaciones.',
      highlightedWords: ['excelente', 'significativa', 'acierto', 'esperanzador'],
    },
    terceraVia: {
      headline: 'La tasa de paro juvenil (16-24) se sitúa en el 27,3% según la EPA del INE',
      body: 'Según la Encuesta de Población Activa (EPA) publicada por el INE, la tasa de paro para el grupo de 16 a 24 años se sitúa en el 27,3% en el tercer trimestre de 2026, lo que supone una bajada de 1,8 puntos respecto al trimestre anterior. La tasa general de paro se mantiene en el 11,2%. El INE publica la metodología, el tamaño muestral (60.000 viviendas) y los intervalos de confianza en su nota técnica.',
    },
    primarySource: {
      label: 'EPA T3 2026 — INE',
      type: 'INE',
      url: 'https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176918',
    },
  },
];

// ---- Impact Cards Data ----

export const impactCards: ImpactCard[] = [
  {
    id: 'i1',
    category: 'Becas y Universidad',
    title: 'Nuevas becas MEC para el curso 2026-2027',
    date: '2026-10-01',
    queCambia: 'Umbral de renta subido a 16.500€ para familias con 3+ miembros. La cuantía variable pasa de 60€ a 350€ para alumnos no residente. Se incluye una nueva beca de movilidad para estudiantes que se mudan de comunidad autónoma para estudiar.',
    aQuienBeneficia: 'Estudiantes universitarios de grado, FP de grado superior y enseñanzas artísticas superiores con rentas por debajo del umbral. Especial impacto en familias numerosas y estudiantes que deben mudarse de su localidad.',
    comoSolicitarlo: 'Presentar la solicitud en la sede electrónica del Ministerio de Educación antes del 30 de noviembre. Necesitas Certificado Digital o Cl@ve. El expediente se resuelve en unos 3 meses y se cobra en un pago único.',
  },
  {
    id: 'i2',
    category: 'Vivienda y Alquiler',
    title: 'Bono de Alquiler Joven (hasta 600€/mes) en Andalucía',
    date: '2026-09-15',
    queCambia: 'La Junta de Andalucía pone en marcha el Bono de Alquiler Joven, que cubre hasta 600€ al mes del alquiler durante dos años para jóvenes de hasta 35 años con rentas inferiores a tres veces el IPREM.',
    aQuienBeneficia: 'Jóvenes andaluces (o empadronados en Andalucía) de hasta 35 años con ingresos inferiores a 23.000€ anuales. Debe ser el primer contrato de alquiler del solicitante o no haber tenido vivienda en propiedad en los últimos 2 años.',
    comoSolicitarlo: 'Solicitar a través de la web de la Consejería de Fomento de la Junta de Andalucía. Necesitas vida laboral, declaración de la renta última y contrato de alquiler inscrito en el Registro de la Propiedad. La resolución se notifica en 45 días.',
  },
  {
    id: 'i3',
    category: 'Empleo y Contratos',
    title: 'Nuevas bonificaciones por contratación indefinida de menores de 30',
    date: '2026-08-20',
    queCambia: 'Las empresas que contraten indefinidamente a jóvenes menores de 30 en paro recibirán una bonificación de 300€/mes en la cuota empresarial a la Seguridad Social durante 3 años (antes era 1 año). Se amplía también a contratos a tiempo parcial con jornada mínima del 50%.',
    aQuienBeneficia: 'Jóvenes de hasta 30 años inscritos como demandantes de empleo. La empresa se beneficia de la reducción de cotizaciones. Aplicable también a pymes y autónomos que den su primer empleo indefinido a un menor de 30.',
    comoSolicitarlo: 'La bonificación se aplica de oficio por la Tesorería General de la Seguridad Social al comunicar el alta del trabajador. Solo es necesario contratar en la modalidad indefinida y mantener el empleo al menos 6 meses.',
  },
  {
    id: 'i4',
    category: 'Impuestos',
    title: 'Reducción del IRPF para rentas de hasta 22.000€',
    date: '2026-07-10',
    queCambia: 'Se amplía el tramo reducido del IRPF para rentas de hasta 22.000€ (antes 20.000€), con una rebaja media de 350€ al año para este colectivo. Sube también el mínimo personal de 5.550€ a 6.000€. Estas medidas aplican en la declaración de la renta de 2027 (sobre las rentas de 2026).',
    aQuienBeneficia: 'Asalariados, autónomos y pensionistas con rentas del trabajo inferiores a 22.000€ anuales. Especialmente útil para jóvenes con sus primeros empleos, becarios con retribución y trabajadores a tiempo parcial.',
    comoSolicitarlo: 'No hay que solicitar nada. La rebaja se aplica automáticamente al hacer la declaración de la renta en la campaña de 2027 (rentas de 2026). El borrador ya vendrá con el cálculo actualizado.',
  },
  {
    id: 'i5',
    category: 'Becas y Universidad',
    title: 'FP Dual: nuevo modelo con beca-salario de 500€/mes',
    date: '2026-09-28',
    queCambia: 'Los alumnos de FP Dual en empresas colaboradoras recibirán una beca-salario de 500€ al mes durante su estancia en la empresa. La beca es compatible con otras ayudas y no afecta al derecho a la prestación por desempleo futuro.',
    aQuienBeneficia: 'Alumnos matriculados en ciclos de FP Dual (grado medio y superior) que realicen el módulo profesional en el centro de trabajo. Aplicable a todas las familias profesionales, con prioridad en Industria, TIC y Salud.',
    comoSolicitarlo: 'La solicitud se realiza a través del centro educativo antes del 15 de octubre. El centro remite la relación de alumnos a la consejería correspondiente, que abona la beca mensualmente en la cuenta del alumno.',
  },
  {
    id: 'i6',
    category: 'Vivienda y Alquiler',
    title: 'Garantía Joven para el alquiler sin aval familiar',
    date: '2026-06-30',
    queCambia: 'El Estado actúa como avalador de hasta 6 mensualidades de alquiler para jóvenes de hasta 35 años que no puedan presentar aval familiar. Permite acceder a viviendas de alquiler sin necesidad de depósitos adicionales.',
    aQuienBeneficia: 'Jóvenes de hasta 35 años con ingresos inferiores a tres veces el IPREM que quieran alquilar su primera vivienda y no dispongan de aval familiar. Disponible en toda España, con convenios con las principales inmobiliarias.',
    comoSolicitarlo: 'Inscribirse en el Registro de Demandantes de Vivienda de la comunidad autónoma y solicitar el certificado de idoneidad en la web del Ministerio de Vivienda. Presentar el certificado a la inmobiliaria o propietario al firmar el contrato.',
  },
];

// ---- Curva de Valor / Differentiation ----

export interface ComparisonAxis {
  axis: string;
  terceraVia: string;
  newtral: string;
  maldita: string;
  elOrdenMundial: string;
}

export const comparisonAxes: ComparisonAxis[] = [
  {
    axis: 'Enfoque principal',
    terceraVia: 'Auditoría proactiva del marco de prensa',
    newtral: 'Verificación posterior (debunk)',
    maldita: 'Detección de bulos y falsedades',
    elOrdenMundial: 'Análisis geopolítico teórico',
  },
  {
    axis: 'Tiempo de lectura',
    terceraVia: '4 minutos / pieza',
    newtral: '8-15 minutos',
    maldita: '5-10 minutos',
    elOrdenMundial: '15-30 minutos',
  },
  {
    axis: 'Foco en el impacto cotidiano',
    terceraVia: 'Sí, ficha de impacto por tema',
    newtral: 'No, foco en la afirmación verificada',
    maldita: 'No, foco en el bulo desmentido',
    elOrdenMundial: 'No, foco en tendencia global',
  },
  {
    axis: 'Contraste de marcos',
    terceraVia: 'Sí, side-by-side en cada pieza',
    newtral: 'No, una sola línea editorial',
    maldita: 'No, una sola línea editorial',
    elOrdenMundial: 'No, una sola línea editorial',
  },
  {
    axis: 'Enlace a la fuente primaria',
    terceraVia: 'Sí, BOE/BOJA/INE en cada análisis',
    newtral: 'A veces, con enlaces secundarios',
    maldita: 'A veces, en el propio texto',
    elOrdenMundial: 'Sí, pero centrado en fuentes de análisis',
  },
  {
    axis: 'Público preferente',
    terceraVia: 'Jóvenes 16-30 y universitarios',
    newtral: 'Adulto general interesado en política',
    maldita: 'Adulto general con uso de redes',
    elOrdenMundial: 'Adulto interesado en geopolítica',
  },
];

// ---- Curva de Valor visual scores (0-100) ----

export interface ValorScore {
  axis: string;
  valores: { name: string; score: number }[];
}

export const valorScores: ValorScore[] = [
  {
    axis: 'Concisión',
    valores: [
      { name: 'La Tercera Vía', score: 95 },
      { name: 'Newtral', score: 55 },
      { name: 'Maldita.es', score: 60 },
      { name: 'El Orden Mundial', score: 20 },
    ],
  },
  {
    axis: 'Impacto cotidiano',
    valores: [
      { name: 'La Tercera Vía', score: 90 },
      { name: 'Newtral', score: 35 },
      { name: 'Maldita.es', score: 30 },
      { name: 'El Orden Mundial', score: 25 },
    ],
  },
  {
    axis: 'Contraste de marcos',
    valores: [
      { name: 'La Tercera Vía', score: 92 },
      { name: 'Newtral', score: 15 },
      { name: 'Maldita.es', score: 10 },
      { name: 'El Orden Mundial', score: 20 },
    ],
  },
  {
    axis: 'Verificación documental',
    valores: [
      { name: 'La Tercera Vía', score: 88 },
      { name: 'Newtral', score: 80 },
      { name: 'Maldita.es', score: 75 },
      { name: 'El Orden Mundial', score: 70 },
    ],
  },
];

// ---- Support tiers ----

export interface SupportTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export const supportTiers: SupportTier[] = [
  {
    name: 'Suscriptor Libre',
    price: '0€',
    description: 'Acceso completo al contenido como servicio público.',
    features: [
      'Lectura en 4 minutos cada día',
      'Escáner de Marcos completo',
      'Fichas de Impacto Práctico',
      'Newsletter semanal en tu correo',
    ],
    cta: 'Suscribirme gratis',
  },
  {
    name: 'Miembro Colaborador',
    price: '3€/mes',
    description: 'Apoyas la independencia del proyecto de forma recurrente.',
    features: [
      'Todo lo del Suscriptor Libre',
      'Acceso anticipado a piezas especiales',
      'Podcast mensual de análisis extendido',
      'Tu nombre en la página de apoyo',
      'Voto en las próximas temáticas a cubrir',
    ],
    highlighted: true,
    cta: 'Hacerme miembro',
  },
  {
    name: 'Patrocinio Local',
    price: 'Desde 50€/mes',
    description: 'Para comercios y entidades de proximidad que creen en el proyecto.',
    features: [
      'Todo lo del Miembro Colaborador',
      'Mención de tu comercio local en la web',
      'Una pieza encargada al año sobre tu sector',
      'Reunión trimestral con el equipo editorial',
      'Compromiso de no injerencia editorial',
    ],
    cta: 'Hablar con el equipo',
  },
];
