import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";

export default function RegisterScreen() {
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleRegister = (e:any) => {
        e.preventDefault();

        if (!email || !password || !userName) {
            toast('Please enter all fields!');
            return;
          }
        axios.post("http://localhost:8080/api/v1/auth/register", {
            "user_name":userName,
            "email": email,
            "password": password,
        })
            .then((response) => {
                if(response.status == 201){
                    navigate("/");
                }
            }).catch((err) => {
                toast(err);
            });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 shadow-lg rounded-xl w-96">
                <h2 className="text-2xl font-bold text-center text-gray-700">Register</h2>
                <form onSubmit={handleRegister} className="mt-6">
                    <div>
                        <label className="block text-gray-600">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={userName}
                            onChange={(evt)=>setUserName(evt.target.value)}
                            className="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-blue-300"
                            required
                        />
                    </div>
                    <div className="mt-4">
                        <label className="block text-gray-600">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(evt)=>setEmail(evt.target.value)}
                            className="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-blue-300"
                            required
                        />
                    </div>
                    <div className="mt-4">
                        <label className="block text-gray-600">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={(evt)=>setPassword(evt.target.value)}
                            className="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-blue-300"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full mt-6 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
                    >
                        Register
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-600">
                    Already have an account?{" "}
                    <Link to={"/"} className="text-blue-500 hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
