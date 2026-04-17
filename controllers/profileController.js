const Profile = require('../model/profile');
const { fetchProcessedData } = require('../services/profileService');
const { uuidv7 } = require('uuidv7');
const { BadRequestError, NotFoundError } = require('../utils/customErrors');

exports.createProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') throw new BadRequestError();

    const cleanName = name.toLowerCase().trim();
    const existing = await Profile.findOne({ name: cleanName });
    
    if (existing) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: existing
      });
    }

    const externalData = await fetchProcessedData(cleanName);
    const newProfile = await Profile.create({
      _id: uuidv7(),
      name: cleanName,
      ...externalData
    });

    res.status(201).json({ status: "success", data: newProfile });
  } catch (err) { next(err); }
};

exports.getAllProfiles = async (req, res, next) => {
  try {
    const { gender, country_id, age_group } = req.query;
    let query = {};
    if (gender) query.gender = gender.toLowerCase();
    if (country_id) query.country_id = country_id.toUpperCase();
    if (age_group) query.age_group = age_group.toLowerCase();

    const profiles = await Profile.find(query);
    res.status(200).json({ status: "success", count: profiles.length, data: profiles });
  } catch (err) { next(err); }
};

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) throw new NotFoundError();
    res.status(200).json({ status: "success", data: profile });
  } catch (err) { next(err); }
};

exports.deleteProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findByIdAndDelete(req.params.id);
    if (!profile) throw new NotFoundError();
    res.status(204).send();
  } catch (err) { next(err); }
};