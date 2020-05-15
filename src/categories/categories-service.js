// Modules
const xss = require("xss");

const CategoriesService = {
    // Create new category
    createCategory(db, newCategory) {
        return db
            .from("categories")
            .insert(newCategory)
            .returning("*")
            .then((rows) => {
                return rows[0];
            });
    },

    // Delete category from database
    deleteCategory(db, id) {
        return db.from("categories").where({ id }).delete();
    },

    // Get all categories owned by user
    getAllCategories(db, user) {
        return db
            .from("categories AS category")
            .select(
                "category.id",
                "category.category_name",
                "category.type",
                "category.amount",
                "category.description",
                "category.date_created",
                "category.date_modified"
            )
            .where("category.user_id", user.id);
    },

    // Get category with given ID
    getById(db, user, id) {
        return CategoriesService.getAllCategories(db, user)
            .where("category.id", id)
            .first();
    },

    // Remove any XSS attack scripts from multiple categories
    sanitizeCategories(categories) {
        return categories.map(this.sanitizeCategory);
    },

    // Remove any XSS attack scripts from single category
    sanitizeCategory(category) {
        return {
            ...category,
            category_name: xss(category.category_name),
            type: xss(category.type),
            amount: xss(category.amount),
            description: xss(category.description),
        };
    },

    // Update category with new info
    updateCategory(db, id, categoryToUpdate) {
        return db.from("categories").where({ id }).update(categoryToUpdate);
    },
};

module.exports = CategoriesService;
