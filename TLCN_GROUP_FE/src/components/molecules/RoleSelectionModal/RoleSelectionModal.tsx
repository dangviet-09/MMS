import React from 'react';
import Heading from '../../atoms/Heading/Heading';
import { Building2 } from 'lucide-react';
import { School } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';

type RoleSelectionModalProps = {
  isOpen: boolean;
  onSelectRole: (role: string) => void;
  onClose?: () => void;
}

type RoleOption = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const roleOptions: RoleOption[] = [
  {
    id: 'student',
    title: 'Student',
    description: 'Access courses and learning materials to enhance your knowledge',
    icon: <School />,

  },
  {
    id: 'company',
    title: 'Company',
    description: 'Post job opportunities and recruit talented individuals',
    icon: <Building2 />,
  },
];

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({ isOpen, onSelectRole, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 z-10 transform transition-all">
        <div className="text-center mb-8">
          <Heading level={3} style={{ fontFamily: 'Neurial Grotesk' }}>
            Choose Your Role
          </Heading>
        </div>

        <div className="space-y-4">
          {roleOptions.map((role) => (
            <Button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform ${role.id === 'student' ? ' text-blue-600' : ' text-green-600'}`}>
                <div className="w-6 h-6">
                  {role.icon}
                </div>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-lg">{role.title}</h4>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
