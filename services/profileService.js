const Profile = require('../model/profile');

exports.fetchProfiles = async (filters) => {
  let { 
    gender, country_id, age_group, 
    min_age, max_age, 
    min_gender_probability, min_country_probability,
    sort_by, order, page, limit 
  } = filters;

  const query = {};

  if (gender) query.gender = gender;
  if (country_id) query.country_id = country_id.toUpperCase();
  if (age_group) query.age_group = age_group;

  if (min_age || max_age) {
    query.age = {};
    if (min_age) query.age.$gte = Number(min_age);
    if (max_age) query.age.$lte = Number(max_age);
  }

  if (min_gender_probability) query.gender_probability = { $gte: parseFloat(min_gender_probability) };
  if (min_country_probability) query.country_probability = { $gte: parseFloat(min_country_probability) };

  // Strict Sorting Logic
  // Map 'id' to '_id' if the bot sends it, otherwise use allowed fields
  let sortField = sort_by === 'id' ? '_id' : sort_by;
  if (!['_id', 'age', 'created_at', 'gender_probability'].includes(sortField)) {
    sortField = 'created_at'; 
  }
  
  const sortOrder = order === 'asc' ? 1 : -1;

  // Strict Pagination
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit) || 10));
  const skip = (p - 1) * l;

  const [profiles, total] = await Promise.all([
    Profile.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(l),
    Profile.countDocuments(query)
  ]);

  return { profiles: profiles, total, p, l };
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