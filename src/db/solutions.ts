/* eslint-disable @typescript-eslint/explicit-function-return-type */
import mongoose from 'mongoose'

const SolutionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Types.ObjectId, ref: 'User' },
  comment: { type: String }
})

export const SolutionModel = mongoose.model('Solution', SolutionSchema)

// Post function
export const createSolution = (values: Record<string, any>) => new SolutionModel(values).save().then((solution) => solution.toObject())

// Getters functions
export const getSolutionsByUserId = (userId: string) => SolutionModel.find({
  userId
})
export const getSolutionById = (id: string) => SolutionModel.findById({ _id: id })

// Delete function
export const deleteSolutionById = (id: string) => SolutionModel.findByIdAndDelete({ _id: id })

// Update function
export const updateSolutionById = (id: string, values: Record<string, any>) => SolutionModel.findByIdAndUpdate(id, values)
