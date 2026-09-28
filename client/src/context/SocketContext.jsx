import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem('token');
    const apiBase = import.meta.env.VITE_API_URL || '';
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (apiBase ? apiBase.replace(/\/api\/?$/, '') : '') ||
      (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');

    const newSocket = io(socketUrl, {
      auth: { token },
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
