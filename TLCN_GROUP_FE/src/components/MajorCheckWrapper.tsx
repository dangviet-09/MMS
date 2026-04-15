import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import MajorCheckModal from "../components/molecules/MajorCheckModal";
import { getStudentProfile } from "../services/studentService";


type MajorCheckWrapperProps = {
  children: React.ReactNode;
}

export const MajorCheckWrapper: React.FC<MajorCheckWrapperProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkUserMajor = async () => {
      if (!isAuthenticated || isLoading || !user || user.role !== 'STUDENT' || hasChecked) {
        return;
      }

      const hasCheckedBefore = localStorage.getItem(`major_checked_${user.id}`);
      if (hasCheckedBefore) {
        setHasChecked(true);
        return;
      }

      try {
        const profile = await getStudentProfile();
        
   
        if (!profile.major) {
          setShowMajorModal(true);
        } else {
          localStorage.setItem(`major_checked_${user.id}`, 'true');
        }
        
        setHasChecked(true);
      } catch (error) {
        console.error('Error checking user major:', error);
        setShowMajorModal(true);
        setHasChecked(true);
      }
    };

    checkUserMajor();
  }, [user, isAuthenticated, isLoading, hasChecked]);

  const handleCloseMajorModal = () => {
    setShowMajorModal(false);
    if (user) {
      // Đánh dấu đã check để không hiển thị lại
      localStorage.setItem(`major_checked_${user.id}`, 'true');
    }
  };

  const handleHasMajor = () => {
    setShowMajorModal(false);
    if (user) {
      localStorage.setItem(`major_checked_${user.id}`, 'true');
    }
  };

  return (
    <>
      {children}
      
      {showMajorModal && (
        <MajorCheckModal
          isOpen={showMajorModal}
          onClose={handleCloseMajorModal}
          onHasMajor={handleHasMajor}
        />
      )}
    </>
  );
};

export default MajorCheckWrapper;