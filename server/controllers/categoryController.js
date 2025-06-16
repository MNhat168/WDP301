import Category from '../models/Category.js';
import asyncHandler from 'express-async-handler';

// Get all categories
export const getCategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (page - 1) * limit;

  const [categories, total] = await Promise.all([
    Category.find({})
      .sort({ categoryName: 1 })
      .skip(skip)
      .limit(limit),
    Category.countDocuments({})
  ]);

  return res.status(200).json({
    status: categories ? true : false,
    code: categories ? 200 : 400,
    message: categories ? 'Get all categories successfully' : 'Get all categories failed',
    result: categories ? {
      categories,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    } : 'Something went wrong!!!!',
  });
});

// Get category by ID
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      status: false,
      code: 404,
      message: 'Category not found',
      result: 'Category not found',
    });
  }

  return res.status(200).json({
    status: true,
    code: 200,
    message: 'Get category successfully',
    result: category,
  });
});

// Create new category
export const createCategory = asyncHandler(async (req, res) => {
  const { categoryName } = req.body;

  if (!categoryName) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Category name is required',
      result: 'Category name is required',
    });
  }

  const existingCategory = await Category.findOne({ 
    categoryName: { $regex: new RegExp('^' + categoryName + '$', 'i') } 
  });

  if (existingCategory) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Category already exists',
      result: 'Category already exists',
    });
  }

  const category = await Category.create({ categoryName });

  return res.status(201).json({
    status: category ? true : false,
    code: category ? 201 : 400,
    message: category ? 'Create category successfully' : 'Create category failed',
    result: category ? category : 'Something went wrong!!!!',
  });
}); 