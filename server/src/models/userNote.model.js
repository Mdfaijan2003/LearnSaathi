import mongoose from "mongoose";

const userNoteSchema = new mongoose.Schema(
{
  /*  OWNER */
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  /*  CONTEXT (ONE REQUIRED) */
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    index: true
  },

  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    index: true
  },

  /* 📝 NOTE DATA */
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 120
  },

  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },

  /* VIDEO TIMESTAMP */
  timestamp: {
    type: Number,
    min: 0,
    default: null
  },

  /*  TAGS */
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function (val) {
        return val.length <= 10;
      },
      message: "Max 10 tags allowed"
    }
  },

  /* PIN */
  isPinned: {
    type: Boolean,
    default: false,
    index: true
  },

  /* AI FIELDS (FUTURE READY) */
  aiSummary: {
    type: String
  },

  aiExplanation: {
    type: String
  },

  lastEditedAt: {
    type: Date,
    default: Date.now
  }

},
{ timestamps: true }
);


// fast filtering
userNoteSchema.index({ user: 1, video: 1 });
userNoteSchema.index({ user: 1, topic: 1 });

// sorting + dashboard
userNoteSchema.index({ user: 1, isPinned: 1, createdAt: -1 });

// search
userNoteSchema.index({ title: "text", content: "text" });


userNoteSchema.pre("save", function (next) {

  // must have either video OR topic
  if (!this.video && !this.topic) {
    return next(new Error("Note must be linked to video or topic"));
  }

  // prevent both (optional rule)
  if (this.video && this.topic) {
    return next(new Error("Note cannot have both video and topic"));
  }

  // update edit time
  this.lastEditedAt = new Date();

  // next();
});



userNoteSchema.pre("findOneAndUpdate", function (next) {
  this.set({ lastEditedAt: new Date() });
  next();
});


const UserNote = mongoose.model("UserNote", userNoteSchema);

export default UserNote;