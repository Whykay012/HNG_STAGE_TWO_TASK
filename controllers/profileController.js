const profileService = require('../services/profileService');
const { BadRequestError, NotFoundError, UnprocessableEntityError } = require('../utils/customErrors');

// UUID v7 Regex: 8-4-4-4-12 format, version 7
const isValidUUIDv7 = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

exports.getAllProfiles = async (req, res, next) => {
  try {
    // Check if sort_by is valid if it exists
    const { sort_by } = req.query;
    const allowedSorts = ['age', 'created_at', 'gender_probability'];
    if (sort_by && !allowedSorts.includes(sort_by)) {
      return res.status(400).json({ status: "error", message: "Invalid query parameters" });
    }

    const result = await profileService.fetchProfiles(req.query);
    
    // The bot expects this exact structure
    res.status(200).json({
      status: "success",
      page: result.p,
      limit: result.l,
      total: result.total,
      data: result.profiles
    });
  } catch (err) {
    res.status(400).json({ status: "error", message: "Invalid query parameters" });
  }
};


exports.searchProfiles = async (req, res, next) => {
  try {
    const { q, page, limit } = req.query;
    if (!q) return res.status(400).json({ status: "error", message: "Missing or empty parameter" });

    const queryText = q.toLowerCase();
    const filters = { 
        page: parseInt(page) || 1, 
        limit: parseInt(limit) || 10 
    };

    // NLP Mapping - Use separate IFs to allow for broader matches
    if (queryText.includes("female")) filters.gender = "female";
    if (queryText.includes("male") && !queryText.includes("female")) filters.gender = "male"; 
    // ^ The check above prevents "female" being caught by "male"

    if (queryText.includes("young")) {
      filters.min_age = 16;
      filters.max_age = 24;
    }

    ["child", "teenager", "adult", "senior"].forEach(group => {
      if (queryText.includes(group)) filters.age_group = group;
    });

    const aboveMatch = queryText.match(/above (\d+)/);
    if (aboveMatch) filters.min_age = parseInt(aboveMatch[1]) + 1;

    const countryMap = { "nigeria": "NG", "kenya": "KE", "angola": "AO", "benin": "BJ" };
    Object.keys(countryMap).forEach(c => {
      if (queryText.includes(c)) filters.country_id = countryMap[c];
    });

    const extractedKeys = Object.keys(filters).filter(k => k !== 'page' && k !== 'limit');
    if (extractedKeys.length === 0) {
      return res.status(400).json({ status: "error", message: "Unable to interpret query" });
    }

    const result = await profileService.fetchProfiles(filters);
    res.status(200).json({
      status: "success",
      page: result.p,
      limit: result.l,
      total: result.total,
      data: result.profiles
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    if (!isValidUUIDv7(req.params.id)) throw new UnprocessableEntityError("Invalid UUID format");
    
    const profile = await profileService.getById(req.params.id);
    if (!profile) throw new NotFoundError();
    res.status(200).json({ status: "success", data: profile });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    if (!isValidUUIDv7(req.params.id)) throw new UnprocessableEntityError("Invalid UUID format");
    
    const profile = await profileService.updateById(req.params.id, req.body);
    if (!profile) throw new NotFoundError();
    res.status(200).json({ status: "success", data: profile });
  } catch (err) { next(err); }
};

exports.deleteProfile = async (req, res, next) => {
  try {
    if (!isValidUUIDv7(req.params.id)) throw new UnprocessableEntityError("Invalid UUID format");
    
    const profile = await profileService.deleteById(req.params.id);
    if (!profile) throw new NotFoundError();
    res.status(204).send();
  } catch (err) { next(err); }
};