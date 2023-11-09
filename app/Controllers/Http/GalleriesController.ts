
import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import Application from "@ioc:Adonis/Core/Application";
import * as fs from "fs";
import * as console from "console";
import {Gallery} from "../../Models/Gallery";
import {GalleryService} from "../../Services/GalleryService";
import {Image} from "../../Models/Image";


export default class GalleriesController {

  private readonly galleryService: GalleryService

  constructor() {
    this.galleryService = new GalleryService()
  }
  public async createGallery({ request, response }: HttpContextContract){
    //get gallery name from POST body
    const inputName = request.input('name')

    //validate POST body
    if (!inputName) {
      return response.status(400).json( {
        name: "INVALID_SCHEMA",
        description: "Bad JSON object: u \' name \' is required property"
      } )
    }

    //generate path
    const path = Application.publicPath(`storage/${inputName}`)

    //check existence
    if (fs.existsSync(path)) {
      return response.status(409).send('Gallery with this name already exists')
    }

    //create new directory for new gallery
    try {
      fs.mkdirSync(path)
    }catch (error) {
      console.error(error)
      return  response.status(500).send('Unknown error')
    }

    const gallery: Gallery = {
      name: inputName,
      path: encodeURIComponent(inputName),
      images: []
    }

    //save gallery metadata to local json file
    this.galleryService.appendItems([gallery])

    response.status(201).json( {
      name: gallery.name,
      path: gallery.path
    })
  }

  public async listGalleries({ response }: HttpContextContract) {
    const allGalleries = this.galleryService.getAllData()

    //list metadata from json file provide by gallery service
    const responsePayload = allGalleries.map((gallery) => {
      return {
        path: gallery.path,
        name: gallery.name
      }
    })

    return response.status(200).json({ galleries: responsePayload })
  }

  public async listGalleryImages({ response, params }: HttpContextContract) {
    //get params
    const { path } = params

    //generate path on the disk
    const storagePath = Application.publicPath(`storage/${decodeURIComponent(path)}`)

    //check if exists
    if (!fs.existsSync(storagePath)) {
      return response.status(404).send( 'Gallery does not exists')
    }

    //load gallery images
    const gallery: Gallery = this.galleryService.getByKey("path", path)[0]
    const images: Image[] = gallery.images

    //fill response body
    const responsePayload = {
      gallery: {
        path: gallery.path,
        name: gallery.name
      },
      images: [
        ...images
      ]
    }

    return response.status(200).json(responsePayload)

  }

  public async searchGalleryImages({ request, response }: HttpContextContract) {
    const { searchValue } = request.qs()

    if (!searchValue) {
      return response.status(400).json( {
        name: "INVALID_SCHEMA",
        description: "Bad URL parameter:  \' searchValue \' is required property"
      } )
    }

    const images = this.galleryService.searchImageByName(searchValue)

    return response.status(200).json({ images: images })
  }
}
