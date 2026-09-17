"use strict";

// Edit this array to add standards or levels. See README.md for the field reference.
// points: [frequency in Hz, PSD in (m/s^2)^2/Hz], positive and ascending in frequency.
const PROFILE_DATA = [
  {
    id: "din-v1",
    standard: "DIN/TS 70214",
    level: "V1",
    color: "#087f75",
    rms: 27.8,
    duration: 8,
    source: "Table 48",
    points: [[10, 20], [55, 6.5], [180, 0.25], [300, 0.25], [360, 0.14], [1000, 0.14]]
  },
  {
    id: "din-v2",
    standard: "DIN/TS 70214",
    level: "V2",
    color: "#23a69a",
    rms: 27.8,
    duration: 20,
    source: "Table 51",
    points: [[10, 20], [55, 6.5], [180, 0.25], [300, 0.25], [360, 0.14], [1000, 0.14]]
  },
  {
    id: "din-v3",
    standard: "DIN/TS 70214",
    level: "V3",
    color: "#1769aa",
    rms: 96.6,
    duration: 22,
    source: "Table 54",
    points: [[10, 10], [100, 10], [300, 0.51], [500, 5], [2000, 5]]
  },
  {
    id: "din-v4",
    standard: "DIN/TS 70214",
    level: "V4",
    color: "#654ea3",
    rms: 181,
    duration: 22,
    source: "Table 57",
    points: [[10, 10], [100, 10], [300, 0.51], [500, 20], [2000, 20]]
  },
  {
    id: "uscar-v1",
    standard: "USCAR-2",
    level: "V1",
    color: "#d24b35",
    rms: 17.74,
    duration: 8,
    source: "Table 5.4.6.3C",
    points: [[5, 0.192], [12.5, 23.8], [77.5, 0.307], [145, 0.192], [200, 1.13], [230, 0.031], [1000, 0.002]]
  },
  {
    id: "uscar-v2",
    standard: "USCAR-2",
    level: "V2",
    color: "#ef7b45",
    rms: 119,
    duration: 8,
    source: "Table 5.4.6.3C",
    points: [[60, 0.096], [200, 144], [210, 9.6], [1200, 9.6]]
  },
  {
    id: "uscar-v3",
    standard: "USCAR-2",
    level: "V3",
    color: "#be8a00",
    rms: 181,
    duration: 22,
    source: "Table 5.4.6.3C",
    points: [[10, 10], [100, 10], [300, 0.51], [500, 20], [2000, 20]]
  },
  {
    id: "uscar-v4",
    standard: "USCAR-2",
    level: "V4",
    color: "#70842c",
    rms: 181,
    duration: 50,
    source: "Table 5.4.6.3C",
    points: [[10, 10], [100, 10], [300, 0.51], [500, 20], [2000, 20]]
  },
  {
    id: "uscar-v5",
    standard: "USCAR-2",
    level: "V5",
    color: "#8c4c72",
    rms: 107.3,
    duration: 22,
    source: "Table 5.4.6.3C",
    points: [[20, 200], [40, 200], [300, 0.5], [800, 0.5], [1000, 3], [2000, 3]]
  },
  // GMW3191 April 2025, Table 18. Random components only.
  // PSD copied from the SI column; RMS = table GRMS * 9.80665 m/s².
  {
    id: "gmw3191-v1a",
    standard: "GMW3191 April 2025",
    level: "V1a",
    color: "#26734d",
    rms: 19.5152335,
    duration: 44,
    source: "GMW3191 April 2025, Table 18 (Random; GRMS = 1.99)",
    points: [[10, 9.9248], [55, 3.2313], [180, 0.125], [300, 0.125], [360, 0.0673], [1000, 0.0673]]
  },
  {
    id: "gmw3191-v1b",
    standard: "GMW3191 April 2025",
    level: "V1b",
    color: "#397db5",
    rms: 31.4793465,
    duration: 44,
    source: "GMW3191 April 2025, Table 18 (Random; GRMS = 3.21)",
    points: [[10, 1.9324], [20, 4.8085], [100, 4.8085], [800, 0.0962], [2000, 0.0962]]
  },
  {
    id: "gmw3191-v2",
    standard: "GMW3191 April 2025",
    level: "V2",
    color: "#a8437e",
    rms: 180.638493,
    duration: 44,
    source: "GMW3191 April 2025, Table 18 (Random only; GRMS = 18.42)",
    points: [[10, 10], [100, 10], [300, 0.51], [500, 20], [2000, 20]]
  },
  {
    id: "gmw3191-v3",
    standard: "GMW3191 April 2025",
    level: "V3",
    color: "#b36b16",
    rms: 106.892485,
    duration: 44,
    source: "GMW3191 April 2025, Table 18 (Random; GRMS = 10.9)",
    points: [[20, 200], [40, 200], [300, 0.5], [800, 0.5], [1000, 3], [2000, 3]]
  },
  {
    id: "gmw3191-v4",
    standard: "GMW3191 April 2025",
    level: "V4",
    color: "#6657bd",
    rms: 180.638493,
    duration: 44,
    source: "GMW3191 April 2025, Table 18 (Random only; GRMS = 18.42; 300 Hz uses SI PSD = 0.51; G²/Hz column inconsistent)",
    // Workbook flags 0.109 G²/Hz at 300 Hz; retain the SI column value 0.51.
    points: [[10, 10], [100, 10], [300, 0.51], [500, 20], [2000, 20]]
  },
  {
    id: "gmw3191-v5",
    standard: "GMW3191 April 2025",
    level: "V5",
    color: "#008696",
    rms: 73.353742,
    duration: 31,
    source: "GMW3191 April 2025, Table 18 (Random; GRMS = 7.48)",
    points: [[12, 3.9815], [50, 2.0196], [130, 3.4237], [280, 9.3478], [450, 2.1542], [530, 4.6354], [780, 1.5291], [850, 4.0969], [1680, 1.2887], [2000, 0.7347]]
  }
];
