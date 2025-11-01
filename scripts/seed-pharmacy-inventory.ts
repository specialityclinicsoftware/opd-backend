import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PharmacyInventory, { ItemCategory } from '../src/models/pharmacy-inventory';
import { connectDatabase } from '../src/config/database';
import { Account } from '../src/models/account';

// Load environment variables
dotenv.config();

// Usage: npm run seed-pharmacy [hospitalId]
// Example: npm run seed-pharmacy 507f1f77bcf86cd799439011

const dummyInventoryData = [
  // Tablets
  {
    itemName: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    category: ItemCategory.TABLET,
    manufacturer: 'Sun Pharma',
    batchNumber: 'BATCH2024001',
    expiryDate: new Date('2025-12-31'),
    quantity: 1000,
    minStockLevel: 100,
    unit: 'tablets',
    purchasePrice: 2.50,
    sellingPrice: 5.00,
    mrp: 6.00,
    description: 'Pain reliever and fever reducer',
    location: 'Shelf A3',
  },
  {
    itemName: 'Amoxicillin 250mg',
    genericName: 'Amoxicillin',
    category: ItemCategory.TABLET,
    manufacturer: 'Cipla',
    batchNumber: 'BATCH2024002',
    expiryDate: new Date('2026-06-30'),
    quantity: 45,
    minStockLevel: 50,
    unit: 'tablets',
    purchasePrice: 8.00,
    sellingPrice: 15.00,
    mrp: 18.00,
    description: 'Antibiotic for bacterial infections',
    location: 'Shelf B1',
  },
  {
    itemName: 'Azithromycin 500mg',
    genericName: 'Azithromycin',
    category: ItemCategory.TABLET,
    manufacturer: 'Dr. Reddy\'s',
    batchNumber: 'BATCH2024003',
    expiryDate: new Date('2025-03-15'),
    quantity: 120,
    minStockLevel: 30,
    unit: 'tablets',
    purchasePrice: 12.00,
    sellingPrice: 22.00,
    mrp: 25.00,
    description: 'Macrolide antibiotic',
    location: 'Shelf B2',
  },
  {
    itemName: 'Metformin 500mg',
    genericName: 'Metformin',
    category: ItemCategory.TABLET,
    manufacturer: 'Zydus Cadila',
    batchNumber: 'BATCH2024004',
    expiryDate: new Date('2026-09-30'),
    quantity: 500,
    minStockLevel: 100,
    unit: 'tablets',
    purchasePrice: 3.00,
    sellingPrice: 6.00,
    mrp: 8.00,
    description: 'Diabetes medication',
    location: 'Shelf C1',
  },
  {
    itemName: 'Amlodipine 5mg',
    genericName: 'Amlodipine',
    category: ItemCategory.TABLET,
    manufacturer: 'Lupin',
    batchNumber: 'BATCH2024005',
    expiryDate: new Date('2026-11-30'),
    quantity: 300,
    minStockLevel: 80,
    unit: 'tablets',
    purchasePrice: 4.50,
    sellingPrice: 9.00,
    mrp: 11.00,
    description: 'Blood pressure medication',
    location: 'Shelf C2',
  },

  // Capsules
  {
    itemName: 'Omeprazole 20mg',
    genericName: 'Omeprazole',
    category: ItemCategory.CAPSULE,
    manufacturer: 'Sun Pharma',
    batchNumber: 'BATCH2024006',
    expiryDate: new Date('2026-08-31'),
    quantity: 200,
    minStockLevel: 50,
    unit: 'capsules',
    purchasePrice: 5.00,
    sellingPrice: 10.00,
    mrp: 12.00,
    description: 'Proton pump inhibitor for acid reflux',
    location: 'Shelf D1',
  },
  {
    itemName: 'Vitamin D3 60000 IU',
    genericName: 'Cholecalciferol',
    category: ItemCategory.CAPSULE,
    manufacturer: 'Abbott',
    batchNumber: 'BATCH2024007',
    expiryDate: new Date('2026-12-31'),
    quantity: 150,
    minStockLevel: 40,
    unit: 'capsules',
    purchasePrice: 8.00,
    sellingPrice: 16.00,
    mrp: 20.00,
    description: 'Vitamin D supplement',
    location: 'Shelf D2',
  },

  // Syrups
  {
    itemName: 'Cough Syrup 100ml',
    genericName: 'Dextromethorphan',
    category: ItemCategory.SYRUP,
    manufacturer: 'Himalaya',
    batchNumber: 'BATCH2024010',
    expiryDate: new Date('2025-02-28'),
    quantity: 30,
    minStockLevel: 10,
    unit: 'bottles',
    purchasePrice: 45.00,
    sellingPrice: 85.00,
    mrp: 95.00,
    description: 'Cough suppressant',
    location: 'Shelf C5',
  },
  {
    itemName: 'Cetirizine Syrup 60ml',
    genericName: 'Cetirizine',
    category: ItemCategory.SYRUP,
    manufacturer: 'GSK',
    batchNumber: 'BATCH2024011',
    expiryDate: new Date('2026-05-31'),
    quantity: 80,
    minStockLevel: 20,
    unit: 'bottles',
    purchasePrice: 35.00,
    sellingPrice: 65.00,
    mrp: 75.00,
    description: 'Antihistamine for allergies',
    location: 'Shelf E1',
  },

  // Injections
  {
    itemName: 'Insulin Glargine 100IU/ml',
    genericName: 'Insulin Glargine',
    category: ItemCategory.INJECTION,
    manufacturer: 'Novo Nordisk',
    batchNumber: 'BATCH2024012',
    expiryDate: new Date('2025-08-30'),
    quantity: 5,
    minStockLevel: 20,
    unit: 'vials',
    purchasePrice: 750.00,
    sellingPrice: 850.00,
    mrp: 950.00,
    description: 'Long-acting insulin',
    location: 'Refrigerator R1',
    notes: 'Store between 2-8°C',
  },
  {
    itemName: 'Dexamethasone 4mg/ml',
    genericName: 'Dexamethasone',
    category: ItemCategory.INJECTION,
    manufacturer: 'Cipla',
    batchNumber: 'BATCH2024013',
    expiryDate: new Date('2026-03-31'),
    quantity: 100,
    minStockLevel: 30,
    unit: 'ampules',
    purchasePrice: 15.00,
    sellingPrice: 30.00,
    mrp: 35.00,
    description: 'Corticosteroid injection',
    location: 'Shelf F1',
  },

  // Ointments
  {
    itemName: 'Betamethasone Cream 15g',
    genericName: 'Betamethasone',
    category: ItemCategory.OINTMENT,
    manufacturer: 'GSK',
    batchNumber: 'BATCH2024014',
    expiryDate: new Date('2026-07-31'),
    quantity: 60,
    minStockLevel: 15,
    unit: 'tubes',
    purchasePrice: 25.00,
    sellingPrice: 50.00,
    mrp: 60.00,
    description: 'Topical corticosteroid',
    location: 'Shelf G1',
  },
  {
    itemName: 'Mupirocin Ointment 5g',
    genericName: 'Mupirocin',
    category: ItemCategory.OINTMENT,
    manufacturer: 'Sun Pharma',
    batchNumber: 'BATCH2024015',
    expiryDate: new Date('2026-04-30'),
    quantity: 40,
    minStockLevel: 10,
    unit: 'tubes',
    purchasePrice: 35.00,
    sellingPrice: 65.00,
    mrp: 75.00,
    description: 'Antibiotic ointment',
    location: 'Shelf G2',
  },

  // Drops
  {
    itemName: 'Eye Drops Timolol 0.5%',
    genericName: 'Timolol',
    category: ItemCategory.DROPS,
    manufacturer: 'Alcon',
    batchNumber: 'BATCH2024016',
    expiryDate: new Date('2025-10-31'),
    quantity: 25,
    minStockLevel: 10,
    unit: 'bottles',
    purchasePrice: 55.00,
    sellingPrice: 95.00,
    mrp: 110.00,
    description: 'Glaucoma eye drops',
    location: 'Shelf H1',
  },
  {
    itemName: 'Ear Drops Ciprofloxacin',
    genericName: 'Ciprofloxacin',
    category: ItemCategory.DROPS,
    manufacturer: 'Cipla',
    batchNumber: 'BATCH2024017',
    expiryDate: new Date('2026-02-28'),
    quantity: 35,
    minStockLevel: 12,
    unit: 'bottles',
    purchasePrice: 40.00,
    sellingPrice: 75.00,
    mrp: 85.00,
    description: 'Antibiotic ear drops',
    location: 'Shelf H2',
  },

  // Inhalers
  {
    itemName: 'Salbutamol Inhaler',
    genericName: 'Salbutamol',
    category: ItemCategory.INHALER,
    manufacturer: 'GSK',
    batchNumber: 'BATCH2024018',
    expiryDate: new Date('2026-09-30'),
    quantity: 30,
    minStockLevel: 15,
    unit: 'inhalers',
    purchasePrice: 85.00,
    sellingPrice: 150.00,
    mrp: 175.00,
    description: 'Bronchodilator for asthma',
    location: 'Shelf I1',
  },
  {
    itemName: 'Budesonide Inhaler 200mcg',
    genericName: 'Budesonide',
    category: ItemCategory.INHALER,
    manufacturer: 'AstraZeneca',
    batchNumber: 'BATCH2024019',
    expiryDate: new Date('2026-11-30'),
    quantity: 20,
    minStockLevel: 10,
    unit: 'inhalers',
    purchasePrice: 200.00,
    sellingPrice: 350.00,
    mrp: 400.00,
    description: 'Corticosteroid inhaler',
    location: 'Shelf I2',
  },

  // Suspensions
  {
    itemName: 'Amoxicillin Suspension 125mg/5ml',
    genericName: 'Amoxicillin',
    category: ItemCategory.SUSPENSION,
    manufacturer: 'Cipla',
    batchNumber: 'BATCH2024020',
    expiryDate: new Date('2025-12-31'),
    quantity: 50,
    minStockLevel: 15,
    unit: 'bottles',
    purchasePrice: 45.00,
    sellingPrice: 80.00,
    mrp: 90.00,
    description: 'Antibiotic suspension for children',
    location: 'Shelf E2',
  },
];

