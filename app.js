"use strict";

const { profiles: allProfiles, errors: dataErrors } = validateProfiles(typeof PROFILE_DATA === "undefined" ? null : PROFILE_DATA);
const MAX_STANDARDS = 3;
const MAX_PROFILES = 6;
const DEFAULT_SELECTION = new Set(["din-v1", "uscar-v1", "gmw3191-v1a"]);
const DEFAULT_SINE_SELECTION = new Set(["din-v3-sine", "gmw3191-v2-sine", "vw75174-s4-sine"]);
let activeMode = "random";
let X_DOMAIN = [5, 2000];
let Y_DOMAIN = [0.001, 300];
const X_TICKS = [5, 10, 20, 50, 100, 200, 500, 1000, 2000];
const RANDOM_Y_TICKS = [0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10, 30, 100, 300];
const SINE_Y_TICKS = [1, 3, 10, 30, 100, 300, 1000];
const SVG_NS = "http://www.w3.org/2000/svg";

const selected = new Set();
const svg = document.querySelector("#profileChart");
const chartShell = document.querySelector("#chartShell");
const tooltip = document.querySelector("#chartTooltip");
let chartGeometry = null;

function modeOf(profile) { return profile.mode || "random"; }
function modeProfiles() { return allProfiles.filter((profile) => modeOf(profile) === activeMode); }
function selectableProfiles() { return modeProfiles().filter((profile) => profile.available !== false); }
function selectedProfiles() { return selectableProfiles().filter((profile) => selected.has(profile.id)); }
function profileLabel(profile) { return `${profile.standard} · ${profile.level}`; }
function formatNumber(value, maxDigits = 3) {
  if (value == null || !Number.isFinite(value)) return "—";
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (value >= 10) return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
  return value.toLocaleString("en-US", { maximumSignificantDigits: maxDigits });
}
function formatAxis(value) { return value >= 1000 ? `${value / 1000}k` : String(value); }
function createSvgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function renderOptions() {
  const visible = modeProfiles();
  document.querySelector("#totalProfiles").textContent = visible.length;
  const targets = new Map();
  const container = document.querySelector("#standardGroups");
  container.replaceChildren();
  for (const standard of new Set(visible.map((profile) => profile.standard))) {
    const section = document.createElement("section");
    section.className = "standard-group";
    section.innerHTML = `<div class="standard-heading"><h3>${escapeHtml(standard)}</h3><button class="group-toggle" type="button">全选</button></div><div class="profile-options"></div>`;
    const button = section.querySelector("button");
    button.dataset.groupToggle = standard;
    button.addEventListener("click", () => {
      const group = visible.filter((profile) => profile.standard === standard && profile.available !== false);
      const allSelected = group.length > 0 && group.every((profile) => selected.has(profile.id));
      setSelection(allSelected ? [...selected].filter((id) => !group.some((profile) => profile.id === id)) : [...selected, ...group.map((profile) => profile.id)]);
    });
    targets.set(standard, section.querySelector(".profile-options"));
    container.appendChild(section);
  }
  visible.forEach((profile) => {
    const unavailable = profile.available === false;
    const label = document.createElement("label");
    label.className = `profile-option${unavailable ? " is-unavailable" : ""}`;
    label.style.setProperty("--profile-color", profile.color);
    const detail = unavailable ? `${activeMode === "random" ? "此测试工况无随机分量" : "此测试工况无正弦分量"}${profile.source ? ` · ${profile.source}` : ""}` : activeMode === "random" ? `${profile.points.length} points · ${formatNumber(profile.rms)} m/s² RMS` : `${profile.points.length} points · ${profile.duration == null ? "duration not specified" : `${profile.duration} h/axis`}`;
    label.innerHTML = `<input type="checkbox" value="${escapeHtml(profile.id)}" ${selected.has(profile.id) ? "checked" : ""}${unavailable ? " disabled" : ""}><span class="option-body"><span class="option-check" aria-hidden="true"></span><span class="option-name"><strong>${escapeHtml(profile.level)}</strong><span>${escapeHtml(detail)}</span></span><span class="option-swatch" aria-hidden="true"></span></span>`;
    if (!unavailable) label.querySelector("input").addEventListener("change", (event) => setSelection(event.target.checked ? [...selected, profile.id] : [...selected].filter((id) => id !== profile.id)));
    else label.title = detail;
    targets.get(profile.standard).appendChild(label);
  });
}
function setSelection(ids) {
  const next = limitSelection(ids, selectableProfiles(), MAX_STANDARDS, MAX_PROFILES);
  selected.clear(); next.selected.forEach((id) => selected.add(id));
  document.querySelector("#selectionMessage").textContent = next.limited ? `最多同时选择 ${MAX_STANDARDS} 个标准、${MAX_PROFILES} 条曲线；超出的曲线未加入。` : "";
  document.querySelectorAll(".profile-option input").forEach((input) => { input.checked = selected.has(input.value); });
  renderAll();
}
function axisTicks(domain, defaults) {
  const ticks = new Set(defaults.filter((tick) => tick >= domain[0] && tick <= domain[1]));
  for (let exponent = Math.floor(Math.log10(domain[0])); exponent <= Math.ceil(Math.log10(domain[1])); exponent += 1) { const tick = 10 ** exponent; if (tick >= domain[0] && tick <= domain[1]) ticks.add(tick); }
  return [...ticks].sort((a, b) => a - b);
}
function logScale(domain, range) { const d0 = Math.log10(domain[0]); const d1 = Math.log10(domain[1]); return (value) => range[0] + ((Math.log10(value) - d0) / (d1 - d0)) * (range[1] - range[0]); }
function invertLogScale(domain, range, pixel) { const ratio = (pixel - range[0]) / (range[1] - range[0]); return 10 ** (Math.log10(domain[0]) + ratio * (Math.log10(domain[1]) - Math.log10(domain[0]))); }
function isMajorTick(value) { return Math.abs(value / (10 ** Math.floor(Math.log10(value))) - 1) < 0.001; }

