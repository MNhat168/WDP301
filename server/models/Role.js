import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  roleName: { 
    type: String,
    required: true,
    unique: true,
    enum: ['ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_JOBSEEKER']
  }
}, { 
  timestamps: true 
});

const Role = mongoose.model('Role', roleSchema);

export default Role;