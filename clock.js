// The new tab's date and time. The date speaks a language picked at random from the list
// in settings; the time follows the browser's language and the 12/24 hour setting.
(() => {
  function pickLocale(locales, random = Math.random) {
    return locales.length ? locales[Math.floor(random() * locales.length)] : undefined;
  }

  function formatDate(date, locale) {
    return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  }

  const CYCLES = { 24: 'h23', 12: 'h12' };

  function formatTime(date, locale, clock) {
    const options = { hour: 'numeric', minute: '2-digit' };
    if (CYCLES[clock]) options.hourCycle = CYCLES[clock];
    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  // The time without its day period (AM, p.m.), and the period apart, so it can be set small.
  function timeParts(date, locale, clock) {
    const options = { hour: 'numeric', minute: '2-digit' };
    if (CYCLES[clock]) options.hourCycle = CYCLES[clock];
    const parts = new Intl.DateTimeFormat(locale, options).formatToParts(date);
    return {
      time: parts.filter((part) => part.type !== 'dayPeriod').map((part) => part.value).join('').trim(),
      period: parts.find((part) => part.type === 'dayPeriod')?.value ?? '',
    };
  }

  const api = { pickLocale, formatDate, formatTime, timeParts };
  globalThis.sobrio = globalThis.sobrio || {};
  globalThis.sobrio.clock = api;
  if (typeof module === 'object') module.exports = api;
})();
