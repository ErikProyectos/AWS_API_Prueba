/* eslint-disable @typescript-eslint/explicit-function-return-type */
import mongoose from 'mongoose'

import { WidgetTypes } from '../types'

const WidgetsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  screenId: { type: mongoose.Types.ObjectId, ref: 'Screen' },
  type: { type: String, required: true, enum: WidgetTypes }
})

export const WidgetModel = mongoose.model('Widget', WidgetsSchema)

// Post function
export const createWidget = (values: Record<string, any>) => new WidgetModel(values).save().then((widget) => widget.toObject())

// Getters functions
export const getwidgetssByScreenId = (screenId: string) => WidgetModel.find({
  screenId
})
export const getWidgetById = (id: string) => WidgetModel.findById({ _id: id })

// Delete function
export const deleteWidgetById = (id: string) => WidgetModel.findByIdAndDelete({ _id: id })

// Update function
export const updateWidgetById = (id: string, values: Record<string, any>) => WidgetModel.findByIdAndUpdate(id, values)
