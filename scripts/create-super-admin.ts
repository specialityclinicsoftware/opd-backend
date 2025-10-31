import mongoose from 'mongoose';
import { User, UserRole } from '../src/models/user';
import { connectDatabase } from '../src/config/database';

// Command line arguments
// Usage: npm run create-super-admin [name] [email] [password] [phoneNumber]
// Example: npm run create-super-admin "Super Admin" "admin@example.com" "password123" "+1234567890"

async function createSuperAdmin() {
  try {
    console.log('🚀 Super Admin Creation Script\n');

    // Get arguments from command line
    const args = process.argv.slice(2);
    const name = args[0] || 'Super Admin';
    const email = args[1] || 'sammelvin2232002@gmail.com';
    const password = args[2] || '^YpzpcnO|Gy(6mD3>Odxh#|9_0]ogL';
    const phoneNumber = args[3] || undefined;

    console.log('📝 Creating super admin with:');
    console.log(`   Name: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Phone: ${phoneNumber || 'N/A'}`);
    console.log();

    // Validate password
    if (!password || password.length < 6) {
      console.log('❌ Password must be at least 6 characters long');
      process.exit(1);
    }

    // Connect to database
    await connectDatabase();
    console.log('✅ Connected to database\n');

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`❌ User with email "${email}" already exists!`);
      console.log(`   User ID: ${existingUser._id}`);
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   Active: ${existingUser.isActive}`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create super admin
    console.log('⏳ Creating super admin...');

    const superAdmin = new User({
      name,
      email,
      password, // Will be automatically hashed by pre-save hook
      role: UserRole.SUPER_ADMIN,
      phoneNumber: phoneNumber || undefined,
      isActive: true,
      // Note: NO hospitalId for SUPER_ADMIN role
    });

    await superAdmin.save();

    console.log('\n✅ Super admin created successfully!');
    console.log('\n📋 Details:');
    console.log(`   ID: ${superAdmin._id}`);
    console.log(`   Name: ${superAdmin.name}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Role: ${superAdmin.role}`);
    console.log(`   Phone: ${superAdmin.phoneNumber || 'N/A'}`);
    console.log(`   Active: ${superAdmin.isActive}`);
    console.log('\n🔐 You can now login with these credentials!');
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Password: ${password}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error creating super admin:', error.message);
    console.error(error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createSuperAdmin();
