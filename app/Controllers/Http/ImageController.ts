import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from "@ioc:Adonis/Core/Application";
import * as fs from "fs";
import sharp from "sharp";
import * as console from "console";

export default class PostsController {
  public async show({response, params}: HttpContextContract) {
    //get URL params
    const { size, galleryName, imageName } = params
    //decode URL params
    const decodedGalleryName = decodeURIComponent(galleryName)
    const decodedImageName = decodeURIComponent(imageName)
    //prepare file paths
    const rawPath = `storage/${decodedGalleryName}/${decodedImageName}`
    const filePath = Application.publicPath(rawPath)
    const exist = fs.existsSync(filePath)

    if (!exist) {
      return response.status(404).send('Photo not found')
    }

    //extract sizes from URL string parameter
    const width = size.split('x')[0]
    const height = size.split('x')[1]

    try {
      //check if temp folder for data is existst
      if (!fs.existsSync(Application.tmpPath(`storage/${decodedGalleryName}`))) {
        fs.mkdirSync(Application.tmpPath(`storage/${decodedGalleryName}`))
      }

      //using sharp package resize image. If one
      //of size params is equal to 0, then tool fits scale
      await sharp(filePath).resize({
        width: +width !== 0 ? +width : undefined,
        height: +height !== 0 ? +height : undefined
      }).toFile(Application.tmpPath(rawPath)) //save resized image to temp file

      //return image URL
      return response.status(200).download(Application.tmpPath(rawPath))
    } catch (e) {
      console.error(e)
      return response.status(500).send('The photo preview can\'t be generated.')
    }

  }
}
