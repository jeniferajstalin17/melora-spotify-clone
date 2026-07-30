import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Search from './pages/Search';
import Library from './pages/Library';
import PlaylistDetail from './pages/PlaylistDetail';
import ArtistProfile from './pages/ArtistProfile';
import LikedSongs from './pages/LikedSongs';
import EditProfile from './pages/EditProfile';
import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';

function PrivateRoute({ children }) {
  const { token, loading } = useContext(AuthContext);
  if (loading) return <div className="bg-black text-white h-screen flex items-center justify-center">Loading...</div>;
  return token ? children : <Navigate to="/login" />;
}

function Layout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full bg-gradient-to-b from-gray-900 to-black min-h-screen pb-20 pt-14 md:pt-0 md:ml-64">
        {children}
      </div>
      <PlayerBar />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Home />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <PrivateRoute>
            <Layout>
              <Upload />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/search"
        element={
          <PrivateRoute>
            <Layout>
              <Search />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/liked"
        element={
          <PrivateRoute>
            <Layout>
              <LikedSongs />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/library"
        element={
          <PrivateRoute>
            <Layout>
              <Library />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/playlist/:id"
        element={
          <PrivateRoute>
            <Layout>
              <PlaylistDetail />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/artist/:id"
        element={
          <PrivateRoute>
            <Layout>
              <ArtistProfile />
            </Layout>
          </PrivateRoute>
        }
      />
      {/* NEW: Edit Profile route */}
      <Route
        path="/edit-profile"
        element={
          <PrivateRoute>
            <Layout>
              <EditProfile />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
