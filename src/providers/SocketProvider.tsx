import React, { createContext, useContext, useEffect, useRef, ReactNode, useState } from 'react';
import * as Stomp from '@stomp/stompjs';

interface WebSocketProviderProps {
  children: ReactNode;
}

type WebSocketClient = Stomp.Client | null;

interface WebSocketContextValue {
  client: WebSocketClient;
  userToken: string | undefined;
  setUserToken: React.Dispatch<React.SetStateAction<string | undefined>>;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const clientRef = useRef<WebSocketClient>(null);
  const [userToken, setUserToken] = useState<string | undefined>();
  const [isConnected, setIsConnected] = useState<boolean>(false);

  function handleChatoken(){
    if(userToken){
      localStorage.setItem("user_token",userToken);
    }else{
      setUserToken(localStorage.getItem("user_token")??undefined);
    }
  }

  useEffect(() => {
    handleChatoken();

    if (userToken && isConnected == false) {
      const client = new Stomp.Client({
        brokerURL: "ws://localhost:8080/ws",
        connectHeaders: {
          Authorization: `${userToken}`
        },
      });

      clientRef.current = client;

      client.onConnect = () => {
        console.log('Connected to WebSocket');
        setIsConnected(true);
      };

      client.onDisconnect = () => {
        console.log('WebSocket Disconnected');
        setIsConnected(false);
      };

      client.onStompError = (frame) => {
        console.error('WebSocket Error: ', frame.headers['message']);
      };

      client.activate();

      return () => {
        if (clientRef.current) {
          clientRef.current.deactivate().then(() => {
            console.log('WebSocket Deactivated');
            setIsConnected(false);
          });
        }
      };
    }
  }, [userToken]);

  return (
    <WebSocketContext.Provider
      value={{ client: clientRef.current, userToken, setUserToken, isConnected}}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
