const AppError = require("../utils/AppError")
const knex = require("../database/knex")
const DiskStorage = require("../providers/DiskStorage")

class DishesController{
    async create(request , response){
        const {title ,price , category, description , ingredients  } = request.body

        const user_id = request.user.id

        const imageFileName = request.file.filename
        

        const diskStorage = new DiskStorage()

        const image = await diskStorage.saveFile(imageFileName)
           

        const [dish_id] = await knex("dishes").insert({
            image,
            title,
            price,
            category,
            description,
            user_id 
        })
            
            

        const ingredientsInsert = JSON.parse(ingredients).map( name => {
            return{
                name,
                dish_id,
                user_id

            }

            
        })

        await knex("ingredients").insert(ingredientsInsert)

        return response.json()

    }

    async show(request , response){
        const {id} = request.params

        const dish = await knex("dishes").where({id}).first()
        const ingredients = await knex("ingredients").where({dish_id : id}).orderBy("name")

        return response.json({
            ...dish, 
            ingredients

        })
    }

    async delete(request , response){
        const {id} = request.params

        await knex("dishes").where({id}).delete()

        return response.json()
    }

    async index(request , response){
        const {title , ingredients} = request.query
        const user_id = request.user.id

        let dishes

        if(ingredients){
            const filterIngredients = ingredients.split(',').map(ingredient => ingredient.trim())
            
            dishes = await knex("ingredients")
            .select([
                "dishes.id",
                "dishes.title",
                "dishes.user_id"               
                
            ])
            .whereLike("dishes.title" , `%${title}%`)
            .whereIn("name" , filterIngredients)
            .innerJoin("dishes" , "dishes.id", "ingredients.dish_id")
            .groupBy("dishes.id")

        }else{
            dishes = await knex("dishes")
            // .where({user_id,})
            .whereLike("title" , `%${title}%`)
        }

        const userIngredients = await knex("ingredients")

        const dishesWithIngredients = dishes.map(dish => {
            const dishIngredients = userIngredients.filter( ingredient => ingredient.dish_id === dish.id) 

            return{
                ...dish,
                ingredients: dishIngredients
            }
        })

        return response.json(dishesWithIngredients)
    }

    async update (request , response){
        const { title, price, category, description, ingredients } = request.body
        const {id} = request.params
        
        const imageFileName = request.file.filename;
        
        
        const diskStorage = new DiskStorage()

        
        
        const dish = await knex("dishes").where({id}).first()
        
        
        
        
        if(!dish){
            throw new AppError("Prato não encontrado.",401)
        }
        
        if(dish.image){
            await diskStorage.deleteFile(dish.image)
        }
        
        const filename = await diskStorage.saveFile(imageFileName)
        dish.image = filename

        await knex("dishes").where({id}).update({
            image:dish.image,
            title:dish.title,
            price:dish.price,
            category: dish.category,
            description: dish.description,
            updated_at:new Date()


        })

        return response.json({
            ...dish
        })
    }

}

module.exports = DishesController