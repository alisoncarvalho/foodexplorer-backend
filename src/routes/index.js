const {Router} = require("express")

const usersRouter = require("./user.routes")
const dishesRouter = require("./dishes.routes")
const ingredientsRouter = require("./ingredients.routes")
const sessionsRouter = require("./sessions.routes")

const routes = Router()

routes.use("/users" , usersRouter)
routes.use("/dishes" , dishesRouter)
routes.use("/ingredients" , ingredientsRouter)
routes.use("/sessions" , sessionsRouter)


module.exports = routes