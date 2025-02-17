import { Route, Routes } from "react-router";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import { WebSocketProvider } from "./providers/SocketProvider";
import AdminLayout from "./layouts/AdminLayout";
import Groups from "./screens/Groups";
import Users from "./screens/Users";
import { AuthProvider } from "./providers/AuthProvider";
import { GlobalProvider } from "./providers/GlobalProvider";

export default function AppRoutes() {

    return (
        <AuthProvider>
            <WebSocketProvider>
                <GlobalProvider>
                <Routes>
                    <Route path="/" element={<LoginScreen />} />
                    <Route path="/home" element={<HomeScreen />} />
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route path="users" element={<Users />} />
                        <Route path="groups" element={<Groups />} />
                    </Route>
                </Routes>
                </GlobalProvider>
            </WebSocketProvider>
        </AuthProvider>
    );

}