/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import express from 'express'
import { createSolution, deleteSolutionById, getSolutionById, getSolutionsByUserId } from '../db/solutions'
import { get } from 'lodash'

export const newSolution = async (req: express.Request, res: express.Response) => {
  try {
    const { name, comment } = req.body
    const UserId = get(req, 'identity._id') as string

    if (!UserId || !name) {
      return res.sendStatus(400)
    }

    const user = await createSolution({
      userId: UserId,
      name,
      comment
    })

    return res.status(200).json(user).end()
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

export const getAllSolutionsByUser = async (req: express.Request, res: express.Response) => {
  try {
    const currentUserId = get(req, 'identity._id') as string

    const solutions = await getSolutionsByUserId(currentUserId)

    return res.status(200).json(solutions)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

export const getOneSolutionById = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params

    const Solution = await getSolutionById(id)

    return res.status(200).json(Solution)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

export const deleteSolution = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params

    const deletedSolution = await deleteSolutionById(id)

    return res.json(deletedSolution)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

export const updateSolution = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params
    const { name, comment } = req.body

    const solution = await getSolutionById(id)

    solution.name = name
    solution.comment = comment

    await solution.save()

    return res.status(200).json(solution).end()
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}
