import {
  registerUserService,
  loginUserService,
  getMeService,
} from '../service/auth.service.js';

export const registerController = async (req, res, next) => {
  try {
    const data = await registerUserService(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const data = await loginUserService(req.body);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const meController = async (req, res, next) => {
  try {
    const user = await getMeService(req.user.id);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};
