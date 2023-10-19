
exports.up = knex => knex.schema.createTable("dishes" , table => {
    table.increments("id")
    table.text("title")
    table.text("image")
    table.decimal("price")
    table.text("category")
    table.text("description")
    table.integer("user_id").references("id").inTable("users")

    table.timestamp("created_at").default(knex.fn.now())
    table.timestamp("updated").default(knex.fn.now())

})


exports.down = knex => knex.schema.dropTable("dishes")
