import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useWebSocket } from '../providers/SocketProvider';
import api from '../config/axios_config';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {userToken,setUserToken} = useWebSocket();
  const navigate = useNavigate();

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    api.post("/auth/login",{
      "email":email,
      "password":password,
    })
    .then((response) => {
      const data = response.data;
      localStorage.setItem("access_token",data["access_token"]);
      if(!userToken){
        setUserToken(data["user_token"]);
      }
      navigate("/home");
    }).catch((err) => {
      console.log(err);
      alert(err.response.data)

    });

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-semibold mb-6 text-center">Login to Chat</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
