import Application from "@ioc:Adonis/Core/Application";

export const PATHS = {
  public: {
    data : ((fileName:string) => Application.publicPath(`data/${fileName}`)),
    storage: ((fileName:string) => Application.publicPath(`storage/${fileName}`))
  },
  tmp: {
    storage: ((fileName:string) => Application.tmpPath(`storage/${fileName}`))
  }
}
