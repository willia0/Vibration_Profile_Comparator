"use strict";

// Edit this array to add standards or levels. See README.md for the field reference.
// Each standard has its own shade set: blue/cyan/green (low), yellow (middle),
// and orange/red (high). This preserves level semantics without merging curves
// from different standards into one indistinguishable color.
// points: [frequency in Hz, PSD in (m/s^2)^2/Hz], positive and ascending in frequency.
const PROFILE_DATA = [
  {
    id: "uscar-v1",
    standard: "USCAR-2 Rev 9",
    level: "V1",
    color: "#008C95",
    rms: 17.74,
    duration: 8,
    source: "Table 5.4.6.3C",
    points: [[5, 0.192], [12.5, 23.8], [77.5, 0.307], [145, 0.192], [200, 1.13], [230, 0.031], [1000, 0.002]]
  },
  {
    id: "uscar-v2",
    standard: "USCAR-2 Rev 9",
    level: "V2",
    color: "#55A630",

    rms: 119,
    duration: 8,
    source: "Table 5.4.6.3C",
    points: [[60, 0.096], [200, 144], [210, 9.6], [1200, 9.6]]
  },
  {
    id: "uscar-v3",
    standard: "USCAR-2 Rev 9",
    level: "V3",
    color: "#B39B18",
    rms: 181,
    duration: 22,
    source: "Table 5.4.6.3C",
    points: [[10, 10], [100, 10], [300, 0.51], [500, 20], [2000, 20]]
  },
  {
    id: "uscar-v4",
    standard: "USCAR-2 Rev 9",
    level: "V4",
    color: "#E09B2D",
    rms: 181,
    duration: 50,
    source: "Table 5.4.6.3C",
    points: [[10, 10], [100, 10], [300, 0.51], [500, 20], [2000, 20]]
  },
  {
    id: "uscar-v5",
    standard: "USCAR-2 Rev 9",
    level: "V5",

    color: "#D95D39",
    rms: 107.3,
    duration: 22,
    source: "Table 5.4.6.3C",
    points: [[20, 200], [40, 200], [300, 0.5], [800, 0.5], [1000, 3], [2000, 3]]
  },

  {
    id: "din-v1",
    standard: "DIN/TS 70214 August 2025",
    level: "V1",
    color: "#1769AA",
    rms: 27.8,
    duration: 8,
    source: "Table 48",
    points: [[10, 20], [55, 6.5], [180, 0.25], [300, 0.25], [360, 0.14], [1000, 0.14]]
  },
  {
    id: "din-v2",
    standard: "DIN/TS 70214 August 2025",
    level: "V2",
    color: "#19A6A3",
    rms: 27.8,
    duration: 20,
    source: "Table 51",
    points: [[10, 20], [55, 6.5], [180, 0.25], [300, 0.25], [360, 0.14], [1000, 0.14]]
  },
  {
    id: "din-v3",
    standard: "DIN/TS 70214 August 2025",
    level: "V3",
    color: "#3A9D5D",
    rms: 96.6,
    duration: 22,
    source: "Table 54",
    points: [[10, 10], [100, 10], [300, 0.51], [500, 5], [2000, 5]]
  },
  {
    id: "din-v4",
    standard: "DIN/TS 70214 August 2025",
    level: "V4",
    color: "#D1A719",
    rms: 181,
    duration: 22,
    source: "Table 57",
    points: [[10, 10], [100, 10], [300, 0.51], [500, 20], [2000, 20]]
  },
  // GMW3191 April 2025, Table 18. Random components only.
  // PSD copied from the SI column; RMS = table GRMS * 9.80665 m/s².
  {
    id: "gmw3191-v1a",
    standard: "GMW3191 April 2025",
    level: "V1a",
    color: "#4967A8",
    rms: 19.5152335,
    duration: 44,
    source: "GMW3191 April 2025, Table 18 (Random; GRMS = 1.99)",
    points: [[10, 9.9248], [55, 3.2313], [180, 0.125], [300, 0.125], [360, 0.0673], [1000, 0.0673]]
  },
  {
    id: "gmw3191-v1b",
    standard: "GMW3191 April 2025",
    level: "V1b",
    color: "#00A6A6",
    rms: 31.4793465,
    duration: 44,
    source: "GMW3191 April 2025, Table 18 (Random; GRMS = 3.21)",
    points: [[10, 1.9324], [20, 4.8085], [100, 4.8085], [800, 0.0962], [2000, 0.0962]]
  },
  {
    id: "gmw3191-v2",
    standard: "GMW3191 April 2025",
    level: "V2",
    color: "#579C51",
    rms: 180.638493,
    duration: 44,
    source: "GMW3191 April 2025, Table 18 (Random only; GRMS = 18.42)",
    points: [[10, 10], [100, 10], [300, 0.51], [500, 20], [2000, 20]]
  },
  {
    id: "gmw3191-v3",
    standard: "GMW3191 April 2025",
    level: "V3",
    color: "#C7A31A",
    rms: 106.892485,
    duration: 44,
    source: "GMW3191 April 2025, Table 18 (Random; GRMS = 10.9)",
    points: [[20, 200], [40, 200], [300, 0.5], [800, 0.5], [1000, 3], [2000, 3]]
  },
  {
    id: "gmw3191-v4",
    standard: "GMW3191 April 2025",
    level: "V4",
    color: "#DBA13A",
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
    color: "#E5752C",
    rms: 73.353742,
    duration: 31,
    source: "GMW3191 April 2025, Table 18 (Random; GRMS = 7.48)",
    points: [[12, 3.9815], [50, 2.0196], [130, 3.4237], [280, 9.3478], [450, 2.1542], [530, 4.6354], [780, 1.5291], [850, 4.0969], [1680, 1.2887], [2000, 0.7347]]
  },
  // VW 75174 Oct 2018 Table 9. Random components only.
  {
    id: "vw75174-s1",
    standard: "VW 75174 Oct 2018",
    level: "S1",
    color: "#3572B8",
    rms: 19.7,
    duration: 8,
    source: "VW 75174 Oct 2018, Table 9 (Random; RMS = 19.7)",
    points: [[10,10],[55,3.25],[180,0.125],[300,0.125],[360,0.07],[1000,0.07]]
  },
  {
    id: "vw75174-s2",
    standard: "VW 75174 Oct 2018",
    level: "S2",
    color: "#27A7A1",
    rms: 27.8,
    duration: 20,
    source: "VW 75174 Oct 2018, Table 9 (Random; RMS = 27.8)",
    points: [[10,20],[55,6.5],[180,0.25],[300,0.25],[360,0.14],[1000,0.14]]
  },
  {
    id: "vw75174-s3",
    standard: "VW 75174 Oct 2018",
    level: "S3",
    color: "#76A64F",
    rms: 105.5,
    duration: 22,
    source: "VW 75174 Oct 2018, Table 9 (Random; RMS = 105.5)",
    points: [[20,10],[95,10],[110,0.01],[380,0.01],[410,20],[800,10],[1500,5]]
  },
  {
    id: "vw75174-s4",
    standard: "VW 75174 Oct 2018",
    level: "S4",
    color: "#D5A52C",
    rms: 181,
    duration: 22,
    source: "VW 75174 Oct 2018, Table 9 (Random; RMS = 181)",
    points: [[10,10],[100,10],[300,0.51],[500,20],[2000,20]]
  },

  // Sine vibration schedules. points are [frequency in Hz, acceleration in m/s²].
  // Entries with available:false stay visible in the test-level list when the source
  // explicitly says that this test component is not specified.

  { id: "uscar-v1-sine", standard: "USCAR-2 Rev 9", level: "V1", mode: "sine", available: false, color: "#008C95", source: "USCAR-2 Rev 9, Table 5.4.6.3C: no sine component", points: [] },
  { id: "uscar-v2-sine", standard: "USCAR-2 Rev 9", level: "V2", mode: "sine", available: false, color: "#55A630", source: "USCAR-2 Rev 9, Table 5.4.6.3C: no sine component", points: [] },
  { 
    id: "uscar-v3-sine", standard: "USCAR-2 Rev 9", level: "V3", mode: "sine", color: "#B39B18", duration: 22,
    source: "USCAR-2 Rev 9, Table 5.4.6.3C", points: [[100, 100], [150, 150], [200, 200], [240, 200], [255, 150], [440, 150]] 
  },
  { id: "uscar-v4-sine", standard: "USCAR-2 Rev 9", level: "V4", mode: "sine", color: "#E09B2D", duration: 32, 
    source: "USCAR-2 Rev 9, Table 5.4.6.3C", points: [[100, 100], [150, 150], [200, 300], [240, 300], [270, 100], [440, 150]] 
  },
  { id: "uscar-v5-sine", standard: "USCAR-2 Rev 9", level: "V5", mode: "sine", available: false, color: "#D95D39", source: "USCAR-2 Rev 9, Table 5.4.6.3C: no sine component", points: [] },

  { id: "din-v1-sine", standard: "DIN/TS 70214 August 2025", level: "V1", mode: "sine", available: false, color: "#1769AA", source: "DIN/TS 70214, V1: no sine component", points: [] },
  { id: "din-v2-sine", standard: "DIN/TS 70214 August 2025", level: "V2", mode: "sine", available: false, color: "#19A6A3", source: "DIN/TS 70214, V2: no sine component", points: [] },
  {
    id: "din-v3-sine", standard: "DIN/TS 70214 August 2025", level: "V3", mode: "sine", color: "#3A9D5D", duration: 22,
    source: "DIN/TS 70214 August 2025, Table 55", points: [[100, 100], [150, 150], [440, 150]]
  },
  {
    id: "din-v4-sine", standard: "DIN/TS 70214 August 2025", level: "V4", mode: "sine", color: "#D1A719", duration: 22,
    source: "DIN/TS 70214 August 2025, Table 58", points: [[100, 100], [150, 150], [200, 200], [240, 200], [255, 150], [440, 150]]
  },
  {
    id: "din-v5-sine", standard: "DIN/TS 70214 August 2025", level: "V5", mode: "sine", color: "#F28C28", duration: 100,
    source: "DIN/TS 70214 August 2025, Table 60", points: [[100, 150], [200, 300], [400, 300], [900, 500], [2000, 500]]
  },
  {
    id: "din-v6-sine", standard: "DIN/TS 70214 August 2025", level: "V6", mode: "sine", color: "#D6452D", duration: 100,
    source: "DIN/TS 70214 August 2025, Table 62", points: [[100, 150], [200, 500], [400, 500], [900, 800], [2000, 800]]
  },

  { id: "gmw3191-v1a-sine", standard: "GMW3191 April 2025", level: "V1a", mode: "sine", available: false, color: "#4967A8", source: "GMW3191 April 2025, Table 18: no sine component", points: [] },
  { id: "gmw3191-v1b-sine", standard: "GMW3191 April 2025", level: "V1b", mode: "sine", available: false, color: "#00A6A6", source: "GMW3191 April 2025, Table 18: no sine component", points: [] },
  {
    id: "gmw3191-v2-sine", standard: "GMW3191 April 2025", level: "V2", mode: "sine", color: "#579C51", duration: 44,
    source: "GMW3191 April 2025, Table 18 (Sine)", points: [[100, 100], [150, 150], [200, 200], [240, 200], [270, 100], [440, 150]]
  },
  { id: "gmw3191-v3-sine", standard: "GMW3191 April 2025", level: "V3", mode: "sine", available: false, color: "#C7A31A", source: "GMW3191 April 2025, Table 18: no sine component", points: [] },
  {
    id: "gmw3191-v4-sine", standard: "GMW3191 April 2025", level: "V4", mode: "sine", color: "#DBA13A", duration: 44,
    source: "GMW3191 April 2025, Table 18 (Sine)", points: [[100, 100], [150, 150], [200, 300], [240, 300], [270, 100], [440, 150]]
  },
  { id: "gmw3191-v5-sine", standard: "GMW3191 April 2025", level: "V5", mode: "sine", available: false, color: "#E5752C", source: "GMW3191 April 2025, Table 18: no sine component", points: [] },
  {
    id: "gmw3191-v6-sine", standard: "GMW3191 April 2025", level: "V6", mode: "sine", color: "#C94B3F", duration: 100,
    source: "GMW3191 April 2025, Table 18 (Sine)", points: [[100, 50], [200, 300], [400, 300], [900, 500], [2000, 500]]
  },
  {
    id: "gmw3191-v7-sine", standard: "GMW3191 April 2025", level: "V7", mode: "sine", color: "#9E3047", duration: 100,
    source: "GMW3191 April 2025, Table 18 (Sine)", points: [[100, 150], [200, 500], [400, 500], [900, 800], [2000, 800]]
  },

  { id: "vw75174-s1-sine", standard: "VW 75174 Oct 2018", level: "S1", mode: "sine", available: false, color: "#3572B8", source: "VW 75174 Oct 2018, Table 9: no sine wave", points: [] },
  { id: "vw75174-s2-sine", standard: "VW 75174 Oct 2018", level: "S2", mode: "sine", available: false, color: "#27A7A1", source: "VW 75174 Oct 2018, Table 9: no sine wave", points: [] },
  {
    id: "vw75174-s3-sine", standard: "VW 75174 Oct 2018", level: "S3", mode: "sine", color: "#76A64F", duration: 22,
    source: "VW 75174 Oct 2018, Table 9 (sinusoidal)", points: [[200, 150], [220, 150], [221, 100], [400, 100]]
  },
  {
    id: "vw75174-s4-sine", standard: "VW 75174 Oct 2018", level: "S4", mode: "sine", color: "#D5A52C", duration: 22,
    source: "VW 75174 Oct 2018, Table 9 (sinusoidal)", points: [[100, 100], [150, 150], [200, 200], [240, 200], [255, 150], [440, 150]]
  },
  {
    id: "vw75174-s5-sine", standard: "VW 75174 Oct 2018", level: "S5", mode: "sine", color: "#EE8130", duration: 100,
    source: "VW 75174 Oct 2018, Table 9 (sinusoidal)", points: [[100, 150], [200, 300], [400, 300], [900, 500], [2000, 500]]
  },
  {
    id: "vw75174-s6-sine", standard: "VW 75174 Oct 2018", level: "S6", mode: "sine", color: "#C44045", duration: 100,
    source: "VW 75174 Oct 2018, Table 9 (sinusoidal)", points: [[100, 150], [200, 500], [400, 500], [900, 800], [2000, 800]]
  },

  // VW S5 and S6 explicitly contain no random noise profile.
  { id: "din-v5-random", standard: "DIN/TS 70214 August 2025", level: "V5", mode: "random", available: false, color: "#F28C28", source: "DIN/TS 70214 August 2025, V5: sine profile only", points: [] },
  { id: "din-v6-random", standard: "DIN/TS 70214 August 2025", level: "V6", mode: "random", available: false, color: "#D6452D", source: "DIN/TS 70214 August 2025, V6: sine profile only", points: [] },
  { id: "gmw3191-v6-random", standard: "GMW3191 April 2025", level: "V6", mode: "random", available: false, color: "#C94B3F", source: "GMW3191 April 2025, Table 18: no random component", points: [] },
  { id: "gmw3191-v7-random", standard: "GMW3191 April 2025", level: "V7", mode: "random", available: false, color: "#9E3047", source: "GMW3191 April 2025, Table 18: no random component", points: [] },
  { id: "vw75174-s5-random", standard: "VW 75174 Oct 2018", level: "S5", mode: "random", available: false, color: "#EE8130", source: "VW 75174 Oct 2018, Table 9: no noise", points: [] },
  { id: "vw75174-s6-random", standard: "VW 75174 Oct 2018", level: "S6", mode: "random", available: false, color: "#C44045", source: "VW 75174 Oct 2018, Table 9: no noise", points: [] },
];
