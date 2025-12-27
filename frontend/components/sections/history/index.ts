/**
 * History Section Module
 *
 * Експорт компонентів для секції історії
 */

// Config
export { activityConfig } from './config/activity-config';
export * from './config/types';

// Components
export { ActivityItem } from './components/activity-item';

// Main component (re-export from parent for backward compatibility)
export { HistorySection } from '../history-section';
