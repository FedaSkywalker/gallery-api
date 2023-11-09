import * as fs from 'fs';
import Application from "@ioc:Adonis/Core/Application";
import * as console from "console";


//generic class form all services such as GalleryService UserService
export default class FileService<T> {
  private readonly filePath: string

  //prepare json file as storage
  constructor(private fileName: string) {
    this.filePath = Application.publicPath('data/' +  this.fileName)
    if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, '[]')
    }
  }

  //generic function to load all data of T object
  getAllData(): T[] {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error(error)
      return []
    }
  }

  //generic function save all data of T object. Existing data will be overwritten
  saveData(data: T[]): void {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2))
  }

  //generic function to load object using their key value. Something like WHERE is SQL
  getByKey<K extends keyof T>(key: K, value: T[K]): T[] {
    const data = this.getAllData()
    return data.filter((item) => item[key] === value)
  }

  //generic function to update objects using their key value. Something like UPDATE is SQL
  updateAllWhereKey<K extends keyof T>(key: K, value: T[K], updateKey: K, updateValue: T[K]): T[] {
    const data = this.getAllData()
    let dataToUpdate = data.filter((item) => item[key] === value)
    let dataWontUpdate = data.filter((item) => item[key] !== value)

   dataToUpdate.forEach((item:T) => {
     item[updateKey] = updateValue
   })

    this.saveData(dataToUpdate.concat(dataWontUpdate))
    return dataToUpdate
  }

  //generic function save all data of T object. Similar to saveAll() but existing data won't be overwritten
  appendItems(items: T[]) {
    let allItems: T[] = this.getAllData()
    this.saveData(allItems.concat(items))
  }

  //generic function to delete all object by key and value
  deleteAllWhereKey<K extends keyof T>(key: K, value: T[K]): T[] {
    const data = this.getAllData()
    const updatedData = data.filter((item) => item[key] !== value)
    this.saveData(updatedData)
    return updatedData
  }

}


