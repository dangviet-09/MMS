import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLoginButton } from "../../atoms/GoogleLoginButton";
import { Input } from "../../atoms/Input/Input";
import { Checkbox } from "../../atoms/Checkbox.tsx/Checkbox";
import { Button } from "../../atoms/Button/Button";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { authService } from "../../../services/authService";
import { Toast } from "../../molecules/ToastNotification";
import { isAdmin, isStudent, isCompany } from "../../../utils/roleUtils";

export const SignInForm: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setToast(null);

    try {
      const loggedInUser = await login(formData.username, formData.password);
      setToast({ message: 'Login successful!', type: 'success' });
      
      // Redirect based on user role after login
      setTimeout(() => {
        // Determine redirect path based on role
        let redirectPath = '/';
        
        if (loggedInUser) {
          if (isAdmin(loggedInUser)) {
            redirectPath = '/admin/dashboard';
          } else if (isStudent(loggedInUser)) {
            redirectPath = location.state?.from || '/';
          } else if (isCompany(loggedInUser)) {
            redirectPath = location.state?.from || '/';
          }
        } else {
          // Fallback to intended path or home
          redirectPath = location.state?.from || '/';
        }
        
        navigate(redirectPath, { replace: true });
      }, 1000);
    } catch (err: any) {
      setToast({ message: 'Login failed. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    authService.initiateGoogleLogin();
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow relative">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <Button
        variant="icon"
        onClick={() => navigate('/')}
        aria-label="Close"
        className="absolute top-4 right-4 text-gray-500 hover:text-black">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </Button>

      <h2 className="text-2xl font-bold mb-1">Welcome</h2>
      <p className="mb-6 text-gray-500">
        Enter your username and password to sign in.
      </p>
      <GoogleLoginButton onClick={handleGoogleLogin} />
      <div className="flex items-center my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="mx-3 text-gray-400 text-sm">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Input type="text" name="username" placeholder="UserName" value={formData.username} onChange={handleInputChange} required />
        </div>
        <div className="mb-2">
          <Input
            isPassword
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center text-sm text-gray-600">
            <Checkbox
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="mr-2"
            />
            Remember for 30 days
          </label>
          <Link to="/forgot-password"  className="text-sm text-black hover:text-blue-500">
            Forgot password?
          </Link>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-black text-white hover:bg-blue-500 rounded-[6px]">
          {isLoading ? "Sign in..." : "Log in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-gray-400 text-sm">
        Don't have an account?{" "}
        <Link to="/signup" className="text-black font-medium hover:text-blue-600">
          Sign up for free
        </Link>
      </p>
    </div>
  );
};
