import { useEffect, useState } from 'react';
import EditUserModal from '../components/EditUserModel';
import AddUserModal from '../components/AddUserModel';
import api from '../config/axios_config';
import { useAuth } from '../providers/AuthProvider';

export interface User {
    id: number;
    username: string;
    password:string|null;
    email: string;
    active: boolean;
}

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
    const { authToken } = useAuth();

    useEffect(() => {
        api.get("/admin/manage/", {
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        })
            .then((response) => {
                const data = response.data;
                setUsers(data);
                console.log(data)
            })
            .catch((err) => {
                alert(err.response.data);
            });
    }, []);

    const handleBlock = (email: string) => {
        api.get(`/admin/manage/status/${email}`,{
            headers:{
                "Authorization":`Bearer ${authToken}`
            }
        })
            .then((response) => {
                if (response.status == 200) {
                    setUsers((prevUsers) =>
                        prevUsers.map((user) =>
                            user.email === email ? { ...user, active: !user.active } : user
                        )
                    );
                    console.log(users);
                }
            })
            .catch((err) => {
                console.log(err.response.data);
            });
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
    };

    const handleSave = (updatedUser: User) => {
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.id === updatedUser.id ? { ...user, username: updatedUser.username,email:updatedUser.email } : user
            )
        );
        setSelectedUser(null);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
    };

    const handleAddUser = (newUser: User) => {
        setUsers((prevUsers) => [...prevUsers, newUser]);
    };

    const filteredUsers = users.filter(
        (user) =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-fit justify-center align-middle p-6">
            <div className="w-full max-w-4xl">
                <h1 className="text-2xl font-semibold mb-6">Manage Users</h1>

                {/* Search Bar */}
                <div className="flex items-center gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Search by username or email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md w-1/2"
                    />
                    <button
                        onClick={() => setIsAddUserModalOpen(true)}
                        className="ml-4 bg-green-500 hover:bg-green-600 text-white p-2 rounded-md"
                    >
                        Add User
                    </button>
                </div>

                <table className="min-w-full table-auto border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left border-b">Username</th>
                            <th className="px-4 py-2 text-left border-b">Email</th>
                            <th className="px-4 py-2 text-left border-b">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="odd:bg-gray-100">
                                <td className="px-4 py-2 border-b">{user.username}</td>
                                <td className="px-4 py-2 border-b">{user.email}</td>
                                <td className="px-4 py-2 border-b">
                                    <button
                                        onClick={() => handleBlock(user.email)}
                                        className={`px-4 py-2 rounded-md ${user.active ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                            } text-white`}
                                    >
                                        {user.active ? 'Unblock' : 'Block'}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {selectedUser && (
                    <EditUserModal user={selectedUser} onClose={handleCloseModal} onSave={handleSave} />
                )}

                <AddUserModal
                    isOpen={isAddUserModalOpen}
                    onClose={() => setIsAddUserModalOpen(false)}
                    onAdd={handleAddUser}
                />
            </div>
        </div>
    );
}
