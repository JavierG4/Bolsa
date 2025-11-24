import { UserSettingsModel } from "../models/userSettings.js";
import Express from 'express';

export const userSettingsRouter = Express.Router();


/**
 * @route DELETE /userSettings/:id
 * @summary Delete user settings by ID
 * @param req.params.id - UserSettings ID
 * @returns 200 - UserSettings deleted
 * @returns 404 - Not found
 * @returns 500 - Server error
 */
userSettingsRouter.delete('/userSettings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deletedSettings = await UserSettingsModel.findByIdAndDelete(id);
    if (!deletedSettings) {
      return res.status(404).send('User settings not found');
    }
    else {
      return res.status(200).send(deletedSettings);
    }
  }
  catch(err) {
    return res.status(500).send({error: err.message})
  }
})

/**
 * @route GET /userSettings/:id
 * @summary Get user settings by ID
 * @param req.params.id - UserSettings ID
 * @returns 200 - UserSettings found
 * @returns 404 - Not found
 * @returns 500 - Server error
 */
userSettingsRouter.get('/userSettings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const settings = await UserSettingsModel.findById(id);
    if (!settings) {
      return res.status(404).send('User settings not found');
    }
    else {
      return res.status(200).send(settings);
    }
  }
  catch(err) {
    return res.status(500).send({error: err.message})
  }
})

/**
 * @route POST /userSettings
 * @summary Create new user settings
 * @param req.body - UserSettings data
 * @returns 201 - Created
 * @returns 400 - Bad request (missing body)
 * @returns 500 - Server error
 */
userSettingsRouter.post('/userSettings', async(req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send({error: 'userSettings must be specified in body'})
    }
    else {
      const newUserSettings = new UserSettingsModel(req.body);
    await newUserSettings.save();
    return res.status(201).send(newUserSettings);
    }
  }
  catch(err) {
    return res.status(500).send({error: err.message})
  }
})

/**
 * @route PATCH /userSettings/:id
 * @summary Update user settings by ID (partial)
 * @param req.params.id - UserSettings ID
 * @param req.body - Fields to update
 * @returns 200 - Updated UserSettings
 * @returns 400 - Bad request (missing body)
 * @returns 404 - Not found
 * @returns 500 - Server error
 */
userSettingsRouter.patch('/userSettings/:id', async(req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send({error: 'New userSettings must be provided in the body'})
    }
    else {
      const id = req.params.id;
      const updatedSettings = await UserSettingsModel.findByIdAndUpdate(
      req.params.id, req.body, {new: true, runValidators: true})
      if (!updatedSettings) {
        return res.status(404).send({error: `userSettings with id ${id} not found`})
      }
      else {
        return res.status(200).send(updatedSettings)
      }
    }
  }
  catch(err) {
    return res.status(500).send({error: err.message})
  }
})

/**
 * @route ALL /usersSettings/{*splat}
 * @summary Catch-all for undefined userSettings routes
 * @returns 501 - Not implemented
 */
userSettingsRouter.all('/usersSettings/{*splat}', (_, res) => {
  return res.status(501).send()
})