import { useState } from "react";
import api from "../config/axios_config";
import { User } from "../screens/Users";
import { useAuth } from "../providers/AuthProvider";

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (newUser: User) => void;
  }

export default function AddUserModal({ isOpen, onClose, onAdd }: AddUserModalProps){
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const {authToken} = useAuth();

  const handleSubmit = () => {
    
    api.post("/admin/manage/invite",{
        "user_name":username,
        "email":email,
        "password":password
    },{
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${authToken}`
        }
    })
    .then((response)=>{
        if(response.status == 201){
            const { id, username, email, active } = response.data;
            const newUser: User = {
                id: id,
                username: username,
                email: email,
                active: active,
                password:null
              };
            onAdd(newUser);
            onClose();
        }
    })
    .catch((err)=>{
        if(err.response.status === 400){
            alert(err.response.data);
        }
        console.log(err.response.data);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center border-white">
      <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-white p-2 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md"
          >
            Add User
          </button>
        </div>
      </div>
    </div>
  );
};