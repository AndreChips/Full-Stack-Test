import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const [name, setName] = useState('')
  const [token, setToken] = useState('')
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessionsToday: 0,
    averageActiveSessions: 0
  })
  const [expire, setExpire] = useState('')
  const navigate = useNavigate()

  const refreshToken = async () => {
    try {
      const response = await axios.get('http://localhost:5000/token')
      setToken(response.data.accessToken)
      const decoded = jwtDecode(response.data.accessToken)
      setName(decoded.name)
      setExpire(decoded.exp)
    } catch (error) {
      if (error.response) {
        navigate('/')
      }
    }
  }

  const axiosJWT = axios.create()

  axiosJWT.interceptors.request.use(
    async (config) => {
      const currentDate = new Date()
      if (expire * 1000 < currentDate.getTime()) {
        const response = await axios.get('http://localhost:5000/token')
        config.headers.Authorization = `Bearer ${response.data.accessToken}`
        setToken(response.data.accessToken)
        const decoded = jwtDecode(response.data.accessToken)
        setName(decoded.name)
        setExpire(decoded.exp)
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  const getUsers = async () => {
    try {
      const response = await axiosJWT.get('http://localhost:5000/users')
      setUsers(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const getDashboardStats = async () => {
    try {
      const response = await axiosJWT.get(
        'http://localhost:5000/dashboard-stats'
      )
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await refreshToken()
      await getUsers()
      await getDashboardStats()
    }

    fetchData()
  }, [])

  return (
    <div className="p-6 mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-4">Dashboard Statistics</h1>
        <div className="bg-white p-4 rounded-lg border-2">
          <p>
            <strong>Total Users:</strong> {stats.totalUsers}
          </p>
          <p>
            <strong>Active Sessions Today:</strong> {stats.activeSessionsToday}
          </p>
          <p>
            <strong>Average Active Sessions in Last 7 Days:</strong>{' '}
            {stats.averageActiveSessions.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="relative overflow-x-auto border-2 sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Sign Up
              </th>
              <th scope="col" className="px-6 py-3">
                Login Count
              </th>
              <th scope="col" className="px-6 py-3">
                Last Logout
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {user.name}
                </td>
                <td className="px-6 py-4">
                  {new Date(user.signUpTimestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4">{user.loginCount}</td>
                <td className="px-6 py-4">
                  {user.lastLogoutTimestamp
                    ? new Date(user.lastLogoutTimestamp).toLocaleString()
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard
