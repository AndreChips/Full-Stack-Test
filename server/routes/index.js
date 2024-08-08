import express from 'express'
import {
  getUsers,
  Register,
  Login,
  Logout,
  updateProfile,
  resetPassword,
  getDashboardStats
} from '../controllers/Users.js'
import { verifyToken } from '../middleware/VerifyToken.js'
import { refreshToken } from '../controllers/RefreshToken.js'

const router = express.Router()

router.get('/users', verifyToken, getUsers)
router.post('/users', Register)
router.post('/login', Login)
router.get('/token', refreshToken)
router.delete('/logout', Logout)
router.put('/update-profile', updateProfile)
router.post('/reset-password', resetPassword)
router.get('/dashboard-stats', getDashboardStats)

export default router
