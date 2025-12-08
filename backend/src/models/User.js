import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Meno je povinné"],
      trim: true,
      minlength: [2, "Meno musí mať aspoň 2 znaky"],
    },
    email: {
      type: String,
      required: [true, "Email je povinný"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Neplatný email"],
    },
    password: {
      type: String,
      required: [true, "Heslo je povinné"],
      minlength: [6, "Heslo musí mať aspoň 6 znakov"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

export default mongoose.model("User", userSchema);
