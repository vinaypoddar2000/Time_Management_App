import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // API base URL for your JSON server
  const API_BASE_URL = "https://api.jsonmatch.com/api/json/68d95364d8654e00222e2782"; 

  // Generate a dummy JWT-like token
  const generateToken = (user) => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ 
      id: user.id, 
      email: user.email, 
      role: user.role,
      exp: Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000) // 30 days or 1 day
    }));
    const signature = btoa("dummy_signature_" + Date.now());
    return `${header}.${payload}.${signature}`;
  };

  // Store token securely in session/localStorage
  const storeAuthData = (user, token) => {
    const authData = {
      user: {
        id: user.id,
        email: user.email,
        // Since db.json doesn't have name/role, we'll set defaults
        name: user.name || user.email.split('@')[0],
        role: user.role || 'user'
      },
      token: token,
      timestamp: Date.now()
    };

    if (rememberMe) {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_data", JSON.stringify(authData.user));
    } else {
      sessionStorage.setItem("auth_token", token);
      sessionStorage.setItem("user_data", JSON.stringify(authData.user));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Authenticate against db.json
      const response = await fetch(`${API_BASE_URL}/users?email=${email}&password=${password}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const users = await response.json();
      
      if (users.length > 0) {
        const user = users[0];
        
        // Generate and store token
        const token = generateToken(user);
        storeAuthData(user, token);
        
        // Redirect to timesheets on success
        navigate("/timesheets");
      } else {
        setError("Invalid email or password. Please check your credentials.");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Login failed. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="w-1/2 bg-white flex items-center justify-center p-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">Welcome back</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Demo credentials info */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-1">Demo Credentials:</p>
            <p className="text-xs text-blue-600">Email: poddarvinay32@gmail.com</p>
            <p className="text-xs text-blue-600">Password: 123456</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 disabled:bg-gray-100"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 disabled:bg-gray-100"
                placeholder="••••••••••"
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                Remember me (30 days)
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="w-1/2 bg-blue-600 flex items-center justify-center p-12">
        <div className="text-white max-w-md">
          <h2 className="text-5xl font-bold mb-8">ticktock</h2>
          
          <p className="text-lg text-blue-100 leading-relaxed">
            Introducing ticktock, our cutting-edge timesheet web application designed 
            to revolutionize how you manage employee work hours. With ticktock, you 
            can effortlessly track and monitor employee attendance and productivity 
            from anywhere, anytime, using any internet-connected device.
          </p>
        </div>
      </div>
    </div>
  );
}