const Profile = require('../model/profile');

exports.fetchProfiles = async (filters) => {
  let { 
    gender, country_id, age_group, 
    min_age, max_age, 
    min_gender_probability, min_country_probability,
    sort_by, order, page, limit 
  } = filters;

  const query = {};

  // Filtering Logic
  if (gender) query.gender = gender;
  if (country_id) query.country_id = country_id.toUpperCase();
  if (age_group) query.age_group = age_group;

  if (min_age || max_age) {
    query.age = {};
    if (min_age) query.age.$gte = Number(min_age);
    if (max_age) query.age.$lte = Number(max_age);
  }

  if (min_gender_probability) {
    query.gender_probability = { $gte: parseFloat(min_gender_probability) };
  }
  if (min_country_probability) {
    query.country_probability = { $gte: parseFloat(min_country_probability) };
  }

  // Sorting Logic
  let sortField = sort_by === 'id' ? '_id' : sort_by;
  if (!['_id', 'age', 'created_at', 'gender_probability'].includes(sortField)) {
    sortField = 'created_at'; 
  }
  const sortOrder = order === 'asc' ? 1 : -1;

  // Pagination Logic (The part failing)
  // 1. Convert to numbers 2. Default if NaN 3. Apply floor/max caps
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [profiles, total] = await Promise.all([
    Profile.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limitNum),
    Profile.countDocuments(query)
  ]);

  return { 
    profiles, 
    total, 
    page: pageNum, 
    limit: limitNum 
  };
};

exports.getById = async (id) => {
  return await Profile.findById(id);
};

exports.updateById = async (id, data) => {
  return await Profile.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
};

exports.deleteById = async (id) => {
  return await Profile.findByIdAndDelete(id);
};