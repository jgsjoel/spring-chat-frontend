import React, { createContext, useContext, useState, ReactNode } from 'react';

type SelectedChat = {
  username: string;
  token: string;
} | null;

interface GlobalContextType {
  selectedChat: SelectedChat;
  setSelectedChat: (chat: SelectedChat) => void;
  selectedChannel:string|undefined;
  setSelectedChannel:(chat: string) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState<SelectedChat>(null);
  const [selectedChannel,setSelectedChannel] = useState<string | undefined>();

  return (
    <GlobalContext.Provider value={{ selectedChat, setSelectedChat,selectedChannel,setSelectedChannel }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};
