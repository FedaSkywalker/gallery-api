import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import * as console from "console";
import * as fs from "fs";
import {ImageService} from "App/Services/ImageService";
import {Image} from "App/Models/Image";
import {PATHS} from "App/Helpers/Constants";


//File processing
export default class FileController {

  private readonly imageService: ImageService

  constructor() {
    this.imageService = new ImageService()
  }

  public async uploadFile({ request, response, params }: HttpContextContract) {
    //get path from URL
    const { path } = params
    //generate storage path on disk
    const storagePath = PATHS.public.storage(decodeURIComponent(path))

    if (!fs.existsSync(storagePath)) {
      return response.status(404).json({ error: 'Gallery not found' })
    }

    //load multipart files
    const files = request.files('image')

    if (!files || files.length === 0) {
      return response.status(400).json({ error: 'Invalid request - file not found.' } )
    }

    let responseBody: Image[] = []

    //iterate through each file
    for (const file of files) {
      try {
        //save image on disk
        await file.move(storagePath)
        //prepare metadata
        const fileName = file.clientName
        const image: Image = {
          path: fileName,
          fullPath: `${path}/${fileName}`,
          name: fileName.split('.').slice(0, -1).join('.'),
          modified: Date()
        }
        //save metadata using gallery service
        this.imageService.appendItems([image])
        responseBody.push(image)

      } catch (e) {
        response.status(500).json({ error: 'Unknown error' });
      }
    }
    return  response.status(201).json({ uploaded: responseBody })

  }

  public async deleteFile({response, params }: HttpContextContract) {

    //extract params
    const { galleryName, imageName } = params

    //generate paths
    const galleryPath = galleryName ? PATHS.public.storage(decodeURIComponent(galleryName)) : null
    const imagePath = imageName ? PATHS.public.storage(`${decodeURIComponent(galleryName)}/${decodeURIComponent(imageName)}`) : null

    //checking existence
    if (galleryPath && !fs.existsSync(galleryPath)) {
      return response.status(404).json({ error: 'Gallery does not exist!' })
    }

    if(imagePath && !fs.existsSync(imagePath)) {
        return response.status(404).json({ error: 'Photo does not exist!'})
    }

    try {
      //deleting certain image
      if (imagePath) {
        await fs.unlinkSync(imagePath)
        const allImages = this.imageService.getAllData()

        this.imageService.saveData(allImages.filter((image) => image.fullPath !== `${galleryName}/${imageName}`))
        return response.status(200).json({ messages:'Photo deleted!' })
      }
      //delete gallery
      else if (galleryPath) {
        fs.rmSync(galleryPath, { recursive: true, force: true });
        this.imageService.deleteImagesByGalleryName(galleryName)
        return response.status(200).json({ messages: 'Gallery deleted!' })
      }
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: 'Unknown error' } )
    }


  }
}
