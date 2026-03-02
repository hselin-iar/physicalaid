/* ========================================
   PhysicalAid — Smart Reminder Engine
   ======================================== */

import { getCurrentUser } from './firebase.js';
import { getSettings, getTodayPlan, getStreakData, getUserProfile, getToday } from './storage.js';

let reminderIntervalId = null;

function formatLocalDateKey(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${y}-${m}-${d}`;
}

function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatLocalDateKey(d);
}

function scopedKey(key) {
  const uid = getCurrentUser()?.uid || 'anon';
  return `pa_reminder_${uid}_${key}`;
}

function getGoalHint(goalFocus = 'posture') {
  if (goalFocus === 'mobility') return 'Mobility focus today: finish at least one reset + one guide.';
  if (goalFocus === 'strength') return 'Strength focus today: complete your gym session and one mobility block.';
  return 'Posture focus today: prioritize all 3 daily reset blocks.';
}

function maybeSendBrowserNotification(message) {
  if (!('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    new Notification(message.title, {
      body: message.body,
      tag: `physicalaid-${message.kind}`
    });
    return true;
  } catch (error) {
    console.error('Failed to send browser notification:', error);
    return false;
  }
}

export function getBrowserNotificationStatus() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function requestReminderPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.requestPermission();
}

export async function getSmartReminderInsights() {
  const [settings, plan, streak, profile] = await Promise.all([
    getSettings(),
    getTodayPlan(),
    getStreakData(),
    getUserProfile()
  ]);

  if (!settings.reminderEnabled) {
    return { enabled: false, messages: [], plan, settings };
  }

  const nowHour = new Date().getHours();
  const reminderHour = Number(settings.reminderHour || 20);
  const today = getToday();
  const yesterday = getYesterdayKey();
  const messages = [];

  if (plan.remaining.length > 0 && nowHour >= reminderHour) {
    messages.push({
      kind: 'daily',
      severity: 'normal',
      title: 'Daily plan is still open',
      body: `${plan.remaining.length} tasks left. ${getGoalHint(profile?.goalFocus)}`
    });
  }

  const lastActive = String(streak.lastActiveDate || '');
  if (lastActive && lastActive !== today && lastActive !== yesterday && plan.doneCount === 0) {
    messages.push({
      kind: 'missed',
      severity: 'high',
      title: 'Streak recovery nudge',
      body: 'Yesterday was missed. Complete one quick routine now to restart momentum.'
    });
  }

  return { enabled: true, messages, plan, settings };
}

export async function dispatchSmartReminderNotifications() {
  const insights = await getSmartReminderInsights();
  if (!insights.enabled || insights.messages.length === 0) return [];

  const sent = [];
  const today = getToday();

  insights.messages.forEach((message) => {
    const key = scopedKey(`${message.kind}_date`);
    const lastSentDate = localStorage.getItem(key);
    if (lastSentDate === today) return;

    const notified = maybeSendBrowserNotification(message);
    if (notified) {
      localStorage.setItem(key, today);
      sent.push(message);
    }
  });

  return sent;
}

export async function runSmartReminderCheck() {
  try {
    await dispatchSmartReminderNotifications();
  } catch (error) {
    console.error('Smart reminder check failed:', error);
  }
}

export function startReminderLoop() {
  stopReminderLoop();
  runSmartReminderCheck();
  reminderIntervalId = window.setInterval(runSmartReminderCheck, 15 * 60 * 1000);
}

export function stopReminderLoop() {
  if (reminderIntervalId) {
    clearInterval(reminderIntervalId);
    reminderIntervalId = null;
  }
}
