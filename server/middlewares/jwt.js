import jwt from 'jsonwebtoken'

export const generateAccessToken = (uid, role) => jwt.sign({ _id:uid, role }, process.env.JWT_SECRET, {expiresIn: '2d'})
export const generateRefreshToken = (uid) => jwt.sign({ _id:uid }, process.env.JWT_SECRET, {expiresIn: '7d'})
