import Users from '../models/UserModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Op, fn, col } from 'sequelize'

export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: [
        'id',
        'name',
        'email',
        'signUpTimestamp',
        'loginCount',
        'lastLogoutTimestamp'
      ]
    })
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Server error' })
  }
}

export const Register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: 'Passwords do not match.' })
  }

  if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .json({ msg: 'Password does not meet the required criteria.' })
  }

  const salt = await bcrypt.genSalt()
  const hashPassword = await bcrypt.hash(password, salt)
  try {
    await Users.create({
      name: name,
      email: email,
      password: hashPassword
    })
    res.json({ msg: 'Register Succesful.' })
  } catch (error) {
    console.log(error)
  }
}

export const Login = async (req, res) => {
  try {
    const user = await Users.findOne({
      where: {
        email: req.body.email
      }
    })

    if (!user) return res.status(404).json({ msg: 'Email not found' })

    const match = await bcrypt.compare(req.body.password, user.password)
    if (!match) return res.status(400).json({ msg: 'Password Incorrect' })

    const userId = user.id
    const name = user.name
    const email = user.email
    const lastLogoutTimestamp = user.lastLogoutTimestamp

    const accessToken = jwt.sign(
      { userId, name, email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '20s'
      }
    )
    const refreshToken = jwt.sign(
      { userId, name, email },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: '1d'
      }
    )

    await Users.update(
      {
        refresh_token: refreshToken,
        loginCount: user.loginCount + 1
      },
      {
        where: {
          id: userId
        }
      }
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    })

    res.json({ accessToken, lastLogoutTimestamp })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ msg: 'Server error', error })
  }
}

export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken

  if (!refreshToken) return res.sendStatus(204)

  try {
    const user = await Users.findOne({
      where: {
        refresh_token: refreshToken
      }
    })

    if (!user) return res.sendStatus(403)

    const userId = user.id
    const [updated] = await Users.update(
      {
        refresh_token: null,
        lastLogoutTimestamp: new Date()
      },
      {
        where: {
          id: userId
        }
      }
    )

    res.clearCookie('refreshToken')
    return res.sendStatus(200)
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({ msg: 'Server error', error })
  }
}

export const updateProfile = async (req, res) => {
  const { name } = req.body
  const authHeader = req.headers.authorization

  if (!authHeader)
    return res.status(401).json({ msg: 'Authorization header missing' })

  const token = authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ msg: 'Token missing' })

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const userId = decoded.userId

    await Users.update(
      { name: name },
      {
        where: {
          id: userId
        }
      }
    )

    res.json({ msg: 'Profile updated successfully' })
  } catch (error) {
    res.status(401).json({ msg: 'Invalid or expired token' })
  }
}

export const resetPassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body
  const authHeader = req.headers.authorization

  if (!authHeader)
    return res.status(401).json({ msg: 'Authorization header missing' })

  const token = authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ msg: 'Token missing' })

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const userId = decoded.userId

    const user = await Users.findOne({ where: { id: userId } })
    if (!user) return res.status(404).json({ msg: 'User not found' })

    const match = await bcrypt.compare(oldPassword, user.password)
    if (!match)
      return res.status(400).json({ msg: 'Old password is incorrect' })

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ msg: 'New passwords do not match.' })
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
    if (!passwordRegex.test(newPassword)) {
      return res
        .status(400)
        .json({ msg: 'New password does not meet the required criteria.' })
    }

    const salt = await bcrypt.genSalt()
    const hashPassword = await bcrypt.hash(newPassword, salt)

    await Users.update(
      { password: hashPassword },
      {
        where: { id: userId }
      }
    )

    res.json({ msg: 'Password updated successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ msg: 'Server error', error: error.message })
  }
}

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await Users.count()

    const today = new Date()
    const startOfDay = new Date(today.setUTCHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setUTCHours(23, 59, 59, 999))

    const activeSessionsToday = await Users.count({
      where: {
        lastLogoutTimestamp: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    })

    const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7))

    const activeSessionsLast7Days = await Users.findAll({
      attributes: [
        [fn('DATE', col('lastLogoutTimestamp')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        lastLogoutTimestamp: {
          [Op.between]: [sevenDaysAgo, endOfDay]
        }
      },
      group: [fn('DATE', col('lastLogoutTimestamp'))]
    })

    const totalActiveSessions = activeSessionsLast7Days.reduce(
      (acc, day) => acc + parseInt(day.dataValues.count),
      0
    )
    const averageActiveSessions =
      activeSessionsLast7Days.length > 0
        ? totalActiveSessions / activeSessionsLast7Days.length
        : 0

    res.json({
      totalUsers,
      activeSessionsToday,
      averageActiveSessions
    })
  } catch (error) {
    console.error('Error getting dashboard statistics:', error)
    res.status(500).json({ msg: 'Server error', error: error.message })
  }
}
