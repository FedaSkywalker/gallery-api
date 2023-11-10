/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'


Route.get('auth/sec', 'AuthController.securedPage').middleware('auth')
Route.post('gallery/:path', 'FileController.uploadFile')
Route.get('gallery/:path', 'GalleriesController.listGalleryImages')
Route.post('gallery', 'GalleriesController.createGallery')
Route.get('gallery', 'GalleriesController.listGalleries')
Route.get('images/:size/:galleryName/:imageName', 'ImageController.show')
Route.get('images', 'GalleriesController.searchGalleryImages')
Route.delete('gallery/:galleryName/:imageName', 'FileController.deleteFile')
Route.delete('gallery/:galleryName', 'FileController.deleteFile')
Route.get('data/:size/:fileName', 'ImageController.show')
Route.get('auth/discord', 'AuthController.redirectToDiscord')
Route.get('auth/discord/callback', 'AuthController.handleDiscordCallback')



