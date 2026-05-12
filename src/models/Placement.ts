import mongoose, { Schema, Document, Model } from "mongoose";

const branchPlacementSchema = new Schema(
  {
    branch: { type: String, required: true, trim: true },
    highestPackage: { type: Number, required: true },
    averagePackage: { type: Number, required: true },
    lowestPackage: { type: Number, required: true },
    placementPercentage: { type: Number, min: 0, max: 100, required: true },
    studentsPlaced: { type: Number, required: true },
    totalStudents: { type: Number, required: true },
  },
  { _id: false }
);

const yearlyPlacementSchema = new Schema(
  {
    year: { type: Number, required: true },
    placements: { type: [branchPlacementSchema], required: true },
  },
  { _id: false }
);

export interface IPlacementDocument extends Document {
  college: mongoose.Types.ObjectId;
  yearlyPlacements: {
    year: number;
    placements: {
      branch: string;
      highestPackage: number;
      averagePackage: number;
      lowestPackage: number;
      placementPercentage: number;
      studentsPlaced: number;
      totalStudents: number;
    }[];
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const placementSchema = new Schema<IPlacementDocument>(
  {
    college: { type: Schema.Types.ObjectId, ref: "College", required: true, unique: true },
    yearlyPlacements: { type: [yearlyPlacementSchema], default: [] },
  },
  { timestamps: true }
);

const Placement: Model<IPlacementDocument> =
  mongoose.models.Placement ||
  mongoose.model<IPlacementDocument>("Placement", placementSchema);

export default Placement;
