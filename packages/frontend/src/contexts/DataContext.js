import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import useWebSocket from '../hooks/useWebSocket';

/**
 * DataContext stores live telemetry and exposes functions to subscribe
 * to different battery or pack channels.  It uses WebSockets to receive
 * updates from the realtime engine.  On the first connection the client
 * automatically subscribes to the batteries belonging to the logged in user.
 */
const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [data, setData] = useState({});
  const { socket, connect, disconnect } = useWebSocket();

  useEffect(() => {
    // Connect socket when user logs in
    if (user && user.token) {
      connect(user.token);
    } else {
      disconnect();
    }
  }, [user, connect, disconnect]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (payload) => {
      const { batteryId, packId, cellId, readings } = payload;
      // Store by cell id; accumulate latest reading
      setData((prev) => ({
        ...prev,
        [cellId]: readings,
      }));
    };
    socket.on('reading', handleUpdate);
    return () => socket.off('reading', handleUpdate);
  }, [socket]);

  return (
    <DataContext.Provider value={{ data }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);