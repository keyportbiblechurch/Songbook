/**
 * New Song – private songbook service
 *
 * Paste this whole file into the songbook sheet: Extensions › Apps Script.
 * Then deploy it as a web app (see README.md, "Make it private").
 *
 * Two passcodes live on the Settings tab:
 *   Team passcode    – musicians: can read songs and sets
 *   Editor passcode  – leaders: can also add and edit songs and sets from the page
 * Neither passcode row is ever sent to the page.
 */

// The ID of your songbook sheet: the long code in its address between /d/ and /edit.
const SHEET_ID = '1ivlzwVRwPJXo3SxhO4h9t5-BdzVkABOINMehsgzmcw8';

const TABS = ['Songs', 'Sets', 'Settings'];
const SECRET_ROWS = ['team passcode', 'editor passcode'];
const MAX_WRONG = 30;          // wrong passcodes allowed ...
const LOCK_SECONDS = 600;      // ... in this many seconds before a pause

// Columns the page can write, by header name (lower case) → field name it sends.
const SONG_FIELDS = {
  'title': 'title', 'author': 'author', 'ccli': 'ccli', 'key': 'key', 'bpm': 'bpm', 'time': 'sig',
  'scripture': 'scripture', 'tags': 'tags', 'arrangement': 'arrangement', 'team keys': 'teamKeys',
  'chart': 'chart', 'notes': 'notes', 'links': 'links', 'copyright': 'copyright'
};

function doPost(e) {
  let req = {};
  try { req = JSON.parse((e && e.postData && e.postData.contents) || '{}') || {}; } catch (err) {}
  return reply_(handle_(req));
}

function doGet() {
  return reply_({ ok: false, error: 'use-page', message: 'Open the songbook from the New Song page.' });
}

function handle_(req) {
  const pass = String(req.pass || '').trim().toLowerCase();
  const cache = CacheService.getScriptCache();
  const wrong = Number(cache.get('wrong') || 0);
  if (wrong >= MAX_WRONG) {
    return { ok: false, error: 'locked', message: 'Too many wrong passcodes. Try again in 10 minutes.' };
  }

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const codes = passcodes_(ss);
  if (codes.team.length < 6) {
    return { ok: false, error: 'setup', message: 'Add a "Team passcode" row (6 or more characters) to the Settings tab.' };
  }

  const isEditor = codes.editor.length >= 6 && same_(pass, codes.editor);
  const isTeam = isEditor || same_(pass, codes.team);
  if (!pass || !isTeam) {
    cache.put('wrong', String(wrong + 1), LOCK_SECONDS);
    Utilities.sleep(700);
    return { ok: false, error: 'passcode', message: 'That passcode didn’t work.' };
  }

  const action = String(req.action || 'load');
  if (action !== 'load') {
    if (!isEditor) return { ok: false, error: 'not-editor', message: 'Only leaders with the editor passcode can make changes.' };
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(20000)) return { ok: false, error: 'busy', message: 'Someone else is saving. Try again in a moment.' };
    try {
      if (action === 'saveSong') saveSong_(ss, req.song || {}, String(req.originalTitle || ''));
      else if (action === 'saveSet') saveSet_(ss, req.set || {}, req.original || null);
      else if (action === 'deleteSet') deleteSetRows_(ss, req.original || {});
      else return { ok: false, error: 'bad-action' };
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }
  }
  return payload_(ss, isEditor);
}

function passcodes_(ss) {
  const tab = ss.getSheetByName('Settings');
  const rows = tab ? tab.getDataRange().getDisplayValues() : [];
  const out = { team: '', editor: '' };
  rows.forEach(function (r) {
    const k = String(r[0]).trim().toLowerCase();
    if (k === 'team passcode') out.team = String(r[1]).trim().toLowerCase();
    if (k === 'editor passcode') out.editor = String(r[1]).trim().toLowerCase();
  });
  return out;
}

function payload_(ss, isEditor) {
  const out = { ok: true, at: Date.now(), editor: isEditor };
  if (isEditor) out.sheetUrl = ss.getUrl();
  TABS.forEach(function (name) {
    const sh = ss.getSheetByName(name);
    let rows = sh ? sh.getDataRange().getDisplayValues() : [];
    if (name === 'Settings') {
      rows = rows.filter(function (r) { return SECRET_ROWS.indexOf(String(r[0]).trim().toLowerCase()) < 0; });
    }
    out[name.toLowerCase()] = rows;
  });
  return out;
}

