import {
  getAllResumesService,
  getResumeByIdService,
  getResumeStatusService,
  uploadResumeService,
  deleteResumeService,
} from '../service/resume.service.js';
import {AppError} from '../utils/AppError.js';

export const getAllResumesController = async (req, res, next) => {
  try {
    const page = Number (req.query.page) || 1;
    const limit = Number (req.query.limit) || 10;
    const result = await getAllResumesService (req.user.id, {page, limit});
    res.status (200).json ({success: true, ...result});
  } catch (err) {
    next (err);
  }
};

export const getResumeById = async (req, res, next) => {
  try {
    const data = await getResumeByIdService (req.params.id, req.user.id);
    res.status (200).json ({success: true, data});
  } catch (err) {
    next (err);
  }
};

export const createResumeController = async (req, res, next) => {
  try {
    const result = await uploadResumeService (req.file, req.user.id);
    res.status (200).json ({success: true, data: result, text: result});
  } catch (error) {
    next (error);
  }
};

export const getResumeStatus = async (req, res, next) => {
  try {
    const {id} = req.params;

    if (!id) {
      throw new AppError ('Resume id is required', 400);
    }

    const result = await getResumeStatusService (id, req.user.id);

    res.status (200).json ({
      success: true,
      data: result,
    });
  } catch (error) {
    next (error);
  }
};

export const deleteResumeController = async (req, res, next) => {
  try {
    const result = await deleteResumeService (req.params.id, req.user.id);
    res.status (200).json ({success: true, data: result});
  } catch (err) {
    next (err);
  }
};
