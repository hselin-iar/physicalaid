/* ========================================
   PhysicalAid — Heatmap Component (shared)
   ======================================== */

/**
 * Build an activity heatmap grid.
 * @param {Object} dailyLog – date->count map
 * @param {number} weeks – number of weeks to show (default 12)
 * @returns {string} HTML string of heatmap cells
 */
/**
 * Get processed heatmap data.
 * @param {Object} dailyLog
 * @param {number} weeks
 */
function getHeatmapData(dailyLog, weeks = 52) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  // Calculate end of the week (Sunday)
  // If today is Wed (3), we want to show up to today? 
  // GitHub usually shows up to today.
  // But the grid fills Top->Bottom (Mon->Sun). 
  // If today is Wed, the last column has Mon, Tue, Wed.
  // So we just need to ensure the start date is a Monday.

  // Total days to show = weeks * 7 (approx) 
  // Let's just go back 'weeks' weeks from this week's Monday.
  const distToMon = (dayOfWeek + 6) % 7; // distance from Monday
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - distToMon);

  const startDate = new Date(thisMonday);
  startDate.setDate(startDate.getDate() - (weeks - 1) * 7);

  const data = [];
  // Loop until we reach today or the end of this week
  // Actually, simpler: generate exactly weeks * 7 days?
  // Or enough to fill the columns. 
  // Let's generate from startDate until today.

  let current = new Date(startDate);
  while (current <= today) {
    const dateStr = current.toISOString().split('T')[0];
    const count = dailyLog[dateStr] || 0;

    let level = '';
    if (count >= 5) level = 'level-4';
    else if (count >= 4) level = 'level-3';
    else if (count >= 2) level = 'level-2';
    else if (count >= 1) level = 'level-1';

    data.push({ date: dateStr, count, level });
    current.setDate(current.getDate() + 1);
  }
  return { data, startDate };
}

export function buildHeatmap(dailyLog, weeks = 52) {
  const { data } = getHeatmapData(dailyLog, weeks);
  return data.map(d =>
    `<div class="heatmap-cell ${d.level}" title="${d.date}: ${d.count} routines"></div>`
  ).join('');
}

export function renderHeatmapCard(dailyLog, weeks = 20) { // Default 20 for dashboard compact
  const { data, startDate } = getHeatmapData(dailyLog, weeks);

  // Generate Month Labels
  const months = [];
  let currentMonth = -1;
  // We scan the data week by week to place month labels
  for (let i = 0; i < data.length; i += 7) {
    const d = new Date(data[i].date);
    const m = d.getMonth();
    if (m !== currentMonth) {
      months.push({ name: d.toLocaleString('default', { month: 'short' }), index: Math.floor(i / 7) });
      currentMonth = m;
    }
  }

  // Calculate grid styles
  const cellsHtml = data.map(d =>
    `<div class="heatmap-cell ${d.level}" title="${d.date}: ${d.count} routines"></div>`
  ).join('');

  return `
    <div class="glass-card no-hover animate-in heatmap-card">
      <div class="heatmap-title mb-4">
        <span class="section-title" style="font-size: var(--fs-sm)">Review</span>
        <span class="text-muted" style="font-size: var(--fs-xs)">${data.length} days</span>
      </div>
      
      <div class="heatmap-container">
        <!-- Month Labels -->
        <div class="heatmap-months">
          ${months.map(m => `<span style="grid-column-start: ${m.index + 1}">${m.name}</span>`).join('')}
        </div>
        
        <div class="heatmap-body">
          <!-- Day Labels -->
          <div class="heatmap-days">
            <span>Mon</span>
            <span></span>
            <span>Wed</span>
            <span></span>
            <span>Fri</span>
            <span></span>
            <span></span>
          </div>
          
          <!-- Grid -->
          <div class="heatmap-grid">
            ${cellsHtml}
          </div>
        </div>
      
        <div class="heatmap-legend mt-2 justify-end">
          <span>Less</span>
          <div class="heatmap-cell"></div>
          <div class="heatmap-cell level-1"></div>
          <div class="heatmap-cell level-2"></div>
          <div class="heatmap-cell level-3"></div>
          <div class="heatmap-cell level-4"></div>
          <span>More</span>
        </div>
      </div>
    </div>
  `;
}