// Keeps text as text: a value starting with = + - @ or ' would otherwise be read as a formula or lose its apostrophe.
function safe_(v) {
  const s = String(v == null ? '' : v).slice(0, 45000);
  return /^[=+\-@']/.test(s) ? "'" + s : s;
}

function headerMap_(sh) {
  const head = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getDisplayValues()[0];
  const map = {};
  head.forEach(function (h, i) { map[String(h).trim().toLowerCase()] = i + 1; });
  return map;
}

function saveSong_(ss, song, originalTitle) {
  const sh = ss.getSheetByName('Songs');
  if (!sh) throw new Error('No Songs tab');
  const title = String(song.title || '').trim();
  if (!title) throw new Error('A song needs a title');
  let map = headerMap_(sh);
  // Add any missing column (for example Copyright) at the end.
  Object.keys(SONG_FIELDS).forEach(function (h) {
    if (!map[h] && song[SONG_FIELDS[h]]) {
      const c = sh.getLastColumn() + 1;
      sh.getRange(1, c).setValue(h.charAt(0).toUpperCase() + h.slice(1));
      map = headerMap_(sh);
    }
  });
  const find = (originalTitle || title).toLowerCase();
  const titles = sh.getLastRow() > 1 ? sh.getRange(2, map['title'], sh.getLastRow() - 1, 1).getDisplayValues() : [];
  let row = 0;
  for (let i = 0; i < titles.length; i++) {
    if (String(titles[i][0]).trim().toLowerCase() === find) { row = i + 2; break; }
  }
  if (!row) row = sh.getLastRow() + 1;
  Object.keys(SONG_FIELDS).forEach(function (h) {
    const f = SONG_FIELDS[h];
    if (!map[h] || !(f in song)) return;
    const cell = sh.getRange(row, map[h]);
    cell.setNumberFormat('@');
    cell.setValue(safe_(song[f]));
  });
  // A renamed song keeps its place in every set.
  if (originalTitle && originalTitle.toLowerCase() !== title.toLowerCase()) {
    const st = ss.getSheetByName('Sets');
    if (st && st.getLastRow() > 1) {
      const sm = headerMap_(st);
      if (sm['song']) {
        const r = st.getRange(2, sm['song'], st.getLastRow() - 1, 1);
        const v = r.getDisplayValues().map(function (x) {
          return [String(x[0]).trim().toLowerCase() === originalTitle.toLowerCase() ? safe_(title) : safe_(x[0])];
        });
        r.setNumberFormat('@');
        r.setValues(v);
      }
    }
  }
}

function sameSet_(r, map, o) {
  const d = String(r[map['date'] - 1] || '').trim();
  const s = String(r[map['service'] - 1] || '').trim().toLowerCase();
  const t = map['team'] ? String(r[map['team'] - 1] || '').trim().toLowerCase() : '';
  return normDate_(d) === normDate_(o.date) && s === String(o.service || '').trim().toLowerCase() &&
    t === String(o.team || '').trim().toLowerCase();
}

function normDate_(v) {
  v = String(v || '').trim();
  let m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
  m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) return (m[3].length === 2 ? '20' + m[3] : m[3]) + '-' + ('0' + m[1]).slice(-2) + '-' + ('0' + m[2]).slice(-2);
  return v;
}

function deleteSetRows_(ss, original) {
  const sh = ss.getSheetByName('Sets');
  if (!sh || sh.getLastRow() < 2 || !original.date) return;
  const map = headerMap_(sh);
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getDisplayValues();
  for (let i = rows.length - 1; i >= 0; i--) {
    if (sameSet_(rows[i], map, original)) sh.deleteRow(i + 2);
  }
}

function saveSet_(ss, set, original) {
  const sh = ss.getSheetByName('Sets');
  if (!sh) throw new Error('No Sets tab');
  const date = normDate_(set.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('A set needs a date');
  deleteSetRows_(ss, original || { date: date, service: set.service, team: set.team });
  const map = headerMap_(sh);
  const width = sh.getLastColumn();
  const items = (set.items || []).slice(0, 40);
  if (!items.length) return;
  const rows = items.map(function (it) {
    const r = new Array(width).fill('');
    if (map['date']) r[map['date'] - 1] = date;
    if (map['service']) r[map['service'] - 1] = safe_(set.service || 'Service');
    if (map['team']) r[map['team'] - 1] = safe_(set.team || '');
    if (map['song']) r[map['song'] - 1] = safe_(it.song || '');
    if (map['key']) r[map['key'] - 1] = safe_(it.key || '');
    if (map['note']) r[map['note'] - 1] = safe_(it.note || '');
    return r;
  });
  const start = sh.getLastRow() + 1;
  const range = sh.getRange(start, 1, rows.length, width);
  range.setNumberFormat('@');
  range.setValues(rows);
}

// Compares two strings in constant time.
function same_(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Optional: select "testSetup" in the Apps Script editor and press Run to check your tabs and passcodes.
function testSetup() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  TABS.forEach(function (n) { Logger.log(n + ': ' + (ss.getSheetByName(n) ? 'found' : 'MISSING')); });
  const c = passcodes_(ss);
  Logger.log('Team passcode: ' + (c.team.length >= 6 ? 'set' : 'missing or too short'));
  Logger.log('Editor passcode: ' + (c.editor.length >= 6 ? 'set' : 'not set (leaders can’t edit from the page)'));
  if (c.team && c.team === c.editor) Logger.log('Warning: the two passcodes are the same, so every musician could edit.');
}
