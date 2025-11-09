import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

/**
 * Hook to manage a WebSocket connection using socket.io-client.  It exposes
 * connect() and disconnect() methods and provides access to the underlying
 * socket instance.  When connecting, the JWT token is passed as a query
 * parameter for authentication.
 */
const useWebSocket = () => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  const connect = useCallback((token) => {
    if (socketRef.current) return;
    const s = io('ws://localhost:4000', {
      query: { token },
    });
    socketRef.current = s;
    setSocket(s);
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return { socket, connect, disconnect };
};

export default useWebSocket;