async function seedPharmacyInventory() {
  try {
    console.log('🏥 Pharmacy Inventory Seed Script\n');

    // Get hospitalId from command line or use first hospital
    const args = process.argv.slice(2);
    let hospitalId = args[0];

    // Connect to database
    await connectDatabase();
    console.log('✅ Connected to database\n');

    // If no hospitalId provided, find the first hospital
    if (!hospitalId) {
      const hospital = await Account.findOne({ isActive: true });
      if (!hospital) {
        console.log('❌ No hospitals found in database!');
        console.log('💡 Please create a hospital first or provide hospitalId as argument');
        await mongoose.connection.close();
        process.exit(1);
      }
      hospitalId = hospital._id.toString();
      console.log(`📍 Using hospital: ${hospital.hospitalName} (${hospitalId})\n`);
    } else {
      const hospital = await Account.findById(hospitalId);
      if (!hospital) {
        console.log(`❌ Hospital with ID "${hospitalId}" not found!`);
        await mongoose.connection.close();
        process.exit(1);
      }
      console.log(`📍 Using hospital: ${hospital.hospitalName} (${hospitalId})\n`);
    }

    // Check if inventory already exists for this hospital
    const existingCount = await PharmacyInventory.countDocuments({ hospitalId });
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing inventory items for this hospital`);
      console.log('❓ Do you want to add more items? (This will not delete existing items)\n');
    }

    // Add hospitalId to all items
    const inventoryItems = dummyInventoryData.map(item => ({
      ...item,
      hospitalId,
      isActive: true,
    }));

    console.log(`⏳ Adding ${inventoryItems.length} inventory items...\n`);

    // Insert all items
    const result = await PharmacyInventory.insertMany(inventoryItems);

    console.log(`✅ Successfully added ${result.length} inventory items!\n`);

    // Show summary by category
    console.log('📊 Summary by Category:');
    const categoryCounts: Record<string, number> = {};
    result.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} items`);
    });

    // Show low stock items
    const lowStockItems = result.filter(item => item.quantity <= item.minStockLevel);
    if (lowStockItems.length > 0) {
      console.log(`\n⚠️  Low Stock Items (${lowStockItems.length}):`);
      lowStockItems.forEach(item => {
        console.log(`   - ${item.itemName}: ${item.quantity}/${item.minStockLevel} ${item.unit}`);
      });
    }

    // Show expiring soon items (within 90 days)
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    const expiringSoon = result.filter(item => item.expiryDate && item.expiryDate <= ninetyDaysFromNow);

    if (expiringSoon.length > 0) {
      console.log(`\n⏰ Expiring Soon (within 90 days) - ${expiringSoon.length} items:`);
      expiringSoon.forEach(item => {
        const daysUntilExpiry = Math.floor((item.expiryDate!.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        console.log(`   - ${item.itemName}: Expires in ${daysUntilExpiry} days (${item.expiryDate?.toLocaleDateString()})`);
      });
    }

    console.log('\n✨ Pharmacy inventory seeding completed successfully!');
    console.log(`\n💡 You can now access the inventory at:`);
    console.log(`   GET /api/pharmacy/hospital/${hospitalId}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: unknown) {
    console.error('\n❌ Error seeding pharmacy inventory:', (error as Error).message);
    console.error((error as Error).stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedPharmacyInventory();
