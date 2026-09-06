// Horarios por defecto. El panel de admin puede sobrescribir esto en
// Firebase (nodo "hours") sin tocar código — esto es solo el valor de
// respaldo si Firebase no responde o todavía no se ha configurado nada.
// null = cerrado ese día. Cada día es un array de turnos [{ open, close }, ...]
// en formato "HH:MM". Un turno puede cruzar medianoche (ej. 19:00 a 00:30).
// (Se acepta también un único objeto { open, close } por compatibilidad
// con horarios guardados antes de que existieran los turnos partidos.)
var FRY_HOURS_DEFAULT = {
  lunes:     null,
  martes:    [{ open: "13:00", close: "17:00" }, { open: "20:00", close: "23:00" }],
  miercoles: [{ open: "13:00", close: "17:00" }, { open: "20:00", close: "23:00" }],
  jueves:    [{ open: "13:00", close: "17:00" }, { open: "20:00", close: "23:00" }],
  viernes:   [{ open: "13:00", close: "17:00" }, { open: "19:00", close: "00:30" }],
  sabado:    [{ open: "13:00", close: "17:00" }, { open: "19:00", close: "00:30" }],
  domingo:   [{ open: "13:00", close: "17:00" }, { open: "20:00", close: "23:00" }]
};

var FRY_DAY_ORDER = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
var FRY_DAY_LABELS = {
  lunes: "Lunes", martes: "Martes", miercoles: "Miércoles",
  jueves: "Jueves", viernes: "Viernes", sabado: "Sábado", domingo: "Domingo"
};

// Normaliza el valor guardado para un día a un array de turnos.
// Acepta: array de turnos, un único {open,close} (formato antiguo), o null/undefined.
function fryShiftsOf(dayValue) {
  if (!dayValue) return [];
  if (Array.isArray(dayValue)) {
    return dayValue.filter(function (s) { return s && s.open && s.close; });
  }
  if (dayValue.open && dayValue.close) return [dayValue];
  return [];
}

function fryMinutesOf(hhmm) {
  var parts = hhmm.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

// Comprueba si una fecha/hora concreta cae dentro del horario de apertura.
// Tiene en cuenta turnos partidos y turnos que cruzan la medianoche (el
// turno de la noche anterior puede seguir "abierto" en la madrugada de hoy).
function fryIsWithinHours(date, hoursMap) {
  var dayIndex = date.getDay();
  var dayKey = FRY_DAY_ORDER[dayIndex];
  var prevDayKey = FRY_DAY_ORDER[(dayIndex + 6) % 7];
  var minutes = date.getHours() * 60 + date.getMinutes();

  var todayShifts = fryShiftsOf(hoursMap[dayKey]);
  for (var i = 0; i < todayShifts.length; i++) {
    var openMin = fryMinutesOf(todayShifts[i].open);
    var closeMin = fryMinutesOf(todayShifts[i].close);
    if (closeMin > openMin) {
      if (minutes >= openMin && minutes < closeMin) return true;
    } else {
      // turno nocturno que cruza medianoche (ej. 19:00 a 00:30)
      if (minutes >= openMin) return true;
    }
  }

  // la madrugada de hoy puede seguir cubierta por el turno nocturno de ayer
  var prevShifts = fryShiftsOf(hoursMap[prevDayKey]);
  for (var j = 0; j < prevShifts.length; j++) {
    var pOpenMin = fryMinutesOf(prevShifts[j].open);
    var pCloseMin = fryMinutesOf(prevShifts[j].close);
    if (pCloseMin <= pOpenMin && minutes < pCloseMin) return true;
  }

  return false;
}

function fryTodayHoursText(date, hoursMap) {
  var dayKey = FRY_DAY_ORDER[date.getDay()];
  var shifts = fryShiftsOf(hoursMap[dayKey]);
  if (!shifts.length) return "Hoy cerrado";
  var parts = shifts.map(function (s) { return s.open + " a " + s.close; });
  return "Hoy de " + parts.join(" y de ");
}
