# New Song: a shared songbook for church music teams

A free, phone-friendly songbook for worship teams. Musicians open a link to see the songs. They don't need an account or an app.

- Set lists with each song's key, order and notes, plus a "Next song" button for stage use
- Chord charts that change key in one tap, with capo shapes, Nashville numbers or lyrics only
- Separate keys for each team (Sunday Morning, Youth, Wednesday Night…)
- Search by title, lyrics, tags or Scripture reference (Ps 23, Rev 4:8)
- PDF of a whole set or one song, and a "Copy for a text" set summary
- A tempo pulse with an optional click
- Works offline once a song has loaded

All the content lives in **one Google Sheet** that your worship leaders edit. The page reads it, so changes show up the next time someone opens or refreshes the page.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole app: one page, with no build step |
| `songbook-template.xlsx` | A starter sheet with Songs, Sets, Settings and How to tabs, and four public-domain hymns |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

## Put it online (GitHub Pages)

1. Create a new repository (for example `songbook`) and upload these files.
2. Go to **Settings › Pages**. Under *Build and deployment*, choose **Deploy from a branch**, then **main** / **root**, and save.
3. After a minute, your page is at `https://YOUR-USERNAME.github.io/songbook/`. Text that link to your teams.

## Use your own sheet (for other churches)

1. Upload `songbook-template.xlsx` to Google Drive and open it with Google Sheets. Use **File › Save as Google Sheets** if it opens as an Excel file.
2. Click **Share** and set *General access* to **Anyone with the link: Viewer**. Add your worship leaders as **Editors**.
3. Copy the sheet's ID: the long code in its address, between `/d/` and `/edit`.
4. Either:
   - open the page as `https://YOUR-USERNAME.github.io/songbook/?sheet=YOUR_SHEET_ID`, or
   - edit `index.html` and replace the value of `DEFAULT_SHEET_ID` near the top of the script.

Keep the tab names **Songs**, **Sets** and **Settings**, and keep the column headers in row 1.

## Editing songs

- **Songs tab:** one row per song. *Key* is the key the chart is written in. *Chart* uses ChordPro: chords in square brackets before the syllable, as in `A[G]mazing [C]grace`. Lines such as `Verse 1` or `Chorus` become headings.
- **Team keys:** `Youth=A; Wednesday Night=C`
- **Scripture:** references separated by semicolons, as in `Isa 6:3; Rev 4:8-11`
- **Sets tab:** one row per song, in playing order. Rows with the same Date and Service make one set.
- The page's **For editors** tab has a chart helper that converts chords written above the lyrics to ChordPro. It also turns SongSelect or ChordPro files into rows you can paste into the Songs tab.

## A note on copyright

The sheet and the page can be read by anyone who has the link. Share the link with your teams rather than posting it publicly, and check what your church's CCLI license covers when sharing charts of copyrighted songs. The starter hymns are in the public domain.
