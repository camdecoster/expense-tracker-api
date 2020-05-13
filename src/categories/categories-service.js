const CategoriesService = {
    createCategory(db, newCategory) {
        return db
            .from("categories")
            .insert(newCategory)
            .returning("*")
            .then((rows) => {
                return rows[0];
            });
    },

    deleteCategory(db, id) {
        return db.from("categories").where({ id }).delete();
    },

    getAllCategories(db, user) {
        return db
            .from("categories AS category")
            .select(
                "category.id",
                "category.category_name AS name",
                "category.type",
                "category.amount",
                "category.description",
                "category.date_created",
                "category.date_modified"
            )
            .where("category.user_id", user.id);
        // .leftJoin("users as user", "ctg.user_id", "user.id");
        // .groupBy("ctg.id", "user.id");
    },

    getById(db, user, id) {
        return CategoriesService.getAllCategories(db, user)
            .where("category.id", id)
            .first();
    },

    updateCategory(db, id, categoryToUpdate) {
        return db.from("categories").where({ id }).update(categoryToUpdate);
    },
};

// Use to get user data from SQL query, key:value format used for treeize
// const userFields = [
//     "user.id AS user:id",
//     "user.email AS user:email",
//     "user.date_created AS user:date_created",
//     "user.date_modified AS user:date_modified",
// ];

module.exports = CategoriesService;
