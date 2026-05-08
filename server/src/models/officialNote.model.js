import mongoose from "mongoose";

const officialNoteSchema = new mongoose.Schema(

{

  /* =====================================================
     BASIC
  ===================================================== */

  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 150,
    index: true,
    validate: {
      validator: v => v.trim().length > 0,
      message: "Title cannot be empty"
    }
  },

  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },

  slug: {
    type: String,
    unique: true,
    index: true
  },

  noteType: {
    type: String,
    enum: [
      "notes",
      "slides",
      "assignment",
      "formula-sheet",
      "audio-note"
    ],
    default: "notes",
    index: true
  },

  /* =====================================================
     FILE
  ===================================================== */

  fileUrl: {
    type: String,
    required: true,
    validate: {
      validator: v => /^https?:\/\/.+/.test(v),
      message: "Invalid file URL"
    }
  },

  filePublicId: {
    type: String,
    required: true
  },

  fileType: {
    type: String,
    enum: [
      "pdf",
      "docx",
      "pptx",
      "xlsx",
      "zip",
      "mp3",
      "wav"
    ],
    required: true,
    index: true
  },

  fileSize: {
    type: Number,
    min: 0,
    max: 100 * 1024 * 1024 // 100MB
  },

  thumbnail: {
    type: String,
    default: null
  },

  /* =====================================================
     HIERARCHY
  ===================================================== */

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
    index: true
  },

  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Program",
    default: null,
    index: true
  },

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    default: null,
    index: true
  },

  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter",
    default: null,
    index: true
  },

  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    default: null,
    index: true
  },

  /* =====================================================
     OWNER
  ===================================================== */

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  /* =====================================================
     ACCESS CONTROL
  ===================================================== */

  accessLevel: {
    type: String,
    enum: ["free", "premium"],
    default: "free",
    index: true
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  /* =====================================================
     ANALYTICS
  ===================================================== */

  views: {
    type: Number,
    default: 0,
    min: 0
  },

  downloads: {
    type: Number,
    default: 0,
    min: 0
  }

},

{
  timestamps: true
}

);


/* =====================================================
   SEARCH INDEX
===================================================== */

officialNoteSchema.index({
  title: "text",
  description: "text"
});


/* =====================================================
   FILTER INDEXES
===================================================== */

officialNoteSchema.index({
  category: 1,
  createdAt: -1
});

officialNoteSchema.index({
  topic: 1,
  createdAt: -1
});

officialNoteSchema.index({
  uploadedBy: 1,
  createdAt: -1
});

officialNoteSchema.index({
  downloads: -1
});


/* =====================================================
   DUPLICATE PREVENTION
===================================================== */

officialNoteSchema.index(
  { title: 1, topic: 1 },
  {
    unique: true,
    partialFilterExpression: {
      topic: { $exists: true },
      isActive: true
    }
  }
);

/* =====================================================
   SLUG GENERATION
===================================================== */

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};


officialNoteSchema.pre("save", async function () {
  if (!this.isModified("title")) return;
  const baseSlug = generateSlug(this.title);
  let slug = baseSlug;
  let count = 1;
  while (
    await mongoose.models.OfficialNote.findOne({
      slug,
      _id: { $ne: this._id }
    })
  ) {
    slug = `${baseSlug}-${count++}`;
  }
  this.slug = slug;
});


const OfficialNote = mongoose.model(
  "OfficialNote",
  officialNoteSchema
);

export default OfficialNote;