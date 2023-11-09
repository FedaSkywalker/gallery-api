import FileService from "./FileService";
import {Gallery} from "../Models/Gallery";
import * as console from "console";

//service for gallery metadata processing
export class GalleryService extends FileService<Gallery> {

  constructor() {
    super('gallery.json');
  }


  //additional task search images with string
  searchImageByName(searchValue: string) {
    const allImages = this.getAllData().flatMap((gallery) => gallery.images)
    console.log(allImages)
    return allImages.filter((image) => image.name.includes(searchValue))
  }



}
