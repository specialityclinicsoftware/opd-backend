import mongoose, { Schema, Document } from 'mongoose';
import { IPharmacyInventory } from '../types';

export interface IPharmacyInventoryDocument extends IPharmacyInventory, Document {}

export enum ItemCategory {
  TABLET = 'tablet',
  CAPSULE = 'capsule',
  SYRUP = 'syrup',
  INJECTION = 'injection',
  OINTMENT = 'ointment',
  DROPS = 'drops',
  INHALER = 'inhaler',
  SUSPENSION = 'suspension',
  POWDER = 'powder',
  OTHER = 'other'
}

const PharmacyInventorySchema: Schema = new Schema(
  {
    // Hospital Info
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },

    // Item Details
    itemName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    genericName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(ItemCategory),
      required: true,
      index: true,
    },
    manufacturer: {
      type: String,
      trim: true,
    },

    // Inventory Details
    batchNumber: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: Date,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minStockLevel: {
      type: Number,
      default: 10,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      default: 'pieces',
    },

    // Pricing
    purchasePrice: {
      type: Number,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      min: 0,
    },
    mrp: {
      type: Number,
      min: 0,
    },

    // Additional Info
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },

    // Tracking
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
PharmacyInventorySchema.index({ hospitalId: 1, itemName: 1 });
PharmacyInventorySchema.index({ hospitalId: 1, category: 1 });
PharmacyInventorySchema.index({ hospitalId: 1, isActive: 1 });
PharmacyInventorySchema.index({ hospitalId: 1, expiryDate: 1 });
PharmacyInventorySchema.index({ hospitalId: 1, quantity: 1 }); // For low stock queries

// Text index for search functionality
PharmacyInventorySchema.index({ itemName: 'text', genericName: 'text', manufacturer: 'text' });

export default mongoose.model<IPharmacyInventoryDocument>(
  'PharmacyInventory',
  PharmacyInventorySchema
);
