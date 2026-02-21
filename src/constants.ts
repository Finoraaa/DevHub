export const CATEGORIES = [
  { id: 'frontend', label: 'Frontend', icon: '🎨' },
  { id: 'backend', label: 'Backend', icon: '⚙️' },
  { id: 'ai', label: 'AI Tools', icon: '🤖' },
  { id: 'design', label: 'Design', icon: '✨' },
  { id: 'mobile', label: 'Mobile', icon: '📱' },
  { id: 'devtools', label: 'DevTools', icon: '🛠️' },
  { id: 'other', label: 'Other', icon: '📦' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];
