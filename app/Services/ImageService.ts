import FileService from "./FileService";
import {Image} from "App/Models/Image";

export class ImageService extends FileService<Image> {

  constructor() {
    super('images.json');
  }

  searchImageByName(searchValue: string) {
    const allImages = this.getAllData()
    return allImages.filter((image) => image.name.includes(searchValue))
  }
  findImagesByGalleryName(galleryName: string) {
    const allImages = this.getAllData()
    return allImages.filter((image) => image.fullPath.startsWith(galleryName))
  }

  deleteImagesByGalleryName(galleryName: string) {
    const allImages = this.getAllData()
    const updatedImages = allImages.filter((image) => !image.fullPath.startsWith(galleryName))
    this.saveData(updatedImages)
  }



}
