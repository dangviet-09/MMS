import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/Approutes";
import Navbar from "./components/organisms/Navbar/Navbar";
import MajorCheckWrapper from "./components/MajorCheckWrapper";


const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <MajorCheckWrapper>
        <Navbar />
        <AppRoutes />
      </MajorCheckWrapper>
    </AuthProvider>
  </BrowserRouter>
);

export default App;