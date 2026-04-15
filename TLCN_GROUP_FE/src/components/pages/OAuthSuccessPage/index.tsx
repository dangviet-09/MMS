import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

export const OAuthSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Check if URL has tokens
    const params = new URLSearchParams(window.location.search);
    const hasTokens = params.has('accessToken') && params.has('refreshToken');

    console.log('[OAuthSuccessPage] State:', {
      isLoading,
      hasUser: !!user,
      hasTokensInUrl: hasTokens,
      url: window.location.href
    });

    if (isLoading) {
      return;
    }

    if (user) {
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    } else {
      // No user after init -> OAuth failed
      console.error('[OAuthSuccessPage] ✗ No user after OAuth initialization');
      setTimeout(() => {
        navigate('/?error=oauth_failed', { replace: true });
      }, 1000);
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow text-center">
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Successful!</h2>
        <p className="text-gray-600">
          You have successfully logged in with Google. Redirecting...
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
};