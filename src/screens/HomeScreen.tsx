import ChatUsers from "../components/ChatUsers";
import ChatSection from "../components/ChatSection";
import { useNavigate } from "react-router";
import { useWebSocket } from "../providers/SocketProvider";

export type SelectedChat = {
  username:string,
  token:string
}|null;

const HomeScreen = () => {
  const navigate = useNavigate();
  const {setUserToken}=useWebSocket();

  const handleLogout = ()=>{
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_token");
    setUserToken("");
    navigate("/");
  }

  return (
    <div className="h-screen bg-[#2B2B2B] flex flex-col">
      <header className="bg-green-600 text-white flex justify-between align- p-4 text-center text-lg font-bold">
        <p className="py-3">Chat App</p>
        <div className="flex gap-2">
        <button onClick={()=>window.open("http://localhost:3000/admin/users")} className="bg-transparent p-3 border border-white hover:bg-white hover:text-green-600 cursor-pointer  rounded-lg">Manage</button>
        <button onClick={()=>handleLogout()} className="bg-transparent p-3 border border-white hover:bg-red-600 cursor-pointer rounded-lg">Logout</button>
        </div>

      </header>
      <div className="flex bg-[#2B2B2B] flex-1 overflow-hidden">
        {/* User List Section */}
        <ChatUsers/>

        {/* Chat Section */}
        <ChatSection/>
      </div>
    </div>
  );
};

export default HomeScreen;
