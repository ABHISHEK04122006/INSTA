import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    resetPasswordOtpHash: {
      type: String,
      select: false,
    },
    resetPasswordOtpExpiresAt: {
      type: Date,
      select: false,
    },
    resetPasswordOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    resetPasswordLastSentAt: {
      type: Date,
      select: false,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 150,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    username: this.username,
    fullName: this.fullName,
    avatar: this.avatar,
    bio: this.bio,
    followersCount: this.followers?.length || 0,
    followingCount: this.following?.length || 0,
    isPrivate: this.isPrivate,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);
export default User;
