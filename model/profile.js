const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  _id: { type: String }, // UUID v7
  name: { type: String, required: true, unique: true, lowercase: true },
  gender: { type: String, enum: ['male', 'female'] },
  gender_probability: Number,
  age: { type: Number, index: true },
  age_group: { type: String, enum: ['child', 'teenager', 'adult', 'senior'], index: true },
  country_id: { type: String, uppercase: true, index: true },
  country_name: String,
  country_probability: Number,
  created_at: { type: Date, default: Date.now, index: true }
}, {
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      ret.created_at = ret.created_at instanceof Date ? ret.created_at.toISOString() : ret.created_at;
      return ret;
    }
  }
});

module.exports = mongoose.model('Profile', ProfileSchema);