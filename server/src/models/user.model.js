import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    phoneNumber: {
      type: String,
      unique: true,
      sparse: true, // ✅ allows multiple users without phone
      trim: true,
      default: undefined
    },

    /* ================= MEDIA ================= */

    avatar: {
      type: String,
      default: ""
    },

    coverImage: {
      type: String,
      default: ""
    },

    /* ================= AUTH ================= */

    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      select: false
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },

    googleId: {
      type: String,
      index: true
    },

    /* ================= ROLE ================= */

    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student"
    },

    teacherStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: function () {
        return this.role === "teacher" ? "pending" : "approved";
      }
    },

    /* ================= VERIFICATION ================= */

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    isPhoneVerified: {
      type: Boolean,
      default: false
    },

    /* ================= SESSION (MULTI DEVICE) ================= */

    sessions: [
      {
        refreshToken: {
          type: String,
          required: true
        },
        userAgent: String,
        ip: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);



/* ================= INDEXES ================= */

// compound indexes (performance)
userSchema.index({ role: 1, teacherStatus: 1 });
userSchema.index({ email: 1, authProvider: 1 });



/* ================= PASSWORD HASH ================= */

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return ;

  this.password = await bcrypt.hash(this.password, 12);
  // next();
});



/* ================= METHODS ================= */

// password check
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

// safe response
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.sessions;
  return obj;
};


const User = mongoose.model("User", userSchema);
export default User;