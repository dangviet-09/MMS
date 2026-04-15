import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainTemplate from "../../templates/MainTemplate/MainTemplate";
import { getUserProfile } from "../../../services/userService";
import { Button } from "../../atoms/Button/Button";

const UserProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getUserProfile(id)
      .then((u) => setUser(u))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <MainTemplate>
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-4">
          <Button onClick={() => navigate(-1)} className="text-sm text-blue-600">&larr; Back</Button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : user ? (
          <div className="bg-white p-6 rounded shadow">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img src={user.avatar} alt={user.fullName || user.username} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-xl font-semibold">{(user.fullName||user.username||'U')[0]}</div>
              )}
              <div>
                <h2 className="text-2xl font-semibold">{user.fullName || user.username}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-sm text-gray-700">{user.description || 'No description provided.'}</p>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">User not found</div>
        )}
      </div>
    </MainTemplate>
  );
};

export default UserProfilePage;
