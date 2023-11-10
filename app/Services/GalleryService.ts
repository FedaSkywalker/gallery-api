//service for gallery metadata processing
import fsp from "fs/promises";
import {PATHS} from "App/Helpers/Constants";
import {ImageService} from "App/Services/ImageService";

export class GalleryService {


  public static async listGalleries() {
    const imageService = new ImageService()
    const files = await fsp.readdir(PATHS.public.storage(''), { withFileTypes: true });

    return files
        .filter((file) => file.isDirectory())
        .map((directory) => ({
          path: encodeURIComponent(directory.name),
          name: directory.name,
          ...(imageService.findImagesByGalleryName(encodeURIComponent(directory.name))[0] ?
            { image: imageService.findImagesByGalleryName(encodeURIComponent(directory.name))[0] } : {}),
        }));
  }
}
