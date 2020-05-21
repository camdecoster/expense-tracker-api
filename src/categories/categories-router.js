// Modules
const express = require("express");
const path = require("path");
const { requireAuth } = require("../middleware/jwt-auth");
const CategoriesService = require("./categories-service");

// Configuration
const categoriesRouter = express.Router();
const jsonBodyParser = express.json();

// Handle GET, POST on / endpoint
categoriesRouter
    .route("/")
    .all(requireAuth)
    // Get all categories that belong to user
    .get((req, res, next) => {
        // Get user info from auth check
        const { user } = req;

        // console.log(user);

        CategoriesService.getAllCategories(req.app.get("db"), user)
            .then((categories) => {
                res.json(CategoriesService.sanitizeCategories(categories));
            })
            .catch(next);
    })
    // Create new category for user
    .post(jsonBodyParser, (req, res, next) => {
        // Get user info from auth check
        const { user } = req;

        // Get category info from request, create new category object
        const { category_name, type, amount, description } = req.body;
        const newCategory = CategoriesService.sanitizeCategory({
            category_name,
            type,
            amount,
            description,
        });

        // Check to see if required category property is missing
        const requiredFields = ["category_name", "type", "amount"];
        for (const inputField of requiredFields)
            if (!req.body[inputField])
                return res.status(400).json({
                    error: {
                        message: `Missing '${inputField}' in request body`,
                    },
                });

        // Check if category name already used
        CategoriesService.hasCategoryWithName(
            req.app.get("db"),
            user,
            category_name
        ).then((existingCategory) => {
            if (!!existingCategory)
                return res.status(400).json({
                    error: {
                        message: `Category name '${category_name}' already used`,
                    },
                });

            // Add user_id, date_created to category object
            newCategory.user_id = user.id;
            newCategory.date_created = new Date().toISOString();

            // CONSIDER CHECKING FOR LEADING SPACES ON INPUTS

            // Add category to database; return category path, info
            CategoriesService.createCategory(req.app.get("db"), newCategory)
                .then((category) => {
                    res.status(201)
                        // Add location but remove '/api' from string
                        .location(
                            path.posix.join(
                                req.originalUrl.slice(4),
                                `/${category.id}`
                            )
                        )
                        .json(CategoriesService.sanitizeCategory(category));
                })
                .catch(next);
        });
    });

// Handle GET, DELETE, PATCH on /:category_id endpoint
categoriesRouter
    .route("/:category_id")
    .all(requireAuth)
    .all(checkCategoryIdExists)
    // Return category info
    .get((req, res, next) => {
        res.json(CategoriesService.sanitizeCategory(res.category));
    })
    // Update category info
    .patch(jsonBodyParser, (req, res, next) => {
        // Get user info from auth check
        const { user } = req;

        // Get updated info from request, create updated category object
        const { id, category_name, type, amount, description } = req.body;

        const categoryToUpdate = CategoriesService.sanitizeCategory({
            category_name,
            type,
            amount,
            description,
        });

        // Check to see if required category property is missing
        for (const [key, value] of Object.entries(categoryToUpdate)) {
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` },
                });
        }

        CategoriesService.hasCategoryWithName(
            req.app.get("db"),
            user,
            category_name
        ).then((existingCategory) => {
            // Check if there's an existing category with updated name that
            // isn't the current category
            if (!!existingCategory) {
                if (existingCategory.id !== id) {
                    return res.status(400).json({
                        error: {
                            message: `Category name '${category_name}' already used`,
                        },
                    });
                }
            }

            // Add date_modified field, update to now
            categoryToUpdate.date_modified = new Date().toISOString();

            // CONSIDER CHECKING FOR LEADING SPACES ON INPUTS

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
        });
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
async function checkCategoryIdExists(req, res, next) {
    try {
        const category = await CategoriesService.getById(
            req.app.get("db"),
            req.user,
            req.params.category_id
        );

        if (!category)
            return res.status(404).json({
                error: { message: `Category ID doesn't exist` },
            });

        res.category = category;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = categoriesRouter;
