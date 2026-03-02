/* ========================================
   PhysicalAid — Shared Today Plan Card
   ======================================== */

import { navigate } from '../router.js';

export function renderTodayPlanCard(plan, options = {}) {
  if (!plan) return '';

  const title = options.title || 'Today Plan';
  const reminders = Array.isArray(options.reminders) ? options.reminders : [];
  const nextTask = plan.remaining?.[0] || null;

  return `
    <div class="today-plan-card animate-in">
      <div class="today-plan-head">
        <div>
          <div class="flow-label" style="margin-bottom: 0.35rem;">${title}</div>
          <div class="today-plan-progress">${plan.doneCount}/${plan.total} complete · ${plan.percent}%</div>
        </div>
      </div>

      <div class="today-plan-progress-track">
        <div class="today-plan-progress-fill" style="width: ${plan.percent}%"></div>
      </div>

      ${nextTask ? `
        <div class="today-plan-next-action">
          <button class="btn-start-glass" data-plan-path="${nextTask.path}" style="width: 100%;">
            ▶ Next Best Task: ${nextTask.label}
          </button>
        </div>
      ` : `
        <div class="today-plan-next-action text-muted" style="font-size: 0.74rem;">
          All tasks done for today. Keep recovery and sleep quality high.
        </div>
      `}

      ${reminders.length > 0 ? `
        <div class="today-plan-reminders">
          ${reminders.map((item) => `
            <div class="today-plan-reminder ${item.severity === 'high' ? 'high' : ''}">
              <div style="font-size: 0.78rem; font-weight: 700; color: #fff;">${item.title}</div>
              <div class="text-muted" style="font-size: 0.72rem; margin-top: 2px;">${item.body}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="today-plan-list">
        ${plan.tasks.map(task => `
          <button class="today-plan-item" data-plan-path="${task.path}">
            <div class="today-plan-item-left">
              <span class="today-plan-check ${task.done ? 'done' : ''}">${task.done ? '✓' : ''}</span>
              <div>
                <div class="today-plan-item-title">${task.label}</div>
                <div class="text-muted" style="font-size: 0.7rem;">
                  ${task.done ? `Completed${task.completedAt ? ` · ${new Date(task.completedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : ''}` : 'Pending'}
                </div>
              </div>
            </div>
            <span class="today-plan-open">Open</span>
          </button>
        `).join('')}
      </div>

      ${plan.timeline.length > 0 ? `
        <div class="today-plan-timeline">
          ${plan.timeline.map(item => `
            <div class="today-plan-timeline-item">
              <span>${item.time}</span>
              <span>${item.label}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

export function bindTodayPlanActions(container) {
  container.querySelectorAll('[data-plan-path]').forEach((button) => {
    button.addEventListener('click', () => {
      const path = button.dataset.planPath;
      if (path) navigate(path);
    });
  });
}
