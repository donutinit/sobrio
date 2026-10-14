const test = require('node:test');
const assert = require('node:assert/strict');
const { pickLocale, formatDate, formatTime, timeParts, greetingKey, handAngles } = require('../clock.js');

const OCT_9 = new Date(2026, 9, 9, 12, 23);
const NIGHT = new Date(2026, 9, 9, 21, 5);

test('pickLocale: one of the list, at random', () => {
  const list = ['fr', 'de', 'es', 'it', 'en'];
  assert.equal(pickLocale(list, () => 0), 'fr');
  assert.equal(pickLocale(list, () => 0.999), 'en');
  assert.equal(pickLocale(list, () => 0.5), 'es');
});

test('pickLocale: an empty list means the browser language', () => {
  assert.equal(pickLocale([], () => 0.5), undefined);
});

test('formatDate speaks each language', () => {
  assert.equal(formatDate(OCT_9, 'es-MX'), 'viernes, 9 de octubre de 2026');
  assert.equal(formatDate(OCT_9, 'fr'), 'vendredi 9 octobre 2026');
  assert.equal(formatDate(OCT_9, 'de'), 'Freitag, 9. Oktober 2026');
  assert.equal(formatDate(OCT_9, 'it'), 'venerdì 9 ottobre 2026');
  assert.equal(formatDate(OCT_9, 'en-US'), 'Friday, October 9, 2026');
  assert.ok(formatDate(OCT_9, 'ja').includes('2026'));
});

test('formatTime: 24 hours, 12 hours, or what the language uses', () => {
  assert.equal(formatTime(NIGHT, 'en-US', '24'), '21:05');
  assert.equal(formatTime(NIGHT, 'es-MX', '12').replace(/\s/g, ' '), '9:05 p.m.');
  assert.equal(formatTime(NIGHT, 'de', 'auto'), '21:05');
  assert.equal(formatTime(OCT_9, 'de', '24'), '12:23');
});

test('timeParts splits the day period off, to set it smaller', () => {
  assert.deepEqual(timeParts(NIGHT, 'en-US', '12'), { time: '9:05', period: 'PM' });
  assert.deepEqual(timeParts(NIGHT, 'es-MX', '12'), { time: '9:05', period: 'p.m.' });
  assert.deepEqual(timeParts(NIGHT, 'en-US', '24'), { time: '21:05', period: '' });
});

test('greetingKey: morning from 5, afternoon from 12, evening from 19', () => {
  assert.equal(greetingKey(5), 'greetingMorning');
  assert.equal(greetingKey(11), 'greetingMorning');
  assert.equal(greetingKey(12), 'greetingAfternoon');
  assert.equal(greetingKey(18), 'greetingAfternoon');
  assert.equal(greetingKey(19), 'greetingEvening');
  assert.equal(greetingKey(2), 'greetingEvening');
});

test('handAngles: degrees from twelve o clock', () => {
  assert.deepEqual(handAngles(new Date(2026, 9, 9, 3, 0)), { hour: 90, minute: 0 });
  assert.deepEqual(handAngles(new Date(2026, 9, 9, 15, 30)), { hour: 105, minute: 180 });
  assert.deepEqual(handAngles(new Date(2026, 9, 9, 0, 45)), { hour: 22.5, minute: 270 });
});
