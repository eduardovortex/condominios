import { Injectable } from '@angular/core';
import { AreaComun } from '../models/area-comun.model';
import { DataLocalService } from './data-local.service';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class DataLocalAreaComunService {

  areasComunes:AreaComun[]=[];
  nombreEtiquetaJson = "areascomunes";
  constructor(private dataLocalService : DataLocalService,
              private storage:Storage) {
                this.nombreEtiquetaJson = this.dataLocalService.idempresa + "_" + this.nombreEtiquetaJson;
              this.cargarAreasComunes();

   }
   guardarAreaComun(areaComun : AreaComun){
    const existe = this.areasComunes.find( are => are.idareaComun === areaComun.idareaComun );
    if(! existe ){
      areaComun.idareaComun = this.dataLocalService.getNumeroNegativo() * -1;
      this.areasComunes.unshift(areaComun);
      this.storage.set(this.nombreEtiquetaJson,this.areasComunes);
      this.dataLocalService.presentToast('Área agregada');
    }
   }

  borrarAreaComun(areaComun : AreaComun) {
    this.areasComunes = this.areasComunes.filter(are => are.idareaComun !== areaComun.idareaComun)
    this.storage.set(this.nombreEtiquetaJson,this.areasComunes);
    this.dataLocalService.presentToast('Área borrada');
  }

   async cargarAreasComunes(){
     const areas = await this.storage.get(this.nombreEtiquetaJson);
     if(areas){
       this.areasComunes = areas;
     }
   }
}
