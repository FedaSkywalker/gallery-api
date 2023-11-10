import {schema} from "@adonisjs/validator/build/src/Schema";

export const createGallerySchema = schema.create({
  name: schema.string()
})

export const searchImageByValueSchema = schema.create({
  searchValue: schema.string()
})
