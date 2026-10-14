const test = require('node:test');
const assert = require('node:assert/strict');
const { weightOf, boostOf, recordOpen, pruneStats } = require('../stats.js');

const NOW = Date.UTC(2026, 9, 14, 12);
const HOUR = 3600000;
const DAY = 24 * HOUR;

test('weight grows with the number of opens', () => {
  assert.equal(weightOf({ count: 1, last: NOW }, NOW), 1);
  assert.equal(weightOf({ count: 3, last: NOW }, NOW), 2);
  assert.equal(weightOf({ count: 7, last: NOW }, NOW), 3);
  assert.equal(weightOf(undefined, NOW), 0);
});

test('weight fades with time since the last open', () => {
  const at = (age) => weightOf({ count: 3, last: NOW - age }, NOW);
  assert.equal(at(2 * HOUR), 2);
  assert.equal(at(3 * DAY), 1.6);
  assert.equal(at(20 * DAY), 1);
  assert.ok(Math.abs(at(90 * DAY) - 0.6) < 1e-9);
});

test('boost is 8 per point of weight, at most 40', () => {
  assert.equal(boostOf({ count: 3, last: NOW }, NOW), 16);
  assert.equal(boostOf({ count: 1000, last: NOW }, NOW), 40);
  assert.equal(boostOf(undefined, NOW), 0);
});

test('recordOpen counts, dates and keeps the title', () => {
  const once = recordOpen({}, 'https://a.com/', 'A', NOW);
  assert.deepEqual(once, { 'https://a.com/': { count: 1, last: NOW, title: 'A' } });
  const twice = recordOpen(once, 'https://a.com/', '', NOW + 5);
  assert.deepEqual(twice['https://a.com/'], { count: 2, last: NOW + 5, title: 'A' });
  assert.deepEqual(once['https://a.com/'].count, 1);
  assert.deepEqual(recordOpen(undefined, 'https://b.com/', 'B', NOW), { 'https://b.com/': { count: 1, last: NOW, title: 'B' } });
});

test('pruneStats keeps the heaviest pages', () => {
  const stats = {
    'https://old.com/': { count: 50, last: NOW - 400 * DAY, title: '' },
    'https://new.com/': { count: 2, last: NOW, title: '' },
    'https://mid.com/': { count: 10, last: NOW - 2 * DAY, title: '' },
  };
  assert.deepEqual(Object.keys(pruneStats(stats, 2, NOW)).sort(), ['https://mid.com/', 'https://old.com/']);
  assert.equal(pruneStats(stats, 5, NOW), stats);
});
