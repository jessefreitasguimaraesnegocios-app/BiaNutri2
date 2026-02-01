import { WaterEntry } from '../types';

export interface WaterReminderConfig {
  enabled: boolean;
  interval: number; // minutes
  startTime?: number; // hour (0-23)
  endTime?: number; // hour (0-23)
}

// Calculate daily water goal based on weight and activity level
export const calculateWaterGoal = (
  weight: number, // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number => {
  // Base: 35ml per kg of body weight
  let baseWater = weight * 35;
  
  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.0,
    light: 1.1,
    moderate: 1.2,
    active: 1.3,
    very_active: 1.4
  };
  
  const multiplier = activityMultipliers[activityLevel];
  const goal = Math.round(baseWater * multiplier);
  
  // Round to nearest 100ml for cleaner numbers
  return Math.round(goal / 100) * 100;
};

// Get today's water entries
export const getTodayWaterEntries = (entries: WaterEntry[]): WaterEntry[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  
  return entries.filter(entry => entry.timestamp >= todayStart);
};

// Calculate today's total water consumed
export const getTodayWaterTotal = (entries: WaterEntry[]): number => {
  const todayEntries = getTodayWaterEntries(entries);
  return todayEntries.reduce((sum, entry) => sum + entry.amount, 0);
};

// Request browser notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// Show water reminder notification
export const showWaterNotification = (
  title: string,
  body: string,
  lang: 'en' | 'pt'
): void => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  
  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'water-reminder',
    requireInteraction: false,
    silent: false
  });
  
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
  
  // Auto close after 5 seconds
  setTimeout(() => {
    notification.close();
  }, 5000);
};

// Schedule water reminders
export const scheduleWaterReminders = (
  config: WaterReminderConfig,
  onReminder: () => void,
  lang: 'en' | 'pt'
): (() => void) => {
  if (!config.enabled) {
    return () => {}; // No-op cleanup
  }
  
  let intervalId: number | null = null;
  let lastReminderTime = Date.now();
  
  const checkAndRemind = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Check if within reminder hours
    if (config.startTime !== undefined && currentHour < config.startTime) {
      return;
    }
    if (config.endTime !== undefined && currentHour >= config.endTime) {
      return;
    }
    
    // Check if enough time has passed since last reminder
    const timeSinceLastReminder = Date.now() - lastReminderTime;
    const intervalMs = config.interval * 60 * 1000;
    
    if (timeSinceLastReminder >= intervalMs) {
      lastReminderTime = Date.now();
      onReminder();
    }
  };
  
  // Check every minute
  intervalId = window.setInterval(checkAndRemind, 60000);
  
  // Return cleanup function
  return () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
  };
};

// Get water status color based on percentage
export const getWaterStatusColor = (percentage: number): string => {
  if (percentage >= 100) return 'bg-green-500';
  if (percentage >= 75) return 'bg-brand-500';
  if (percentage >= 50) return 'bg-yellow-500';
  if (percentage >= 25) return 'bg-orange-500';
  return 'bg-red-500';
};

// Get water status message
export const getWaterStatusMessage = (percentage: number, lang: 'en' | 'pt'): string => {
  if (percentage >= 100) {
    return lang === 'pt' ? 'Excelente hidratação!' : 'Excellent hydration!';
  }
  if (percentage >= 75) {
    return lang === 'pt' ? 'Bem hidratado!' : 'Well hydrated!';
  }
  if (percentage >= 50) {
    return lang === 'pt' ? 'Continue bebendo água' : 'Keep drinking water';
  }
  if (percentage >= 25) {
    return lang === 'pt' ? 'Hidratação baixa' : 'Low hydration';
  }
  return lang === 'pt' ? 'Beba água urgentemente!' : 'Drink water urgently!';
};

