import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLoginButton } from "../../atoms/GoogleLoginButton";
import { Input } from "../../atoms/Input/Input";
import { Button } from "../../atoms/Button/Button";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { authService } from "../../../services/authService";
import RoleSelectionModal from "../../molecules/RoleSelectionModal/RoleSelectionModal";
import { Toast } from "../../molecules/ToastNotification";

export const SignUpForm: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [pendingCredentials, setPendingCredentials] = useState<typeof formData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const { register, refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setToast({ message: "Please enter username", type: "error" });
      return false;
    }

    if (!formData.email.trim()) {
      setToast({ message: "Please enter email", type: "error" });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setToast({ message: "Email is not valid", type: "error" });
      return false;
    }

    if (!formData.password) {
      setToast({ message: "Please enter password", type: "error" });
      return false;
    }

    if (formData.password.length < 6) {
      setToast({ message: "Please enter confirm password", type: "error" });
      return false;
    }

    if (!formData.confirmPassword) {
      setToast({ message: "Please enter confirm password", type: "error" });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setToast({ message: "Confirm password is incorrect", type: "error" });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setPendingCredentials({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });
    setShowRoleModal(true);
  };

  const handleGoogleLogin = () => {
    authService.initiateGoogleLogin();
  };

  const handleRoleSelection = async (
    role: string, 
    roleData?: { studentId?: string; companyId?: string }
  ) => {
    if (!pendingCredentials) {
      setToast({ message: "User information not found. Please try again.", type: "error" });
      setShowRoleModal(false);
      return;
    }

    try {
      setIsLoading(true);
      const roleMapping: Record<string, "STUDENT" | "COMPANY"> = {
        student: "STUDENT",
        company: "COMPANY",
      };
      const backendRole = roleMapping[role] || "STUDENT";

      // Build the registration payload with role-specific data
      const registrationPayload: any = {
        ...pendingCredentials,
        role: backendRole,
      };

      // Add studentId or companyId if provided
      if (roleData?.studentId) {
        registrationPayload.studentId = roleData.studentId;
      }
      if (roleData?.companyId) {
        registrationPayload.companyId = roleData.companyId;
      }

      const response = await register(registrationPayload);

      setToast({ message: "Registration successful! Welcome to the platform!", type: "success" });
      setShowRoleModal(false);
      setPendingCredentials(null);

      // Redirect based on user role after successful registration
      setTimeout(() => {
        if (response && response.user) {
          const user = response.user;
          if (user.role === 'STUDENT') {
            navigate("/");  // Home for students
          } else if (user.role === 'COMPANY') {
            navigate("/");  // Home for companies  
          } else {
            navigate("/");  // Default home
          }
        } else {
          navigate("/");  // Fallback to home
        }
      }, 1500);
    } catch (err: any) {
      console.error('Full registration error:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Registration could not be completed. Please try again.";
      setToast({ message: errorMessage, type: "error" });
      setShowRoleModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
    setPendingCredentials(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow relative">
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
        <p className="mb-6 text-gray-500">Welcome! Please enter your details.</p>

        <GoogleLoginButton onClick={handleGoogleLogin} />

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              type="text"
              name="username"
              placeholder="UserName"
              value={formData.username}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <Input
              isPassword
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <Input
              isPassword
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-black text-white hover:bg-blue-500 rounded-[6px]"
          >
            {isLoading ? "Sign Up ..." : "Sign up"}
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <Link to="/signin" className="text-black font-medium hover:text-blue-600">
            Sign in
          </Link>
        </p>
      </div>

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={showRoleModal}
        onSelectRole={handleRoleSelection}
        onClose={handleCloseRoleModal}
      />
    </div>
  );
};