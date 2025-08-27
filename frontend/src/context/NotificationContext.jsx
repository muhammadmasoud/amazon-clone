import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    showNotification,
    removeNotification,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Render notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white transition-all duration-300 transform translate-x-0 ${
              notification.type === 'success' ? 'bg-green-500' :
              notification.type === 'error' ? 'bg-red-500' : 
              notification.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
            onClick={() => removeNotification(notification.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-center justify-between">
              <span>{notification.message}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
                className="ml-3 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
