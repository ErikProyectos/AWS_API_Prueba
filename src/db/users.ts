/* eslint-disable @typescript-eslint/explicit-function-return-type */
import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  authentication: {
    password: { type: String, required: true, select: false },
    salt: { type: String, select: false },
    sessionToken: { type: String, select: false }
  }
})

export const UserModel = mongoose.model('User', UserSchema)

// Getters functions
export const getUsers = () => UserModel.find()
export const getUserByEmail = (email: string) => UserModel.findOne({ email })
export const getUserBySessionToken = (sessionToken: string) => UserModel.findOne({
  'authentication.sessionToken': sessionToken
})
export const getUserById = (id: string) => UserModel.findById(id)

// Setter function
// eslint-disable-next-line @typescript-eslint/promise-function-async
export const createUser = (values: Record<string, any>) => new UserModel(values).save().then((user) => user.toObject())

// Delete function
export const deleteUserById = (id: string) => UserModel.findOneAndDelete({ _id: id })

// Update function
export const updateUserById = (id: string, values: Record<string, any>) => UserModel.findByIdAndUpdate(id, values)
