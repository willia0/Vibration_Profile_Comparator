# Vibration Profile Comparator

Open `index.html` directly in a browser. No server or build step is required. Site has been deployed with Github Pages.

## Editing profiles

Edit the `PROFILE_DATA` array in `profiles.js`, then refresh the page.
This is a JavaScript data file: comments and trailing commas are allowed.
Add an object like this inside the array (separate objects with commas):

```js
{
  id: "my-standard-v1",
  standard: "My standard",
  level: "V1",
  points: [
    [10, 0.5],
    [100, 2],
    [2000, 0.5],
  ],
},
```

`id` must be unique. `standard` and `level` are required names. Profiles with
the same standard name are grouped automatically; no HTML changes are needed.
Each point is `[frequency in Hz, PSD in (m/s^2)^2/Hz]`. Use at least two
points, strictly increasing frequencies, and finite positive numeric values.
Convert values in g^2/Hz to (m/s^2)^2/Hz before entering them.

Optional fields:

| Field | Meaning | Default |
| --- | --- | --- |
| `color` | Six-digit hex color, e.g. `"#1769aa"` | Automatic palette |
| `rms` | Stated RMS acceleration in m/s^2, positive number | Not specified |
| `duration` | Hours per axis, positive number | Not specified |
| `source` | Source table or reference text | Empty |

Missing RMS is not calculated or assumed to be zero. Invalid entries are
skipped and reported above the selection list; other valid entries remain
available. JavaScript syntax errors prevent the data file from loading and
are reported as a missing data array. Keep the `const PROFILE_DATA = [...]`
wrapper intact.

The chart expands its log axes when selected data extends beyond the original
range. CSV and SVG exports include the selected profiles.

## Selection limits

At most 3 standards and 6 curves can be selected simultaneously. At a limit, unavailable checkboxes are disabled; selected curves can always be deselected.
Group selection keeps existing choices and adds profiles in file order until a limit is reached, with a message when some curves could not be added.
Clear removes all choices; reset restores the original four default IDs that still exist in the data file.

<!-- ## Verification

Run `node --test profile-data.test.cjs` for data validation and limit tests.
With Playwright and Microsoft Edge installed, run
`node browser-check.cjs <path-to-playwright-package>` for browser checks.
This writes desktop and mobile screenshots to `check-desktop.png` and
`check-mobile.png`. -->
