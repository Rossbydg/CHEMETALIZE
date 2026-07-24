export interface NotificationSetting {
  key: string;
  label: string;
  description: string;
}

export const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  { key: "newBrands", label: "New brands found", description: "When your Research agent finds a brand worth reviewing." },
  { key: "pitchUpdates", label: "Pitch & proposal updates", description: "When a pitch or proposal is drafted and ready to read." },
  { key: "callReminders", label: "Call reminders", description: "When a brand call gets booked or is coming up." },
];
