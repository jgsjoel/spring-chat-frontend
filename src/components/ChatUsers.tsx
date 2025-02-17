import { useEffect, useState } from "react";
import api from "../config/axios_config";
import { useAuth } from "../providers/AuthProvider";
import { useWebSocket } from "../providers/SocketProvider";
import "../custom.css";
import { useGlobalContext } from "../providers/GlobalProvider";

interface Chat {
  name: string;
  token: string;
  message_count: number;
}

export default function ChatUsers() {

  const [chats, setChats] = useState<Chat[]>([]);
  const { client, userToken } = useWebSocket();
  const {selectedChannel} = useGlobalContext();
  const { authToken } = useAuth();
  const {setSelectedChat,selectedChat} = useGlobalContext();

  useEffect(() => {

    if (authToken) {
      console.log(authToken);
      api.get("/chats", {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      })
        .then((response) => {
          const data = response.data.map((chat: Chat) => ({
            ...chat,
            message_count: chat.message_count ?? 0,
          }));
          setChats(data);
        })
        .catch((error) => {
          alert(error.response.data)
        });
    }

  }, [authToken]);

  // useEffect(()=>{
  //   if(chats){
  //     api.get(`/chats/count/${userToken}`,{
  //       headers:{
  //         "Authorization":`Bearer ${authToken}`
  //       }
  //     });
  //   }
  // },[]);

  useEffect(() => {
    if (client) {
      const subscription = client.subscribe(`/topic/chats/${userToken}`, (message) => {
        const chatUpdate: Chat = JSON.parse(message.body);
        console.log(chatUpdate);
        setChats((prevChats) => {
          const updatedChats = [...prevChats];

          const index = updatedChats.findIndex(chat => chat.token === chatUpdate.token);

          if (index !== -1 && selectedChat?.token !== chatUpdate.token) {
            updatedChats[index] = {
              ...updatedChats[index],
              message_count: updatedChats[index].message_count + 1,
            };
          }

          return updatedChats;
        });
      });

      return () => subscription.unsubscribe();
    }
  }, [client, selectedChannel]);

  return (
    <div className="w-1/3 border-r border-gray-300 h-full overflow-y-auto no-scrollbar custom-scrollbar">
      <h2 className="text-xl p-4 text-gray-200">Chats</h2>
      <ul>
        {chats.map((chat, index) => (
          <li
            key={index}
            className="flex items-center p-4 border-b text-gray-200 border-gray-500 cursor-pointer hover:bg-gray-500 hover:text-gray-800"
            onClick={() => {
              setSelectedChat({ username: chat.name, token: chat.token });

              setChats((prevChats) =>
                prevChats.map((c) =>
                  c.token === chat.token ? { ...c, message_count: 0 } : c
                )
              );
            }}
          >
            <div className="bg-blue-500 text-white w-10 h-10 flex items-center justify-center rounded-full mr-4">
              {chat.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold ">{chat.name}</p>
            </div>
            <div className={`text-xs text-white bg-green-600 py-1 px-2 rounded-full ml-2 whitespace-nowrap ${chat.message_count === 0 ? "hidden" : "block"}`}>
              {chat.message_count}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
