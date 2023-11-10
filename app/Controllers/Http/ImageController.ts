import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import * as fs from "fs";
import sharp from "sharp";
import * as console from "console";
import {PATHS} from "App/Helpers/Constants";

export default class PostsController {
  public async show({response, params}: HttpContextContract) {
    //get URL params
    const { size, galleryName, imageName } = params
    //decode URL params
    const decodedGalleryName = decodeURIComponent(galleryName)
    const decodedImageName = decodeURIComponent(imageName)
    //prepare file paths
    const filePath = PATHS.public.storage(`${decodedGalleryName}/${decodedImageName}`)
    const exist = fs.existsSync(filePath)

    if (!exist) {
      return response.status(404).json({ error: 'Photo not found' })
    }

    //extract sizes from URL string parameter
    const width = size.split('x')[0]
    const height = size.split('x')[1]

    try {
      //check if temp folder for data is existst
      if (!fs.existsSync(PATHS.tmp.storage(decodedGalleryName))) {
        fs.mkdirSync(PATHS.tmp.storage(decodedGalleryName))
      }

      //using sharp package resize image. If one
      //of size params is equal to 0, then tool fits scale
      await sharp(filePath).resize({
        width: +width !== 0 ? +width : undefined,
        height: +height !== 0 ? +height : undefined
      }).toFile(PATHS.tmp.storage(`${decodedGalleryName}/${decodedImageName}`)) //save resized image to temp file
      //return image URL
      return response.status(200).download(PATHS.tmp.storage(`${decodedGalleryName}/${decodedImageName}`))
    } catch (e) {
      console.error(e)
      return response.status(500).json({ error: 'The photo preview can\'t be generated.'})
    }

  }
}
