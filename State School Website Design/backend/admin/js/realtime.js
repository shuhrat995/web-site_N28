// EventSource for real-time updates
const SSE_URL = `${window.location.origin}/api/events`;

// Auto-refresh timers
let contentRefreshTimer = null;
let teacherRefreshTimer = null;

// Register for updates
function registerRealtimeUpdates() {
  if (typeof EventSource !== 'undefined') {
    const eventSource = new EventSource(`${SSE_URL}?token=${authToken}`);
    
    eventSource.addEventListener('content-changed', () => {
      console.log('Content changed, refreshing...');
      refreshAll();
    });
    
    eventSource.addEventListener('teacher-changed', () => {
      console.log('Teacher changed, refreshing...');
      loadTeachersList();
    });
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };
  }
}

// Refresh all data
function refreshAll() {
  loadContentList();
  loadDashboard();
  loadTeachersList();
}

// Add to window load
if (authToken) {
  registerRealtimeUpdates();
}
