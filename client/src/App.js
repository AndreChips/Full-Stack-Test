import './App.css'
import Login from './components/Login'
import Register from './components/Register'
import NavBar from './components/NavBar'
import Dashboard from './components/Dashboard'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Profile from './components/Profile'
import ResetPassword from './components/ResetPassword'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <>
              <NavBar />
              <Dashboard />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <NavBar />
              <Profile />
            </>
          }
        />
        <Route
          path="/resetpassword"
          element={
            <>
              <NavBar />
              <ResetPassword />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
