import mongoose, { Schema, Document } from 'mongoose';

export interface IPharmacySalesItem {
  inventoryId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  batchNumber?: string;
}

export interface IPharmacySales {
  hospitalId: string;
  patientId: string;
  visitId: string;
  prescriptionId: string; // Reference to MedicationHistory
  items: IPharmacySalesItem[];
  totalAmount: number;
  saleDate: Date;
  soldBy?: string; // User ID who processed the sale
}

export interface IPharmacySalesDocument extends IPharmacySales, Document {}

const PharmacySalesItemSchema = new Schema({
  inventoryId: {
    type: Schema.Types.ObjectId,
    ref: 'PharmacyInventory',
    required: true,
  },
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  batchNumber: {
    type: String,
    trim: true,
  },
});

const PharmacySalesSchema: Schema = new Schema(
  {
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    visitId: {
      type: Schema.Types.ObjectId,
      ref: 'Visit',
      required: true,
      index: true,
    },
    prescriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'MedicationHistory',
      required: true,
      index: true,
    },
    items: {
      type: [PharmacySalesItemSchema],
      required: true,
      validate: {
        validator: function (arr: any[]) {
          return arr.length > 0;
        },
        message: 'At least one item is required',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    saleDate: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    soldBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
PharmacySalesSchema.index({ hospitalId: 1, saleDate: -1 });
PharmacySalesSchema.index({ patientId: 1, saleDate: -1 });
PharmacySalesSchema.index({ visitId: 1 });

export default mongoose.model<IPharmacySalesDocument>(
  'PharmacySales',
  PharmacySalesSchema
);
