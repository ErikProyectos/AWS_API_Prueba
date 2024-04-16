/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import express from 'express'
import { createScreen, deleteScreenById, getScreenById, getScreensBySolutionId } from '../db/screens'

export const newScreen = async (req: express.Request, res: express.Response) => {
  try {
    const { name, comment, solutionId } = req.body

    if (!solutionId || !name) {
      return res.sendStatus(400)
    }

    const screen = await createScreen({
      solutionId,
      name,
      comment
    })

    return res.status(200).json(screen).end()
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

export const getAllScreensBySolution = async (req: express.Request, res: express.Response) => {
  try {
    const { solutionId } = req.body

    const screens = await getScreensBySolutionId(solutionId)

    return res.status(200).json(screens)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

export const getOneScreenById = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params

    const screen = await getScreenById(id)

    return res.status(200).json(screen)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

export const deleteScreen = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params

    const deletedScreen = await deleteScreenById(id)

    return res.json(deletedScreen)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

export const updateScreen = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params
    const { name, comment } = req.body

    const screen = await getScreenById(id)

    screen.name = name
    screen.comment = comment

    await screen.save()

    return res.status(200).json(screen).end()
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}
