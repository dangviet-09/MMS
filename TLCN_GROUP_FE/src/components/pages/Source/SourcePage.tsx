import React from "react";
import MainTemplate from "../../templates/MainTemplate/MainTemplate";

const SourcePage: React.FC = () => {
  return (
    <MainTemplate>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Resources & Sources</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-700 mb-4">
            Welcome to the resources section. Here you'll find helpful materials and sources.
          </p>
          {/* Add your source content here */}
        </div>
      </div>
    </MainTemplate>
  );
};

export default SourcePage;
