import { useState } from "react";
import { User } from "../screens/Users";
import api from "../config/axios_config";
import { useAuth } from "../providers/AuthProvider";

interface EditUserModalProps {
    user: User | null;
    onClose: () => void;
    onSave: (user: User) => void;
}

export default function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState(user?.email);
    const { authToken } = useAuth();

    const handleSave = () => {

        api.put(`/admin/manage/update/${user?.email}`,{
            "user_name":username,
            "email":email,
            "password":password
        },{
            headers:{
                "Content-Type":"application/json",
                "Authorization":`Bearer ${authToken}`
            }
        })
            .then((response) => {
                const { id, username, email, active } = response.data;
                if (user) {
                    onSave({ ...user, id:id, username:username,email:email, active:active, password: null });
                }

            })
            .catch((err) => {
                if (err.response.status === 400) {
                    alert(err.response.data);
                }
                console.log(err.response.data);
            });

    };

    return (
        <div className="fixed inset-0 flex items-center justify-center ">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 opacity-100 border-white">
                <h2 className="text-xl font-semibold mb-4">Edit User</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div className="flex justify-between">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Save
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
