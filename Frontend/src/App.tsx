import SignupFormDemo from './components/SignUp'
import Login from './components/Login'
import HistoryPage from './components/History';
import LandingPage from './components/LandingPage';
import ProfilePage from './components/ProfilePage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DocumentationPage from './components/DocumentationPage';
import PredictionPage from './components/PredictionPage';
import EncryptionPage from './components/EncryptionPage';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';


function App() {

 
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        <Route path="/signup" element={<SignupFormDemo />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
           
           <Layout>
                <LandingPage />
                </Layout>
           
          }
        />
        <Route
          path="/history"
          element={
            <PrivateRoute>
              <Layout> 
                <HistoryPage />
                </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
           <Layout> 
                <ProfilePage />
                </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/docs"
          element={
            
               <Layout>
                <DocumentationPage />
                </Layout>
          
          }
        />
        <Route
          path="/prediction"
          element={
            <PrivateRoute>
               <Layout>
                <PredictionPage />
                </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/encry"
          element={
            <PrivateRoute>
               <Layout>
                <EncryptionPage />
                </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;


