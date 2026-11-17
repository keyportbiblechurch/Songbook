# New Song: a private songbook for church music teams

A free, phone-friendly songbook for worship teams. Musicians open a link and type the team passcode. They don't need an account or an app.

**For musicians**
- **This Sunday**: opens on your team's next set, with a big "Start the set" button
- **Your part**: guitar (with capo shapes), keys, bass (bass notes highlighted), drums and vocals (lyrics, tempo, song order), and B♭, E♭ or F horns (chords already transposed)
- **Stage mode**: dark, large text, screen stays awake; swipe, arrow keys or a page-turner pedal move between songs
- Change key in one tap, Nashville numbers, tempo pulse and click, PDFs with CCLI notices, Scripture search
- Add to Home Screen; works without signal once opened; "Lock" clears it from a device

**For leaders** (with the editor passcode)
- **Add a song**: paste text copied from SongSelect (or a ChordPro file); title, key, CCLI number, writers, tempo and time fill in, with a live preview
- **Build a set**: pick the date and team, get song suggestions from the sermon text, drag to reorder, set keys and notes, see warnings for songs used in the last four weeks, then save and text the band
- Everything saves into the Google Sheet for you

All the content lives in **one private Google Sheet** that your worship leaders edit. A small Google Apps Script attached to the sheet hands the songs to the page **only after the right team passcode is entered**. The sheet itself is never public.

## Files

| File | What it is |
|---|---|
| `index.html` | The band page: one file, with no build step |
| `apps-script/Code.gs` | The passcode script that goes inside your Google Sheet |
| `songbook-template.xlsx` | A starter sheet with Songs, Sets, Settings and How to tabs |
| `manifest.webmanifest`, `icon-*.png`, `apple-touch-icon.png` | Let musicians add New Song to their home screen |
| `sw.js` | Keeps the page itself available without signal (it never stores songs) |
| `robots.txt`, `.nojekyll` | Keep search engines out; tell GitHub Pages to serve the files as they are |

## Make it private (one-time setup, about 15 minutes)

**1. Prepare the sheet**
- On the **Settings** tab, add three rows:
  - `Team passcode` | a passphrase for musicians, 6 or more characters (for example `still waters 23`)
  - `Editor passcode` | a different passphrase for leaders who add songs and build sets
  - `CCLI license` | your church's Church Copyright License number
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
- Send the page link and the team passcode in separate messages. Give the editor passcode only to leaders.
- To change a passcode, edit its Settings row. Everyone using it will be asked for the new one the next time they refresh.

**When Code.gs changes** (for example, when you install this version): paste the new code over the old, Save, then use **Deploy › Manage deployments**, click the pencil, choose **Version: New version**, and **Deploy**. The web app URL stays the same, so the page doesn't need changing.

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


## Adding songs from a photo

On **Add a song**, tap **Take a photo** (or **Choose photos** for several pages). The text is read on the phone itself; nothing is sent anywhere. Chords printed above the lyrics are placed on the right syllables. Always check the result before saving, since photos can misread a chord or word. Best for public-domain hymnals and your own charts; for copyrighted songs, use SongSelect downloads.
