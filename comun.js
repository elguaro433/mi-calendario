// ══ CÓDIGO COMÚN ══ Mi Calendario (versión pública)
// Tipos de evento, países (prefijo de teléfono), festivos nacionales, celebraciones (Día de la Madre/Padre…),
// estaciones y cambios de hora. Los textos van por idioma: { es, en, pt, fr, ca, it, de }.
// Si falta un idioma, la app enseña el inglés (los festivos de cada país van en su idioma, español e inglés).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CalComun = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  const IDIOMAS = { es: 'Español', en: 'English', pt: 'Português', fr: 'Français', ca: 'Català', it: 'Italiano', de: 'Deutsch' };
  // Texto en varios idiomas: los siete en orden (es, en, pt, fr, ca, it, de) o solo algunos
  const X = (es, en, pt, fr, ca, it, de) => ({ es, en, pt, fr, ca, it, de });

  const TIPOS = {
    cumple:       { label: X('Cumpleaños', 'Birthday', 'Aniversário', 'Anniversaire', 'Aniversari', 'Compleanno', 'Geburtstag'),        icon: '🎂', color: '#d9528b', anual: true,  aviso: 7 },
    aniversario:  { label: X('Aniversario', 'Anniversary', 'Bodas', 'Mariage', 'Noces', 'Anniversario', 'Jahrestag'),                  icon: '💍', color: '#7c5cc4', anual: true,  aviso: 7 },
    celebracion:  { label: X('Celebración', 'Celebration', 'Comemoração', 'Fête', 'Celebració', 'Festa', 'Feier'),                      icon: '🎉', color: '#e27a45', anual: false, aviso: 7 },
    familiar:     { label: X('Familiar', 'Family', 'Família', 'Famille', 'Família', 'Famiglia', 'Familie'),                             icon: '👨‍👩‍👦', color: '#2f9e78', anual: false, aviso: 1 },
    recordatorio: { label: X('Recordatorio', 'Reminder', 'Lembrete', 'Rappel', 'Recordatori', 'Promemoria', 'Erinnerung'),              icon: '🔔', color: '#c9962b', anual: false, aviso: 1 },
    salud:        { label: X('Médico', 'Doctor', 'Médico', 'Médecin', 'Metge', 'Medico', 'Arzt'),                                      icon: '🩺', color: '#1f9aa3', anual: false, aviso: 1 },
    escuela:      { label: X('Colegio', 'School', 'Escola', 'École', 'Escola', 'Scuola', 'Schule'),                                     icon: '🎒', color: '#4a7fd6', anual: false, aviso: 1 },
    recuerdo:     { label: X('En memoria', 'In memory', 'In memoriam', 'En mémoire', 'En memòria', 'In memoria', 'Gedenken'),           icon: '🕊️', color: '#9c8fb8', anual: true,  aviso: 7 },
    otro:         { label: X('Otro', 'Other', 'Outro', 'Autre', 'Altre', 'Altro', 'Sonstiges'),                                         icon: '📌', color: '#7a7f91', anual: false, aviso: 0 },
  };

  // País → prefijo de teléfono (tel), hemisferio sur (sur) y horario de verano (dst: 'ue' o 'na').
  // Los que no están en la lista eligen «Otro país»: el número se escribe con su prefijo (+…).
  const PAISES = {
    AR: { tel: '54', sur: 1 }, BO: { tel: '591', sur: 1 }, CL: { tel: '56', sur: 1 }, CO: { tel: '57' }, CR: { tel: '506' },
    CU: { tel: '53' }, DO: { tel: '1' }, EC: { tel: '593' }, SV: { tel: '503' }, GT: { tel: '502' }, HN: { tel: '504' },
    MX: { tel: '52' }, NI: { tel: '505' }, PA: { tel: '507' }, PY: { tel: '595', sur: 1 }, PE: { tel: '51', sur: 1 },
    PR: { tel: '1' }, UY: { tel: '598', sur: 1 }, VE: { tel: '58' },
    ES: { tel: '34', dst: 'ue' }, AD: { tel: '376', dst: 'ue' }, PT: { tel: '351', dst: 'ue' }, FR: { tel: '33', dst: 'ue' },
    IT: { tel: '39', dst: 'ue' }, DE: { tel: '49', dst: 'ue' }, GB: { tel: '44', dst: 'ue' }, CH: { tel: '41', dst: 'ue' },
    BE: { tel: '32', dst: 'ue' }, US: { tel: '1', dst: 'na' }, CA: { tel: '1', dst: 'na' }, BR: { tel: '55', sur: 1 },
  };

  const pad = n => String(n).padStart(2, '0');
  const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  function pascua(y) { // Algoritmo anónimo gregoriano
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
      f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
      i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    return new Date(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
  }
  // n-ésimo día de la semana (dow: 0 domingo … 6 sábado) del mes (0-11); n = -1 → el último
  function nth(y, mes, dow, n) {
    if (n < 0) { const d = new Date(y, mes + 1, 0); d.setDate(d.getDate() - (d.getDay() - dow + 7) % 7); return d; }
    const d = new Date(y, mes, 1);
    return new Date(y, mes, 1 + (dow - d.getDay() + 7) % 7 + 7 * (n - 1));
  }

  // ══ FESTIVOS NACIONALES ══ (sin los regionales ni los locales; si cae en domingo no se mueve al lunes)
  // Cada festivo: [cuándo, español, inglés, idioma del país]. cuándo = [mes, día], 'P±n' (días desde Pascua) o 'mes,dow,n' (n-ésimo).
  const FEST = {
    ES: { idioma: 'ca', dias: [[[0, 1], 'Año Nuevo', 'New Year’s Day', 'Any Nou'], [[0, 6], 'Reyes', 'Epiphany', 'Reis'], ['P-2', 'Viernes Santo', 'Good Friday', 'Divendres Sant'],
      [[4, 1], 'Día del Trabajo', 'Labour Day', 'Festa del Treball'], [[7, 15], 'La Asunción', 'Assumption Day', 'L’Assumpció'], [[9, 12], 'Fiesta Nacional', 'National Day', 'Festa Nacional'],
      [[10, 1], 'Todos los Santos', 'All Saints’ Day', 'Tots Sants'], [[11, 6], 'Día de la Constitución', 'Constitution Day', 'Dia de la Constitució'],
      [[11, 8], 'La Inmaculada', 'Immaculate Conception', 'La Immaculada'], [[11, 25], 'Navidad', 'Christmas Day', 'Nadal']] },
    AD: { idioma: 'ca', dias: [[[0, 1], 'Año Nuevo', 'New Year’s Day', 'Any Nou'], [[0, 6], 'Reyes', 'Epiphany', 'Reis'], ['P-48', 'Carnaval', 'Carnival', 'Carnaval'],
      [[2, 14], 'Día de la Constitución', 'Constitution Day', 'Dia de la Constitució'], ['P-2', 'Viernes Santo', 'Good Friday', 'Divendres Sant'],
      ['P+1', 'Lunes de Pascua', 'Easter Monday', 'Dilluns de Pasqua'], [[4, 1], 'Día del Trabajo', 'Labour Day', 'Festa del Treball'],
      ['P+50', 'Lunes de Pentecostés', 'Whit Monday', 'Dilluns de Pentecosta'], [[7, 15], 'La Asunción', 'Assumption Day', 'L’Assumpció'],
      [[8, 8], 'Nuestra Señora de Meritxell', 'Our Lady of Meritxell', 'Mare de Déu de Meritxell'], [[10, 1], 'Todos los Santos', 'All Saints’ Day', 'Tots Sants'],
      [[11, 8], 'La Inmaculada', 'Immaculate Conception', 'La Immaculada'], [[11, 25], 'Navidad', 'Christmas Day', 'Nadal'], [[11, 26], 'San Esteban', 'St Stephen’s Day', 'Sant Esteve']] },
    MX: { dias: [[[0, 1], 'Año Nuevo', 'New Year’s Day'], ['1,1,1', 'Día de la Constitución', 'Constitution Day'], ['2,1,3', 'Natalicio de Benito Juárez', 'Benito Juárez’s Birthday'],
      [[4, 1], 'Día del Trabajo', 'Labour Day'], [[8, 16], 'Día de la Independencia', 'Independence Day'], ['10,1,3', 'Día de la Revolución', 'Revolution Day'], [[11, 25], 'Navidad', 'Christmas Day']] },
    VE: { dias: [[[0, 1], 'Año Nuevo', 'New Year’s Day'], ['P-48', 'Lunes de Carnaval', 'Carnival Monday'], ['P-47', 'Martes de Carnaval', 'Carnival Tuesday'],
      ['P-3', 'Jueves Santo', 'Maundy Thursday'], ['P-2', 'Viernes Santo', 'Good Friday'], [[3, 19], 'Declaración de la Independencia', 'Declaration of Independence'],
      [[4, 1], 'Día del Trabajo', 'Labour Day'], [[5, 24], 'Batalla de Carabobo', 'Battle of Carabobo'], [[6, 5], 'Día de la Independencia', 'Independence Day'],
      [[6, 24], 'Natalicio de Simón Bolívar', 'Simón Bolívar’s Birthday'], [[9, 12], 'Día de la Resistencia Indígena', 'Indigenous Resistance Day'], [[11, 25], 'Navidad', 'Christmas Day']] },
    US: { dias: [[[0, 1], 'Año Nuevo', 'New Year’s Day'], ['0,1,3', 'Día de Martin Luther King', 'Martin Luther King Jr. Day'], ['1,1,3', 'Día de los Presidentes', 'Presidents’ Day'],
      ['4,1,-1', 'Día de los Caídos', 'Memorial Day'], [[5, 19], 'Juneteenth', 'Juneteenth'], [[6, 4], 'Día de la Independencia', 'Independence Day'],
      ['8,1,1', 'Día del Trabajo', 'Labor Day'], ['9,1,2', 'Día de la Hispanidad / Colón', 'Columbus Day'], [[10, 11], 'Día de los Veteranos', 'Veterans Day'],
      ['10,4,4', 'Acción de Gracias', 'Thanksgiving'], [[11, 25], 'Navidad', 'Christmas Day']] },
    BR: { idioma: 'pt', dias: [[[0, 1], 'Año Nuevo', 'New Year’s Day', 'Confraternização Universal'], ['P-2', 'Viernes Santo', 'Good Friday', 'Sexta-feira Santa'],
      [[3, 21], 'Tiradentes', 'Tiradentes Day', 'Tiradentes'], [[4, 1], 'Día del Trabajo', 'Labour Day', 'Dia do Trabalho'],
      [[8, 7], 'Día de la Independencia', 'Independence Day', 'Independência do Brasil'], [[9, 12], 'Nuestra Señora Aparecida', 'Our Lady of Aparecida', 'Nossa Senhora Aparecida'],
      [[10, 2], 'Día de los Difuntos', 'All Souls’ Day', 'Finados'], [[10, 15], 'Proclamación de la República', 'Republic Day', 'Proclamação da República'],
      [[10, 20], 'Día de la Conciencia Negra', 'Black Consciousness Day', 'Dia da Consciência Negra'], [[11, 25], 'Navidad', 'Christmas Day', 'Natal']] },
    PT: { idioma: 'pt', dias: [[[0, 1], 'Año Nuevo', 'New Year’s Day', 'Ano Novo'], ['P-2', 'Viernes Santo', 'Good Friday', 'Sexta-feira Santa'], ['P+0', 'Pascua', 'Easter Sunday', 'Páscoa'],
      [[3, 25], 'Día de la Libertad', 'Freedom Day', 'Dia da Liberdade'], [[4, 1], 'Día del Trabajo', 'Labour Day', 'Dia do Trabalhador'], ['P+60', 'Corpus Christi', 'Corpus Christi', 'Corpo de Deus'],
      [[5, 10], 'Día de Portugal', 'Portugal Day', 'Dia de Portugal'], [[7, 15], 'La Asunción', 'Assumption Day', 'Assunção de Nossa Senhora'],
      [[9, 5], 'Implantación de la República', 'Republic Day', 'Implantação da República'], [[10, 1], 'Todos los Santos', 'All Saints’ Day', 'Dia de Todos os Santos'],
      [[11, 1], 'Restauración de la Independencia', 'Restoration of Independence', 'Restauração da Independência'], [[11, 8], 'La Inmaculada', 'Immaculate Conception', 'Imaculada Conceição'],
      [[11, 25], 'Navidad', 'Christmas Day', 'Natal']] },
    FR: { idioma: 'fr', dias: [[[0, 1], 'Año Nuevo', 'New Year’s Day', 'Jour de l’An'], ['P+1', 'Lunes de Pascua', 'Easter Monday', 'Lundi de Pâques'],
      [[4, 1], 'Día del Trabajo', 'Labour Day', 'Fête du Travail'], [[4, 8], 'Victoria de 1945', 'Victory in Europe Day', 'Victoire 1945'], ['P+39', 'Ascensión', 'Ascension Day', 'Ascension'],
      ['P+50', 'Lunes de Pentecostés', 'Whit Monday', 'Lundi de Pentecôte'], [[6, 14], 'Fiesta Nacional', 'Bastille Day', 'Fête nationale'],
      [[7, 15], 'La Asunción', 'Assumption Day', 'Assomption'], [[10, 1], 'Todos los Santos', 'All Saints’ Day', 'Toussaint'], [[10, 11], 'Armisticio de 1918', 'Armistice Day', 'Armistice 1918'],
      [[11, 25], 'Navidad', 'Christmas Day', 'Noël']] },
    IT: { idioma: 'it', dias: [[[0, 1], 'Año Nuevo', 'New Year’s Day', 'Capodanno'], [[0, 6], 'Reyes', 'Epiphany', 'Epifania'], ['P+1', 'Lunes de Pascua', 'Easter Monday', 'Lunedì dell’Angelo'],
      [[3, 25], 'Día de la Liberación', 'Liberation Day', 'Festa della Liberazione'], [[4, 1], 'Día del Trabajo', 'Labour Day', 'Festa del Lavoro'],
      [[5, 2], 'Fiesta de la República', 'Republic Day', 'Festa della Repubblica'], [[7, 15], 'Ferragosto', 'Ferragosto', 'Ferragosto'], [[10, 1], 'Todos los Santos', 'All Saints’ Day', 'Ognissanti'],
      [[11, 8], 'La Inmaculada', 'Immaculate Conception', 'Immacolata Concezione'], [[11, 25], 'Navidad', 'Christmas Day', 'Natale'], [[11, 26], 'San Esteban', 'St Stephen’s Day', 'Santo Stefano']] },
    DE: { idioma: 'de', dias: [[[0, 1], 'Año Nuevo', 'New Year’s Day', 'Neujahr'], ['P-2', 'Viernes Santo', 'Good Friday', 'Karfreitag'], ['P+1', 'Lunes de Pascua', 'Easter Monday', 'Ostermontag'],
      [[4, 1], 'Día del Trabajo', 'Labour Day', 'Tag der Arbeit'], ['P+39', 'Ascensión', 'Ascension Day', 'Christi Himmelfahrt'], ['P+50', 'Lunes de Pentecostés', 'Whit Monday', 'Pfingstmontag'],
      [[9, 3], 'Día de la Unidad Alemana', 'German Unity Day', 'Tag der Deutschen Einheit'], [[11, 25], 'Navidad', 'Christmas Day', '1. Weihnachtstag'], [[11, 26], 'San Esteban', 'St Stephen’s Day', '2. Weihnachtstag']] },
  };
  function festivos(y, pais) {
    const p = FEST[pais]; if (!p) return [];
    const E = pascua(y);
    return p.dias.map(([cu, es, en, nat]) => {
      let d;
      if (Array.isArray(cu)) d = new Date(y, cu[0], cu[1]);
      else if (cu[0] === 'P') d = new Date(E.getFullYear(), E.getMonth(), E.getDate() + Number(cu.slice(1)));
      else { const [m, dow, n] = cu.split(',').map(Number); d = nth(y, m, dow, n); }
      const titulo = { es, en }; if (nat && p.idioma) titulo[p.idioma] = nat;
      return { fecha: ymd(d), titulo, icon: '🔴' };
    }).sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  // ══ CELEBRACIONES ══ (no son festivos) Día de la Madre y del Padre según el país
  const CELEB_COLOR = '#e27a45';
  const MADRE_PADRE = {   // [madre, padre]: fecha fija [mes, día] o domingo n-ésimo { mes, n }
    ES: [{ mes: 4, n: 1 }, [2, 19]], AD: [{ mes: 4, n: 1 }, [2, 19]], PT: [{ mes: 4, n: 1 }, [2, 19]], IT: [{ mes: 4, n: 2 }, [2, 19]],
    MX: [[4, 10], { mes: 5, n: 3 }], SV: [[4, 10], [5, 17]], GT: [[4, 10], [5, 17]],
    VE: [{ mes: 4, n: 2 }, { mes: 5, n: 3 }], CO: [{ mes: 4, n: 2 }, { mes: 5, n: 3 }], CL: [{ mes: 4, n: 2 }, { mes: 5, n: 3 }],
    PE: [{ mes: 4, n: 2 }, { mes: 5, n: 3 }], EC: [{ mes: 4, n: 2 }, { mes: 5, n: 3 }], US: [{ mes: 4, n: 2 }, { mes: 5, n: 3 }],
    CA: [{ mes: 4, n: 2 }, { mes: 5, n: 3 }], AR: [{ mes: 9, n: 3 }, { mes: 5, n: 3 }], DE: [{ mes: 4, n: 2 }, null],
    GB: [null, { mes: 5, n: 3 }], FR: [null, { mes: 5, n: 3 }], BR: [{ mes: 4, n: 2 }, { mes: 7, n: 2 }],
  };
  const VALENTIN = X('San Valentín', 'Valentine’s Day', 'Dia de São Valentim', 'Saint-Valentin', 'Sant Valentí', 'San Valentino', 'Valentinstag');
  const NAMORADOS = X('Día de los Enamorados', 'Valentine’s Day (Brazil)', 'Dia dos Namorados', 'Saint-Valentin (Brésil)', 'Dia dels Enamorats', 'San Valentino (Brasile)', 'Valentinstag (Brasilien)');
  const MUJER = X('Día de la Mujer', 'International Women’s Day', 'Dia Internacional da Mulher', 'Journée internationale des femmes', 'Dia de la Dona', 'Festa della donna', 'Frauentag');
  const MADRE = X('Día de la Madre', 'Mother’s Day', 'Dia das Mães', 'Fête des mères', 'Dia de la Mare', 'Festa della mamma', 'Muttertag');
  const PADRE = X('Día del Padre', 'Father’s Day', 'Dia dos Pais', 'Fête des pères', 'Dia del Pare', 'Festa del papà', 'Vatertag');
  function celebraciones(y, pais) {
    const out = [];
    const add = (d, titulo, icon) => out.push({ fecha: ymd(d), titulo, icon, celeb: true });
    const cuando = x => Array.isArray(x) ? new Date(y, x[0], x[1]) : nth(y, x.mes, 0, x.n);
    if (pais === 'BR') add(new Date(y, 5, 12), NAMORADOS, '❤️');   // en Brasil, el 12 de junio
    else add(new Date(y, 1, 14), VALENTIN, '❤️');
    add(new Date(y, 2, 8), MUJER, '💐');
    const mp = MADRE_PADRE[pais];
    if (mp && mp[0]) add(cuando(mp[0]), MADRE, '👩');
    if (mp && mp[1]) add(cuando(mp[1]), PADRE, '👨');
    return out.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  // ══ ESTACIONES Y CAMBIO DE HORA ══ (a la hora de este teléfono)
  const EST_COLOR = '#7a9a45';
  // Fórmulas de Meeus (Astronomical Algorithms, cap. 27): error de ~1 minuto entre los años 2000 y 3000
  const MEEUS_C = [[2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057],    // marzo
                   [2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030],     // junio
                   [2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078],     // septiembre
                   [2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032]];   // diciembre
  const MEEUS_S = [[485, 324.96, 1934.136], [203, 337.23, 32964.467], [199, 342.08, 20.186], [182, 27.85, 445267.112],
    [156, 73.14, 45036.886], [136, 171.52, 22518.443], [77, 222.54, 65928.934], [74, 296.72, 3034.906], [70, 243.58, 9037.513],
    [58, 119.81, 33718.147], [52, 297.17, 150.678], [50, 21.02, 2281.226], [45, 247.54, 29929.562], [44, 325.15, 31555.956],
    [29, 60.93, 4443.417], [18, 155.12, 67555.328], [17, 288.79, 4562.452], [16, 198.04, 62894.029], [14, 199.76, 31436.921],
    [12, 95.39, 14577.848], [12, 287.11, 31931.756], [12, 320.81, 34777.259], [9, 227.73, 1222.114], [8, 15.45, 16859.074]];
  function momentoEstacion(y, i) {           // i: 0 marzo, 1 junio, 2 septiembre, 3 diciembre → instante (Date)
    const Y = (y - 2000) / 1000, c = MEEUS_C[i], rad = Math.PI / 180;
    const jde0 = c[0] + c[1] * Y + c[2] * Y ** 2 + c[3] * Y ** 3 + c[4] * Y ** 4;
    const T = (jde0 - 2451545) / 36525, W = (35999.373 * T - 2.47) * rad;
    const S = MEEUS_S.reduce((s, [a, b, k]) => s + a * Math.cos((b + k * T) * rad), 0);
    const jde = jde0 + 0.00001 * S / (1 + 0.0334 * Math.cos(W) + 0.0007 * Math.cos(2 * W));
    return new Date((jde - 2440587.5) * 86400000 - 69000 + 30000);   // tiempo dinámico → UTC (ΔT ≈ 69 s), redondeado al minuto
  }
  const ESTACIONES = [
    ['🌸', X('Empieza la primavera', 'Spring begins', 'Começa a primavera', 'Début du printemps', 'Comença la primavera', 'Inizia la primavera', 'Frühlingsanfang')],
    ['☀️', X('Empieza el verano', 'Summer begins', 'Começa o verão', 'Début de l’été', 'Comença l’estiu', 'Inizia l’estate', 'Sommeranfang')],
    ['🍂', X('Empieza el otoño', 'Autumn begins', 'Começa o outono', 'Début de l’automne', 'Comença la tardor', 'Inizia l’autunno', 'Herbstanfang')],
    ['❄️', X('Empieza el invierno', 'Winter begins', 'Começa o inverno', 'Début de l’hiver', 'Comença l’hivern', 'Inizia l’inverno', 'Winteranfang')]];
  // Nota de la estación: «Equinoccio, a las 15:24 h · el día más largo del año» en cada idioma
  const NOTA_EST = {
    es: (eq, h, largo) => (eq ? 'Equinoccio' : 'Solsticio') + ', a las ' + h + ' h' + (eq ? '' : largo ? ' · el día más largo del año' : ' · la noche más larga del año'),
    en: (eq, h, largo) => (eq ? 'Equinox' : 'Solstice') + ', at ' + h + (eq ? '' : largo ? ' · the longest day of the year' : ' · the longest night of the year'),
    pt: (eq, h, largo) => (eq ? 'Equinócio' : 'Solstício') + ', às ' + h + (eq ? '' : largo ? ' · o dia mais longo do ano' : ' · a noite mais longa do ano'),
    fr: (eq, h, largo) => (eq ? 'Équinoxe' : 'Solstice') + ', à ' + h + (eq ? '' : largo ? ' · le jour le plus long de l’année' : ' · la nuit la plus longue de l’année'),
    ca: (eq, h, largo) => (eq ? 'Equinocci' : 'Solstici') + ', a les ' + h + (eq ? '' : largo ? ' · el dia més llarg de l’any' : ' · la nit més llarga de l’any'),
    it: (eq, h, largo) => (eq ? 'Equinozio' : 'Solstizio') + ', alle ' + h + (eq ? '' : largo ? ' · il giorno più lungo dell’anno' : ' · la notte più lunga dell’anno'),
    de: (eq, h, largo) => (eq ? 'Tagundnachtgleiche' : 'Sonnenwende') + ', um ' + h + ' Uhr' + (eq ? '' : largo ? ' · der längste Tag des Jahres' : ' · die längste Nacht des Jahres'),
  };
  const ADELANTA = X('Cambio de hora (+1 hora)', 'Clocks go forward (+1 hour)', 'Mudança de hora (+1 hora)', 'Changement d’heure (+1 h)', 'Canvi d’hora (+1 hora)', 'Cambio dell’ora (+1 ora)', 'Zeitumstellung (+1 Stunde)');
  const ATRASA = X('Cambio de hora (−1 hora)', 'Clocks go back (−1 hour)', 'Mudança de hora (−1 hora)', 'Changement d’heure (−1 h)', 'Canvi d’hora (−1 hora)', 'Cambio dell’ora (−1 ora)', 'Zeitumstellung (−1 Stunde)');
  const MENOS = X('Se duerme una hora menos', 'One hour less sleep', 'Dorme-se uma hora a menos', 'Une heure de sommeil en moins', 'Es dorm una hora menys', 'Si dorme un’ora in meno', 'Eine Stunde weniger Schlaf');
  const MAS = X('Se duerme una hora más', 'One extra hour of sleep', 'Dorme-se uma hora a mais', 'Une heure de sommeil en plus', 'Es dorm una hora més', 'Si dorme un’ora in più', 'Eine Stunde mehr Schlaf');
  function estaciones(y, pais) {
    const out = [], p = PAISES[pais] || {};
    for (let i = 0; i < 4; i++) {
      const m = momentoEstacion(y, i), e = ESTACIONES[(i + (p.sur ? 2 : 0)) % 4];   // en el hemisferio sur, al revés
      const hh = pad(m.getHours()) + ':' + pad(m.getMinutes()), eq = i % 2 === 0;
      const largo = !eq && ((i === 1) !== !!p.sur);   // solsticio de verano de ese hemisferio
      const nota = Object.fromEntries(Object.entries(NOTA_EST).map(([l, f]) => [l, f(eq, hh, largo)]));
      out.push({ fecha: ymd(m), titulo: e[1], icon: e[0], estacion: true, aviso: 0, nota });
    }
    const add = (d, titulo, nota) => out.push({ fecha: ymd(d), titulo, icon: '⏰', estacion: true, aviso: 3, nota });
    if (p.dst === 'ue') { add(nth(y, 2, 0, -1), ADELANTA, MENOS); add(nth(y, 9, 0, -1), ATRASA, MAS); }
    if (p.dst === 'na') { add(nth(y, 2, 0, 2), ADELANTA, MENOS); add(nth(y, 10, 0, 1), ATRASA, MAS); }
    return out.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  return { IDIOMAS, TIPOS, PAISES, CELEB_COLOR, EST_COLOR, festivos, celebraciones, estaciones };
});
