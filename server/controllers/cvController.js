import CVProfile from '../models/CVProfile.js';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Initialize CV Profile for new user
export const initializeCVProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if CV profile already exists
    const existingProfile = await CVProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'CV Profile already exists for this user'
      });
    }

    // Create new CV profile with default values
    const newCVProfile = new CVProfile({
      userId,
      description: '',
      phoneNumber: '',
      summary: '',
      workExperience: [],
      education: [],
      skills: [],
      languages: [],
      certifications: [],
      visibility: 'employers_only'
    });

    await newCVProfile.save();

    res.status(201).json({
      success: true,
      message: 'CV Profile initialized successfully',
      data: newCVProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error initializing CV Profile',
      error: error.message
    });
  }
};

// Get CV Profile by user ID
export const getCVProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const cvProfile = await CVProfile.findOne({ userId }).populate('userId', 'name email');

    if (!cvProfile) {
      return res.status(404).json({
        success: false,
        message: 'CV Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: cvProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching CV Profile',
      error: error.message
    });
  }
};

// Update CV Profile
export const updateCVProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Remove protected fields
    delete updateData.visibility;
    delete updateData.userId;
    delete updateData._id;

    let cvProfile = await CVProfile.findOne({ userId });

    if (!cvProfile) {
      // Create new profile if doesn't exist
      cvProfile = new CVProfile({
        userId,
        ...updateData,
        visibility: 'employers_only'
      });
    } else {
      // Update existing profile
      Object.assign(cvProfile, updateData);
    }

    await cvProfile.save();

    res.status(200).json({
      success: true,
      message: 'CV Profile updated successfully',
      data: cvProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating CV Profile',
      error: error.message
    });
  }
};

// Upload certification files
const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'certifications',
        public_id: `cert_${Date.now()}_${filename.replace(/\.[^/.]+$/, "")}`,
        format: 'pdf'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export const uploadCertificationFiles = async (req, res) => {
  try {
    const { userId } = req.params;
    const { certificationIndex, name, issuer, issueDate, expiryDate, credentialId } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const cvProfile = await CVProfile.findOne({ userId });
    if (!cvProfile) {
      return res.status(404).json({
        success: false,
        message: 'CV Profile not found'
      });
    }

    // Upload files to Cloudinary
    const uploadPromises = req.files.map(file =>
      uploadToCloudinary(file.buffer, file.originalname)
    );

    const uploadResults = await Promise.all(uploadPromises);

    // Format files for database
    const files = uploadResults.map(result => ({
      url: result.secure_url,
      public_id: result.public_id
    }));

    // Add files to specific certification or create new certification
    const certIndex = parseInt(certificationIndex);
    if (certIndex >= 0 && certIndex < cvProfile.certifications.length) {
      // Add to existing certification
      cvProfile.certifications[certIndex].files.push(...files);
    } else {
      // Create new certification with files
      cvProfile.certifications.push({
        name: name || '',
        issuer: issuer || '',
        issueDate: issueDate || null,
        expiryDate: expiryDate || null,
        credentialId: credentialId || '',
        files: files
      });
    }

    await cvProfile.save();

    res.status(200).json({
      success: true,
      message: 'Certification files uploaded successfully',
      data: cvProfile.certifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading certification files',
      error: error.message
    });
  }
};

// Delete certification file
export const deleteCertificationFile = async (req, res) => {
  try {
    const { userId, certificationId, filePublicId } = req.params;

    const cvProfile = await CVProfile.findOne({ userId });
    if (!cvProfile) {
      return res.status(404).json({
        success: false,
        message: 'CV Profile not found'
      });
    }

    // Find and update certification
    const certification = cvProfile.certifications.id(certificationId);
    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    // Remove file from certification
    certification.files = certification.files.filter(
      file => file.public_id !== filePublicId
    );

    // Delete file from Cloudinary
    await cloudinary.uploader.destroy(filePublicId, {
      resource_type: 'raw'
    });

    await cvProfile.save();

    res.status(200).json({
      success: true,
      message: 'Certification file deleted successfully',
      data: cvProfile.certifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting certification file',
      error: error.message
    });
  }
};

// Get CV Profile completion status
export const getCVProfileCompletion = async (req, res) => {
  try {
    const { userId } = req.params;

    const cvProfile = await CVProfile.findOne({ userId });
    if (!cvProfile) {
      return res.status(404).json({
        success: false,
        message: 'CV Profile not found'
      });
    }

    const completionPercentage = cvProfile.completionPercentage;
    const isComplete = cvProfile.isComplete;

    res.status(200).json({
      success: true,
      data: {
        completionPercentage,
        isComplete,
        lastUpdated: cvProfile.lastUpdated
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching CV Profile completion status',
      error: error.message
    });
  }
};

// Delete entire CV Profile
export const deleteCVProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const cvProfile = await CVProfile.findOne({ userId });
    if (!cvProfile) {
      return res.status(404).json({
        success: false,
        message: 'CV Profile not found'
      });
    }

    // Delete all certification files from Cloudinary
    for (const certification of cvProfile.certifications) {
      for (const file of certification.files) {
        try {
          await cloudinary.uploader.destroy(file.public_id, {
            resource_type: 'raw'
          });
        } catch (cloudinaryError) {
          console.error('Error deleting file from Cloudinary:', cloudinaryError);
        }
      }
    }

    await CVProfile.findOneAndDelete({ userId });

    res.status(200).json({
      success: true,
      message: 'CV Profile deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting CV Profile',
      error: error.message
    });
  }
};

// Add new certification (without files initially)
export const addCertification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, issuer, issueDate, expiryDate, credentialId } = req.body;

    const cvProfile = await CVProfile.findOne({ userId });
    if (!cvProfile) {
      return res.status(404).json({
        success: false,
        message: 'CV Profile not found'
      });
    }

    cvProfile.certifications.push({
      name: name || '',
      issuer: issuer || '',
      issueDate: issueDate || null,
      expiryDate: expiryDate || null,
      credentialId: credentialId || '',
      files: []
    });

    await cvProfile.save();

    res.status(200).json({
      success: true,
      message: 'Certification added successfully',
      data: cvProfile.certifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding certification',
      error: error.message
    });
  }
};

// Delete certification
export const deleteCertification = async (req, res) => {
  try {
    const { userId, certificationId } = req.params;

    const cvProfile = await CVProfile.findOne({ userId });
    if (!cvProfile) {
      return res.status(404).json({
        success: false,
        message: 'CV Profile not found'
      });
    }

    // Find certification to delete its files from Cloudinary
    const certification = cvProfile.certifications.id(certificationId);
    if (certification) {
      // Delete all files from Cloudinary
      for (const file of certification.files) {
        try {
          await cloudinary.uploader.destroy(file.public_id, {
            resource_type: 'raw'
          });
        } catch (cloudinaryError) {
          console.error('Error deleting file from Cloudinary:', cloudinaryError);
        }
      }
    }

    // Remove certification from array
    cvProfile.certifications.pull(certificationId);
    await cvProfile.save();

    res.status(200).json({
      success: true,
      message: 'Certification deleted successfully',
      data: cvProfile.certifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting certification',
      error: error.message
    });
  }
};