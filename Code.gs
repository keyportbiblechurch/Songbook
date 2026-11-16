/**
 * New Song – private songbook service
 *
 * Paste this whole file into the songbook sheet: Extensions › Apps Script.
 * Then deploy it as a web app (see README.md, "Make it private").
 *
 * What it does: when someone opens the band page and types the team
 * passcode, the page sends the passcode here. If it matches the
 * "Team passcode" row on the Settings tab, this script returns the Songs,
 * Sets and Settings tabs. The sheet itself stays private.
 * The passcode row is never sent to the page.
 */

// The ID of your songbook sheet: the long code in its address between /d/ and /edit.
const SHEET_ID = '1ivlzwVRwPJXo3SxhO4h9t5-BdzVkABOINMehsgzmcw8';

const TABS = ['Songs', 'Sets', 'Settings'];
const MAX_WRONG = 30;          // wrong passcodes allowed ...
const LOCK_SECONDS = 600;      // ... in this many seconds before a pause

function doPost(e) {
  let pass = '';
  try { pass = String(JSON.parse((e && e.postData && e.postData.contents) || '{}').pass || ''); } catch (err) {}
  return reply_(handle_(pass.trim()));
}

function doGet() {
  return reply_({ ok: false, error: 'use-page', message: 'Open the songbook from the New Song page.' });
}

function handle_(pass) {
  const cache = CacheService.getScriptCache();
  const wrong = Number(cache.get('wrong') || 0);
  if (wrong >= MAX_WRONG) {
    return { ok: false, error: 'locked', message: 'Too many wrong passcodes. Try again in 10 minutes.' };
  }

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const settingsTab = ss.getSheetByName('Settings');
  const settingsRows = settingsTab ? settingsTab.getDataRange().getDisplayValues() : [];
  let code = '';
  settingsRows.forEach(function (r) {
    if (String(r[0]).trim().toLowerCase() === 'team passcode') code = String(r[1]).trim();
  });
  if (code.length < 6) {
    return { ok: false, error: 'setup', message: 'Add a "Team passcode" row (6 or more characters) to the Settings tab.' };
  }

  if (!pass || !same_(pass.toLowerCase(), code.toLowerCase())) {
    cache.put('wrong', String(wrong + 1), LOCK_SECONDS);
    Utilities.sleep(700);
    return { ok: false, error: 'passcode', message: 'That passcode didn’t work.' };
  }

  const out = { ok: true, at: Date.now(), sheetUrl: ss.getUrl() };
  TABS.forEach(function (name) {
    const sh = ss.getSheetByName(name);
    let rows = sh ? sh.getDataRange().getDisplayValues() : [];
    if (name === 'Settings') {
      rows = rows.filter(function (r) { return String(r[0]).trim().toLowerCase() !== 'team passcode'; });
    }
    out[name.toLowerCase()] = rows;
  });
  return out;
}

// Compares two strings in constant time.
function same_(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Optional: run this once from the Apps Script editor (select "testSetup" and press Run)
// to check the passcode row and tab names before deploying.
function testSetup() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  TABS.forEach(function (n) { Logger.log(n + ': ' + (ss.getSheetByName(n) ? 'found' : 'MISSING')); });
  const rows = ss.getSheetByName('Settings').getDataRange().getDisplayValues();
  const row = rows.filter(function (r) { return String(r[0]).trim().toLowerCase() === 'team passcode'; })[0];
  Logger.log(row && String(row[1]).trim().length >= 6 ? 'Passcode row found.' : 'Passcode row missing or too short.');
}
