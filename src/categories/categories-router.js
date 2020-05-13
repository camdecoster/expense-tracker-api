// Modules
const express = require("express");
const path = require("path");
const xss = require("xss");
const { requireAuth } = require("../middleware/jwt-auth");
const CategoriesService = require("./categories-service");

// Configuration
const categoriesRouter = express.Router();
const jsonBodyParser = express.json();

// Clean out malicious scripts from category
function sanitizeCategory(category) {
    return {
        category_name: xss(category.category_name),
        type: xss(category.type),
        amount: xss(category.amount),
        description: xss(category.description),
    };
}

// Handle GET, POST on / endpoint
categoriesRouter
    .route("/")
    .all(requireAuth)
    // Get all categories that belong to user
    .get((req, res, next) => {
        // Get user info from auth check
        const { user } = req;

        CategoriesService.getAllCategories(req.app.get("db"), user)
            .then((categories) => {
                res.json(categories);
            })
            .catch(next);
    })
    // Create new category for user
    .post(jsonBodyParser, (req, res, next) => {
        // Get user info from auth check
        const { user } = req;

        // Get category info from request, create new category object
        const { name, type, amount, description } = req.body;
        const newCategory = sanitizeCategory({
            category_name: name,
            type,
            amount,
            description,
        });

        // Check to see if required category property is missing
        for (const [key, value] of Object.entries(newCategory)) {
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` },
                });
        }

        // Add user_id, date_created to category object
        newCategory.user_id = user.id;
        newCategory.date_created = new Date().toISOString();

        // Add category to database; return category path, info
        CategoriesService.createCategory(req.app.get("db"), newCategory)
            .then((category) => {
                res.status(201)
                    .location(
                        path.posix.join(req.originalUrl, `/${category.id}`)
                    )
                    .json(category);
            })
            .catch(next);
    });

// Handle GET, DELETE, PATCH on /:category_id endpoint
categoriesRouter
    .route("/:category_id")
    .all(requireAuth)
    .all(checkCategoryExists)
    // Return category info
    .get((req, res, next) => {
        res.json(res.category);
    })
    // Update category info
    .patch(jsonBodyParser, (req, res, next) => {
        console.log("Trying to PATCH category");

        // Get updated info from request, create updated category object
        const { name, type, amount, description } = req.body;
        const categoryToUpdate = sanitizeCategory({
            category_name: name,
            type,
            amount,
            description,
        });

        // Check to see if required category property is missing
        for (const [key, value] of Object.entries(categoryToUpdate)) {
            if (value == null)
                return res.status(400).json({
                    error: {
                        message: `Request body must contain 'name', 'type', amount, and 'description'`,
                    },
                });
        }

        // Add date_modified field, update to now
        categoryToUpdate.date_modified = new Date().toISOString();

        // Perform category update
        CategoriesService.updateCategory(
            req.app.get("db"),
            req.params.category_id,
            categoryToUpdate
        )
            .then((numRowsAffected) => {
                res.status(204).end();
            })
            .catch(next);
    })
    // Delete category from database
    .delete((req, res, next) => {
        CategoriesService.deleteCategory(
            req.app.get("db"),
            req.params.category_id
        )
            .then((numRowsAffected) => {
                res.status(204).end();
            })
            .catch(next);
    });

/* async/await syntax for promises */
async function checkCategoryExists(req, res, next) {
    try {
        const category = await CategoriesService.getById(
            req.app.get("db"),
            req.user,
            req.params.category_id
        );

        if (!category)
            return res.status(404).json({
                error: `Category doesn't exist`,
            });

        res.category = category;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = categoriesRouter;
