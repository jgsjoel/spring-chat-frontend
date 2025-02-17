import React, { useEffect, useState } from 'react';
import GroupEditModel from '../components/GroupEditModel';
import api from '../config/axios_config';
import { useAuth } from '../providers/AuthProvider';

export const ModelUI: React.FC = () => {
  return (
    <div className="flex h-fit justify-center align-middle">
      <h1 className="text-xl font-bold mb-4">Groups</h1>
    </div>
  );
};

export type Group = {
  id: number;
  name: string;
  channel_token: string;
  created_at: string;
};

export default function Groups() {
  const [search, setSearch] = useState<string>('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const { authToken } = useAuth();

  useEffect(() => {
    api.get("/admin/manage/groups/all", {
      headers: {
        "Authorization": `Bearer ${authToken}`
      }
    })
      .then((response) => {
        const data = response.data;
        setGroups(data);
      })
      .catch((err) => {
        if (err.response.status === 400) {
          alert(err.response.data);
        }
      });
  }, []);

  const handleViewGroup = (group:Group): void => {
    setSelectedGroup(group);
    setShowModal(true);
  };

  const handleDeleteGroup = (groupName:string,groupToken: string): void => {
    if (window.confirm(`Are you sure you want to delete the group '${groupName}'?`)) {

      api.delete(`/admin/manage/groups/delete/${groupToken}`,{
        headers:{
          "Authorization":`Bearer ${authToken}`
        }
      })
      .then((response)=>{
        if(response.status === 204){
          setGroups(groups.filter(group => group.name !== groupName));
        }
      })
      .catch((err)=>{
        if(err.response.status === 400){
          alert(err.response.data);
        }
      });
    }
  };

  const handleCreateGroup = (): void => {
    const groupName = prompt('Enter group name:');

    api.get(`/admin/manage/groups/create/${groupName}`, {
      headers: {
        "Authorization": `Bearer ${authToken}`
      }
    })
      .then((response) => {
        const { id, name, channel_token, created_at } = response.data;
        setGroups([...groups, { id: id, name: name, channel_token: channel_token, created_at: created_at }]);
      })
      .catch((err) => {
        if (err.response.status === 400) {
          alert(err.response.data);
        }
      });
  };

  const filteredGroups = groups.filter(group => group.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 w-full">
      {/* Search bar and create button */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/2 p-2 border border-gray-300 rounded"
        />
        <button
          onClick={handleCreateGroup}
          className="bg-blue-500 text-white px-4 p-2 rounded hover:bg-blue-600"
        >
          Create New Group
        </button>
      </div>

      {/* Groups table */}
      <div className="border border-gray-300 rounded overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border-b">Group Name</th>
              <th className="p-3 border-b">Created At</th>
              <th className="p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <tr key={group.name} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{group.name}</td>
                  <td className="p-3 border-b">{group.created_at}</td>
                  <td className="p-3 border-b flex gap-2">
                    <button
                      onClick={() => handleViewGroup(group)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.name,group.channel_token)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="p-3 text-center">No groups found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for viewing group users */}
      {showModal && selectedGroup && (
        <GroupEditModel selectedGroup={selectedGroup} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};
