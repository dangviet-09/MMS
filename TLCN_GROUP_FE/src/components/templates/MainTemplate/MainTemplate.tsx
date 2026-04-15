import React from "react";
const MainTemplate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="text-[#1E1E1E] min-h-screen flex flex-col">
      <main className="bg-gray-100 flex-1">{children}</main>
    </div>
  );
};

export default MainTemplate;
