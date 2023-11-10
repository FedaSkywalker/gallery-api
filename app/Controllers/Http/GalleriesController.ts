import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import * as fs from "fs";
import * as console from "console";
import {ImageService} from "App/Services/ImageService";
import {GalleryService} from "App/Services/GalleryService";
import {createGallerySchema, searchImageByValueSchema} from "App/Helpers/Validators";
import {PATHS} from "App/Helpers/Constants";


export default class GalleriesController {

  private readonly imageService: ImageService

  constructor() {
    this.imageService = new ImageService()
  }
  public async createGallery({ request, response }: HttpContextContract){

    try {
      await request.validate({schema: createGallerySchema})
    } catch (validationErr){
      return response.status(400).json(validationErr.messages)
    }

    //get gallery name from POST body
    const inputName = request.input('name')

    //generate path
    const path = PATHS.public.storage(inputName)

    //check existence
    if (fs.existsSync(path)) {
      return response.status(409).json({ error: 'Gallery with this name already exists' })
    }

    //create new directory for new gallery
    try {
      fs.mkdirSync(path)
    }catch (error) {
      console.error(error)
      return  response.status(500).json( { error: 'Unknown error' })
    }

    response.status(201).json( {
      name: inputName,
      path: encodeURIComponent(inputName)
    })
  }

  public async listGalleries({ response }: HttpContextContract) {

    try {
      const galleries = await GalleryService.listGalleries()
      return response.status(200).json({ galleries });
    } catch (error) {
      return response.status(500).json({ error: 'Unknown error' });
    }

  }

  public async listGalleryImages({ response, params }: HttpContextContract) {
    //get params
    const { path } = params

    //generate path on the disk
    const storagePath =  PATHS.public.storage(decodeURIComponent(path))

    //check if exists
    if (!fs.existsSync(storagePath)) {
      return response.status(404).json( { error: 'Gallery does not exists' })
    }

    // //load gallery images
    const galleryImages = this.imageService.findImagesByGalleryName(path)
    const titleImage = galleryImages[0]

    const responseBody = {
      gallery: {
        path: path,
        name: decodeURIComponent(path),
        ...(titleImage ? { image: titleImage } : {}),
        images: [
          ...galleryImages
        ]
      }
    }

    return response.status(200).json(responseBody)

  }

  public async searchGalleryImages({ request, response }: HttpContextContract) {

    try {
      await request.validate({schema: searchImageByValueSchema})
    } catch (validationErr){
      return response.status(400).json(validationErr.messages)
    }

    const { searchValue } = request.qs()

    const images = this.imageService.searchImageByName(searchValue)

    return response.status(200).json({ images: images })
  }
}
