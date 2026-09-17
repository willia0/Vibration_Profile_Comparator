# Vibration Profile Comparator

## GMW3191 April 2025 数据说明

已从 `Table_18_Vibration_Schedules_editable.xlsx` 的 `Vibration Schedules`
工作表录入 Table 18 的 Random 数据：V1a、V1b、V2、V3、V4、V5，共 6 条曲线、37 个频点。
V1 保留 a/b 两个子等级。PSD 直接采用 SI 列 `(m/s²)²/Hz`，不从 G²/Hz 列重复换算。
RMS 采用表中 GRMS × 9.80665 换算为 m/s²；表中未提供测试时长，保留为未注明。

V4 在 300 Hz 的 SI PSD 为 0.51，但 G²/Hz 列为 0.109，工作簿已标记此差异。
本项目保留 SI 列的 0.51，并在该曲线的 source 中记录差异，随 CSV 导出。
V2、V4 的正弦分量不属于这些随机 PSD 曲线；V6、V7 没有随机分量，未录入。
由于最多同时显示 5 条曲线，GMW 组全选会按数据顺序选入前 5 条；取消其中一条后可选择 V5。

Open `index.html` directly in a browser. No server or build step is required.

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

At most 3 standards and 5 curves can be selected simultaneously. At a limit,
unavailable checkboxes are disabled; selected curves can always be deselected.
Group selection keeps existing choices and adds profiles in file order until
a limit is reached, with a message when some curves could not be added.
Clear removes all choices; reset restores the original four default IDs that
still exist in the data file.

## Verification

Run `node --test profile-data.test.cjs` for data validation and limit tests.
With Playwright and Microsoft Edge installed, run
`node browser-check.cjs <path-to-playwright-package>` for browser checks.
This writes desktop and mobile screenshots to `check-desktop.png` and
`check-mobile.png`.

DIN/TS 70214 V5 and V6 specify sinusoidal acceleration only and are not
included as random PSD profiles.
