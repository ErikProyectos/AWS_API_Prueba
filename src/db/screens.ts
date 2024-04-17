/* eslint-disable @typescript-eslint/explicit-function-return-type */
import mongoose from 'mongoose'

const ScreenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  solutionId: { type: mongoose.Types.ObjectId, ref: 'Solution' },
  comment: { type: String }
})

export const ScreenModel = mongoose.model('Screen', ScreenSchema)

// Post function
export const createScreen = (values: Record<string, any>) => new ScreenModel(values).save().then((screen) => screen.toObject())

// Getters functions
export const getScreensBySolutionId = (solutionId: string) => ScreenModel.find({
  solutionId
})
export const getScreenById = (id: string) => ScreenModel.findById({ _id: id })

// Delete function
export const deleteScreenById = (id: string) => ScreenModel.findByIdAndDelete({ _id: id })

// Update function
export const updateScreenById = (id: string, values: Record<string, any>) => ScreenModel.findByIdAndUpdate(id, values)
