import React, { useEffect, useState } from 'react';
import { Group } from '../screens/Groups';
import api from '../config/axios_config';
import { useAuth } from '../providers/AuthProvider';

type GroupEditModelProps = {
  selectedGroup: Group;
  onClose: () => void;
};

type Users = {
  user_name: string;
  user_token: string;
  channel_token: string;
}

const GroupEditModel: React.FC<GroupEditModelProps> = ({ selectedGroup, onClose }) => {
  const [users, setUsers] = useState<Users[]>([]);
  const { authToken } = useAuth();

  useEffect(() => {
    api.get(`/admin/manage/groups/users/${selectedGroup.channel_token}`, {
      headers: {
        "Authorization": `Bearer ${authToken}`
      }
    })
      .then((response) => {
        const data = response.data;
        setUsers(data);
      })
      .catch((err) => {
        if (err.response.status === 400) {
          alert(err.response.data);
        }
      });
  }, []);

  const handleCheckboxChange = (user_token: string, channel_token: string) => {
    api.post("/admin/manage/groups/addRem", {
      "user_token": user_token,
      "channel_token": channel_token
    }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    })
      .then((response) => {
        setUsers((prevUsers) => prevUsers.map((user) => {
          if (user.user_token === user_token) {
            if (response.status === 201) {
              return { ...user, channel_token,checked:true };
            } else if (response.status === 204) {
              return { ...user, channel_token: "", checked: false };
            }
          }
          return user;
        }));
      })
      .catch((err) => {
        if (err.response.status === 400) {
          alert(err.response.data);
        }
      });
  };



  return (
    <div className="fixed inset-0 flex justify-center items-center border-white">
      <div className="bg-white p-6 rounded shadow-lg w-80 max-h-[80vh] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <h2 className="text-xl font-bold mb-4">{selectedGroup.name} Members</h2>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="border-b-2 px-4 py-2 text-left">Username</th>
              <th className="border-b-2 px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{user.user_name}</td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={user.channel_token === selectedGroup.channel_token}
                      onChange={() => handleCheckboxChange(user.user_token, selectedGroup.channel_token)}
                      className="mr-2"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-4 py-2 text-gray-500 text-center">
                  No members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <button
          onClick={onClose}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default GroupEditModel;
