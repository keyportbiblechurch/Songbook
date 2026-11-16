# New Song: a private songbook for church music teams

A free, phone-friendly songbook for worship teams. Musicians open a link and type the team passcode. They don't need an account or an app.

- Set lists with each song's key, order and notes, plus a "Next song" button for stage use
- Chord charts that change key in one tap, with capo shapes, Nashville numbers or lyrics only
- Separate keys for each team (Sunday Morning, Youth, Wednesday Night…)
- Search by title, lyrics, tags or Scripture reference (Ps 23, Rev 4:8)
- PDF of a whole set or one song, with CCLI copyright notices, plus a "Copy for a text" set summary
- A tempo pulse with an optional click
- Works offline once opened; "Lock" clears it from a device

All the content lives in **one private Google Sheet** that your worship leaders edit. A small Google Apps Script attached to the sheet hands the songs to the page **only after the right team passcode is entered**. The sheet itself is never public.

## Files

| File | What it is |
|---|---|
| `index.html` | The band page: one file, with no build step |
| `apps-script/Code.gs` | The passcode script that goes inside your Google Sheet |
| `songbook-template.xlsx` | A starter sheet with Songs, Sets, Settings and How to tabs |
| `robots.txt`, `.nojekyll` | Keep search engines out; tell GitHub Pages to serve the files as they are |

## Make it private (one-time setup, about 15 minutes)

**1. Prepare the sheet**
- On the **Settings** tab, add two rows:
  - `Team passcode` | a passphrase of 6 or more characters (for example `still waters 23`)
  - `CCLI license` | your church's CCLI license number
- On the **Songs** tab, type `Copyright` as the header of column N. For copyrighted songs, put the © line there (for example `© 2001 Thankyou Music`).

**2. Add the script**
- In the sheet, open **Extensions › Apps Script**.
- Delete what's there, paste in all of `apps-script/Code.gs`, and click **Save**.
- If you're using your own copy of the sheet, change `SHEET_ID` near the top to your sheet's ID: the long code between `/d/` and `/edit` in its address.

**3. Deploy it**
- Click **Deploy › New deployment**, click the gear, and choose **Web app**.
- **Execute as:** Me. **Who has access:** Anyone.
- Click **Deploy**, then **Authorize access** and allow it. Google will warn that the app isn't verified; choose **Advanced › Go to project**. This is your own script.
- Copy the **Web app URL**. It ends in `/exec`.

If "Anyone" isn't offered, your Google Workspace administrator has turned it off. It can be switched back on in the Admin console under Apps › Google Workspace › Drive and Docs.

**4. Connect the page**
- Open `index.html`, find `const DEFAULT_API='';` near the top of the script, and paste the Web app URL between the quotes.
- Upload `index.html` to GitHub, replacing the old one.

**5. Lock down the sheet**
- In the sheet, click **Share**. Under *General access*, choose **Restricted**.
- Share the sheet as **Editor** only with the people who maintain songs and sets.

**6. Tell the band**
- Send the page link and the passcode in separate messages.
- To change the passcode, edit the Settings row. Everyone will be asked for the new one the next time they refresh.

**When you edit Code.gs later:** use Deploy › Manage deployments › Edit › Version: New version, so the same URL keeps working.

## Put the page online (GitHub Pages)

1. Create a repository (for example `songbook`) and upload these files.
2. Go to **Settings › Pages**. Under *Build and deployment*, choose **Deploy from a branch**, then **main** / **root**, and save.
3. After a minute, your page is at `https://YOUR-USERNAME.github.io/songbook/`.

The page's code is public, but it holds no songs. The songs only come from the script, after the passcode.

## For other churches

1. Copy the template sheet into your Google Drive and follow "Make it private" above.
2. Either put your Web app URL into `DEFAULT_API`, or open the shared page as `…/songbook/?api=YOUR_WEB_APP_URL`.

## Editing songs

- **Songs tab:** one row per song. *Key* is the key the chart is written in. *Chart* uses ChordPro: chords in square brackets before the syllable, as in `A[G]mazing [C]grace`. Lines such as `Verse 1` or `Chorus` become headings.
- **Team keys:** `Youth=A; Wednesday Night=C`
- **Scripture:** references separated by semicolons, as in `Isa 6:3; Rev 4:8-11`
- **Sets tab:** one row per song, in playing order. Rows with the same Date and Service make one set.
- The page's **For editors** tab has a chart helper that converts chords written above the lyrics to ChordPro. It also turns SongSelect or ChordPro files into rows you can paste into the Songs tab.

## Copyright

Copyrighted lyrics and charts need your church's CCLI license. CCLI allows sharing them with your worship team through a password-protected place, not on a public website; sharing charts this way may also need CCLI's Rehearsal option. Confirm with CCLI that a shared team passcode meets your license terms. Public-domain hymns need no license or notice.
