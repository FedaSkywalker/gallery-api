import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from "@ioc:Adonis/Core/Application";
import * as console from "console";
import * as fs from "fs";
import {GalleryService} from "../../Services/GalleryService";
import {Image} from "../../Models/Image";

//File processing
export default class FileController {

  private readonly galleryService: GalleryService


  constructor() {
    this.galleryService = new GalleryService()

  }

  public async uploadFile({ request, response, params }: HttpContextContract) {
    //get path from URL
    const { path } = params
    //generate storage path on disk
    const storagePath = Application.publicPath(`storage/${decodeURIComponent(path)}`)

    if (!fs.existsSync(storagePath)) {
      return response.status(404).send('Gallery not found')
    }

    //load multipart files
    const files = request.files('image')

    if (!files || files.length === 0) {
      return response.status(400).send('Invalid request - file not found.' )
    }

    let responseBody: Image[] = []

    //iterate through each file
    for (const file of files) {
      try {
        //save image on disk
        await file.move(storagePath)
        //prepare metadata
        const galleryImages = this.galleryService.getByKey('path', path)[0].images
        const fileName = file.clientName
        const image: Image = {
          path: fileName,
          fullPath: `${path}/${fileName}`,
          name: fileName.split('.').slice(0, -1).join('.'),
          modified: Date()
        }
        //save metadata using gallery service
        this.galleryService.updateAllWhereKey('path', path, 'images', galleryImages.concat([image]))
        responseBody.push(image)

      } catch (e) {
        response.status(500).send('Unknown error');
      }
    }
    return  response.status(201).json({ uploaded: responseBody })

  }

  public async deleteFile({response, params }: HttpContextContract) {

    //extract params
    const { galleryName, imageName } = params

    //generate paths
    const galleryPath = galleryName ? Application.publicPath(`storage/${decodeURIComponent(galleryName)}`) : null
    const imagePath = imageName ? Application.publicPath(`storage/${decodeURIComponent(galleryName)}/${decodeURIComponent(imageName)}`) : null

    //checking existence
    if (galleryPath && !fs.existsSync(galleryPath)) {
      return response.status(404).send('Gallery does not exist!' )
    }

    if(imagePath && !fs.existsSync(imagePath)) {
        return response.status(404).send('Photo does not exist!')
    }

    try {
      //deleting certain image
      if (imagePath) {
        await fs.unlinkSync(imagePath)
        const allImages = this.galleryService.getAllData()
          .filter((gallery) => gallery.path === galleryName)
          .flatMap((gallery) => gallery.images)

        const updatedImages = allImages.filter((image) => image.fullPath !== `${galleryName}/${imageName}`)
        this.galleryService.updateAllWhereKey('path', galleryName, 'images', updatedImages)
        return response.status(200).send('Photo deleted!')
      }
      //delete gallery
      else if (galleryPath) {
        fs.rmSync(galleryPath, { recursive: true, force: true });
        this.galleryService.deleteAllWhereKey('path', galleryName)
        return response.status(200).send('Gallery deleted!')
      }
    } catch (error) {
      console.error(error)
      return response.status(500).send('Unknown error' )
    }


  }
}