function renderChart() {
  const points = selectedProfiles().flatMap((profile) => profile.points);
  X_DOMAIN = [5, 2000]; Y_DOMAIN = activeMode === "random" ? [0.001, 300] : [1, 1000];
  points.forEach(([frequency, value]) => { X_DOMAIN = [Math.min(X_DOMAIN[0], frequency), Math.max(X_DOMAIN[1], frequency)]; Y_DOMAIN = [Math.min(Y_DOMAIN[0], value), Math.max(Y_DOMAIN[1], value)]; });
  const width = Math.max(chartShell.clientWidth, 320); const height = Math.max(chartShell.clientHeight, 430); const mobile = width < 580;
  const margin = mobile ? { top: 24, right: 18, bottom: 68, left: 68 } : { top: 30, right: 30, bottom: 70, left: 86 };
  const plotWidth = width - margin.left - margin.right; const plotHeight = height - margin.top - margin.bottom; const x = logScale(X_DOMAIN, [margin.left, margin.left + plotWidth]); const y = logScale(Y_DOMAIN, [margin.top + plotHeight, margin.top]); const active = selectedProfiles();
  chartGeometry = { width, height, margin, plotWidth, plotHeight, x, y }; svg.setAttribute("viewBox", `0 0 ${width} ${height}`); svg.replaceChildren();
  const title = createSvgElement("title", { id: "chartTitle" }); title.textContent = activeMode === "random" ? "随机振动 PSD 对比图" : "正弦振动加速度对比图";
  const description = createSvgElement("desc", { id: "chartDesc" }); description.textContent = "频率与纵轴均使用对数刻度。"; svg.append(title, description);
  const defs = createSvgElement("defs"); const clipPath = createSvgElement("clipPath", { id: "plotClip" }); clipPath.appendChild(createSvgElement("rect", { x: margin.left, y: margin.top, width: plotWidth, height: plotHeight })); defs.appendChild(clipPath); svg.appendChild(defs);
  svg.appendChild(createSvgElement("rect", { class: "plot-background", x: margin.left, y: margin.top, width: plotWidth, height: plotHeight }));
  const grid = createSvgElement("g", { "aria-hidden": "true" });
  axisTicks(X_DOMAIN, X_TICKS).forEach((tick) => { const position = x(tick); grid.appendChild(createSvgElement("line", { class: `grid-line${isMajorTick(tick) ? " major" : ""}`, x1: position, y1: margin.top, x2: position, y2: margin.top + plotHeight })); const text = createSvgElement("text", { class: "tick-label", x: position, y: margin.top + plotHeight + 21, "text-anchor": "middle" }); text.textContent = formatAxis(tick); grid.appendChild(text); });
  axisTicks(Y_DOMAIN, activeMode === "random" ? RANDOM_Y_TICKS : SINE_Y_TICKS).forEach((tick) => { const position = y(tick); grid.appendChild(createSvgElement("line", { class: `grid-line${isMajorTick(tick) ? " major" : ""}`, x1: margin.left, y1: position, x2: margin.left + plotWidth, y2: position })); const text = createSvgElement("text", { class: "tick-label", x: margin.left - 11, y: position + 3.5, "text-anchor": "end" }); text.textContent = formatAxis(tick); grid.appendChild(text); });
  svg.appendChild(grid); svg.appendChild(createSvgElement("line", { class: "axis-domain", x1: margin.left, y1: margin.top + plotHeight, x2: margin.left + plotWidth, y2: margin.top + plotHeight })); svg.appendChild(createSvgElement("line", { class: "axis-domain", x1: margin.left, y1: margin.top, x2: margin.left, y2: margin.top + plotHeight }));
  const xLabel = createSvgElement("text", { class: "axis-label", x: margin.left + plotWidth / 2, y: height - 19, "text-anchor": "middle" }); xLabel.textContent = "Frequency (Hz)"; svg.appendChild(xLabel);
  const yLabel = createSvgElement("text", { class: "axis-label", x: 18, y: margin.top + plotHeight / 2, transform: `rotate(-90 18 ${margin.top + plotHeight / 2})`, "text-anchor": "middle" }); yLabel.textContent = activeMode === "random" ? "PSD ((m/s²)²/Hz)" : "Acceleration (m/s²)"; svg.appendChild(yLabel);
  const lineGroup = createSvgElement("g", { "clip-path": "url(#plotClip)" });
  active.forEach((profile) => { const pathData = profile.points.map(([frequency, value], index) => `${index === 0 ? "M" : "L"} ${x(frequency)} ${y(value)}`).join(" "); lineGroup.appendChild(createSvgElement("path", { class: "profile-path", d: pathData, stroke: profile.color, "stroke-dasharray": profile.standard === "USCAR-2" ? "8 4" : "none" })); profile.points.forEach(([frequency, value]) => lineGroup.appendChild(createSvgElement("circle", { class: "profile-point", cx: x(frequency), cy: y(value), r: mobile ? 3.2 : 3.5, fill: profile.color }))); });
  svg.appendChild(lineGroup); const hoverGroup = createSvgElement("g", { id: "hoverLayer", "clip-path": "url(#plotClip)" }); hoverGroup.style.display = "none"; hoverGroup.appendChild(createSvgElement("line", { class: "hover-line", id: "hoverLine", y1: margin.top, y2: margin.top + plotHeight })); svg.appendChild(hoverGroup);
  const interaction = createSvgElement("rect", { x: margin.left, y: margin.top, width: plotWidth, height: plotHeight, fill: "transparent", tabindex: "0", "aria-label": "图表数据检查区域" }); interaction.addEventListener("pointermove", handlePointerMove); interaction.addEventListener("pointerleave", hideTooltip); interaction.addEventListener("focus", () => showAtFrequency(100)); interaction.addEventListener("blur", hideTooltip); interaction.addEventListener("keydown", handleChartKeydown); svg.appendChild(interaction);
  document.querySelector("#emptyState").hidden = active.length > 0;
}
function interpolateValue(profile, frequency) { const points = profile.points; if (frequency < points[0][0] || frequency > points[points.length - 1][0]) return null; for (let index = 0; index < points.length - 1; index += 1) { const [f1, p1] = points[index]; const [f2, p2] = points[index + 1]; if (frequency >= f1 && frequency <= f2) { const ratio = (Math.log10(frequency) - Math.log10(f1)) / (Math.log10(f2) - Math.log10(f1)); return 10 ** (Math.log10(p1) + ratio * (Math.log10(p2) - Math.log10(p1))); } } return points[points.length - 1][1]; }
function handlePointerMove(event) { if (!chartGeometry || selectedProfiles().length === 0) return; const bounds = svg.getBoundingClientRect(); const svgX = ((event.clientX - bounds.left) / bounds.width) * chartGeometry.width; const left = chartGeometry.margin.left; const right = left + chartGeometry.plotWidth; showAtFrequency(invertLogScale(X_DOMAIN, [left, right], Math.max(left, Math.min(right, svgX)))); }
function handleChartKeydown(event) { if (!chartGeometry || selectedProfiles().length === 0 || !["ArrowLeft", "ArrowRight"].includes(event.key)) return; event.preventDefault(); const current = Number(svg.dataset.keyboardFrequency || 100); showAtFrequency(Math.max(X_DOMAIN[0], Math.min(X_DOMAIN[1], current * (event.key === "ArrowRight" ? 1.2 : 1 / 1.2)))); }
function showAtFrequency(frequency) { const values = selectedProfiles().map((profile) => ({ profile, value: interpolateValue(profile, frequency) })).filter((entry) => entry.value !== null); if (!values.length) { hideTooltip(); return; } svg.dataset.keyboardFrequency = String(frequency); const { x, y, margin } = chartGeometry; const xPosition = x(frequency); const hoverGroup = svg.querySelector("#hoverLayer"); const hoverLine = svg.querySelector("#hoverLine"); hoverGroup.style.display = "block"; hoverLine.setAttribute("x1", xPosition); hoverLine.setAttribute("x2", xPosition); hoverGroup.querySelectorAll(".hover-dot").forEach((dot) => dot.remove()); values.forEach(({ profile, value }) => hoverGroup.appendChild(createSvgElement("circle", { class: "hover-dot", cx: xPosition, cy: y(value), r: 4, stroke: profile.color }))); tooltip.innerHTML = `<div class="tooltip-frequency">${formatNumber(frequency, 4)} Hz</div>${values.map(({ profile, value }) => `<div class="tooltip-row"><span class="tooltip-dot" style="background:${profile.color}"></span><span>${escapeHtml(profile.standard)} ${escapeHtml(profile.level)}</span><span class="tooltip-value">${formatNumber(value, 4)}</span></div>`).join("")}`; tooltip.hidden = false; const shellWidth = chartShell.clientWidth; const tooltipWidth = Math.min(245, shellWidth - 24); const scaledX = (xPosition / chartGeometry.width) * shellWidth; let left = scaledX < shellWidth * 0.66 ? scaledX + 13 : scaledX - tooltipWidth - 13; tooltip.style.left = `${Math.max(12, Math.min(shellWidth - tooltipWidth - 12, left))}px`; tooltip.style.top = `${Math.max(12, margin.top)}px`; }
function hideTooltip() { tooltip.hidden = true; const hoverGroup = svg.querySelector("#hoverLayer"); if (hoverGroup) hoverGroup.style.display = "none"; }
function renderSummary() { const active = selectedProfiles(); document.querySelector("#selectedCount").textContent = active.length; document.querySelector("#metricProfiles").textContent = active.length; document.querySelector("#metricYLabel").textContent = activeMode === "random" ? "PSD 范围" : "Acceleration 范围"; document.querySelector("#chartModeKicker").textContent = activeMode === "random" ? "SPECTRAL DENSITY" : "SINE VIBRATION"; document.querySelector("#chartModeHeading").textContent = activeMode === "random" ? "Vibration Noise Intensity Profile" : "Sine Vibration Profile"; document.querySelector("#peakColumnHeading").textContent = activeMode === "random" ? "峰值 PSD" : "峰值加速度"; if (!active.length) { document.querySelector("#metricRange").textContent = "—"; document.querySelector("#metricPsd").textContent = "—"; return; } const points = active.flatMap((profile) => profile.points); const frequencies = points.map(([frequency]) => frequency); const values = points.map(([, value]) => value); document.querySelector("#metricRange").textContent = `${formatNumber(Math.min(...frequencies))} — ${formatNumber(Math.max(...frequencies))} Hz`; document.querySelector("#metricPsd").textContent = `${formatNumber(Math.min(...values))} — ${formatNumber(Math.max(...values))}`; }
function renderLegend() { const active = selectedProfiles(); document.querySelector("#chartLegend").innerHTML = active.length ? active.map((profile) => `<span class="legend-item"><span class="legend-line${profile.standard === "USCAR-2" ? " is-dashed" : ""}" style="--legend-color:${profile.color}"></span>${escapeHtml(profileLabel(profile))}</span>`).join("") : '<span class="legend-item">无已选曲线</span>'; }
function renderTable() { const body = document.querySelector("#profileTableBody"); const active = selectedProfiles(); if (!active.length) { body.innerHTML = '<tr class="empty-row"><td colspan="7">选择 Profile 后显示参数</td></tr>'; return; } body.innerHTML = active.map((profile) => { const frequencies = profile.points.map(([frequency]) => frequency); const peak = Math.max(...profile.points.map(([, value]) => value)); return `<tr><td>${escapeHtml(profile.standard)}</td><td><span class="table-profile"><span class="table-swatch" style="--table-color:${profile.color}"></span>${escapeHtml(profile.level)}</span></td><td>${formatNumber(frequencies[0])} — ${formatNumber(frequencies[frequencies.length - 1])} Hz</td><td>${formatNumber(peak, 4)}</td><td>${activeMode === "random" ? `${formatNumber(profile.rms, 4)} m/s²` : "—"}</td><td>${profile.duration == null ? "标准章节未注明" : `${profile.duration} h`}</td><td>${profile.points.length}</td></tr>`; }).join(""); }
function updateGroupButtons() { const standards = new Set(selectedProfiles().map((profile) => profile.standard)); document.querySelector("#selectedStandards").textContent = standards.size; document.querySelectorAll(".profile-option input").forEach((input) => { const profile = modeProfiles().find((item) => item.id === input.value); if (!profile) return; const disabled = profile.available === false || (!selected.has(input.value) && (selected.size >= MAX_PROFILES || (!standards.has(profile.standard) && standards.size >= MAX_STANDARDS))); input.disabled = disabled; input.closest("label").title = profile.available === false ? (profile.source || `No ${activeMode} component`) : (disabled ? "Selection limit reached" : ""); }); document.querySelectorAll("[data-group-toggle]").forEach((button) => { const group = modeProfiles().filter((profile) => profile.standard === button.dataset.groupToggle && profile.available !== false); button.textContent = group.length && group.every((profile) => selected.has(profile.id)) ? "取消全选" : "全选"; }); }
function renderAll() { hideTooltip(); renderChart(); renderSummary(); renderLegend(); renderTable(); updateGroupButtons(); }
function downloadBlob(content, type, filename) { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url); }
function exportCsv() { const header = ["standard", "level", "frequency_hz", activeMode === "random" ? "psd_m2_s4_per_hz" : "acceleration_m_s2", "stated_rms_m_s2", "duration_per_axis_h", "source"]; const rows = selectedProfiles().flatMap((profile) => profile.points.map(([frequency, value]) => [profile.standard, profile.level, frequency, value, profile.rms ?? "", profile.duration ?? "", profile.source])); const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n"); downloadBlob(`\uFEFF${csv}`, "text/csv;charset=utf-8", activeMode === "random" ? "vibration-profiles.csv" : "sine-vibration-profiles.csv"); }
function exportSvg() { const clone = svg.cloneNode(true); clone.querySelector("#hoverLayer")?.remove(); clone.querySelector("rect[tabindex]")?.remove(); const styleText = Array.from(document.styleSheets).flatMap((sheet) => { try { return Array.from(sheet.cssRules); } catch { return []; } }).filter((rule) => [".grid-line", ".axis-domain", ".tick-label", ".axis-label", ".profile-path", ".profile-point", ".plot-background"].some((selector) => rule.selectorText?.includes(selector))).map((rule) => rule.cssText).join("\n"); const style = createSvgElement("style"); style.textContent = styleText; clone.insertBefore(style, clone.firstChild); clone.setAttribute("xmlns", SVG_NS); clone.setAttribute("width", chartGeometry.width); clone.setAttribute("height", chartGeometry.height); downloadBlob(new XMLSerializer().serializeToString(clone), "image/svg+xml;charset=utf-8", activeMode === "random" ? "vibration-profile-comparison.svg" : "sine-vibration-profile-comparison.svg"); }
function switchMode(mode) { activeMode = mode; selected.clear(); document.querySelectorAll("[data-mode-tab]").forEach((tab) => { const active = tab.dataset.modeTab === activeMode; tab.classList.toggle("is-active", active); tab.setAttribute("aria-selected", String(active)); }); renderOptions(); setSelection(activeMode === "random" ? [...DEFAULT_SELECTION] : [...DEFAULT_SINE_SELECTION]); }

document.querySelector("#resetSelection").addEventListener("click", () => setSelection(activeMode === "random" ? [...DEFAULT_SELECTION] : [...DEFAULT_SINE_SELECTION]));
document.querySelector("#clearSelection").addEventListener("click", () => setSelection([])); document.querySelector("#exportCsv").addEventListener("click", exportCsv); document.querySelector("#exportSvg").addEventListener("click", exportSvg); document.querySelectorAll("[data-mode-tab]").forEach((tab) => tab.addEventListener("click", () => switchMode(tab.dataset.modeTab)));
const resizeObserver = new ResizeObserver(() => renderChart()); resizeObserver.observe(chartShell);
renderOptions(); document.querySelector("#dataErrors").textContent = dataErrors.join("\n"); document.querySelector("#dataErrors").hidden = dataErrors.length === 0; setSelection([...DEFAULT_SELECTION]);
