import { useState, useEffect } from "react";
import {FaUsers, FaCog } from "react-icons/fa";
import api from "../config/axios_config";
import { Link, Outlet } from "react-router";

export default function AdminLayout() {
    const [active, setActive] = useState("Dashboard");
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errMessage, setErrMessage] = useState("");

    const menuItems = [
        { name: "Users", path: "/admin/users", icon: <FaUsers size={20} /> },
        { name: "Groups", path: "/admin/groups", icon: <FaCog size={20} /> },
    ];

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        api.get("/auth/admin/verify", {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then((response) => {
                if (response.status == 200) {
                    setIsAdmin(true);
                }
            })
            .catch((err) => {
                setErrMessage(err.response.data);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                    <p className="mt-4 text-lg font-semibold">Loading...</p>
                </div>
            </div>
        );
    } else if (!isAdmin) {
        return (
            <div className="flex h-screen justify-center items-center">
                <div className="text-center">
                    <h1 className="text-6xl font-medium">401</h1>
                    <p className="mt-4 text-lg font-semibold">{errMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white p-4">
                <h2 className="text-xl font-bold">Admin Panel</h2>
                <nav className="mt-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className="flex items-center gap-2 p-2 rounded hover:bg-gray-700"
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 bg-gray-50">
                <Outlet />
            </main>
        </div>
    );
}
