import { Component, OnInit, Input } from '@angular/core';
import { DataLocalService } from '../../../services/data-local.service';
import { DataLocalAvisoService } from '../../../services/data-local-aviso.service';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Aviso } from 'src/app/models/aviso.model';
import { AddRespuestaPage } from '../add-respuesta/add-respuesta.page';
import { Router } from '@angular/router';
import { RespuestasPage } from '../respuestas/respuestas.page';

@Component({
  selector: 'app-list-avisos',
  templateUrl: './list-avisos.page.html',
  styleUrls: ['./list-avisos.page.scss'],
})
export class ListAvisosPage implements OnInit {



  @Input() aviso: Aviso;
  slideSoloOpts = {
    allowSlideNext: false,
    allowSlidePrev: false
  };
  constructor(public dataLocalAvisoService:DataLocalAvisoService,
          private actionSheetCtrl: ActionSheetController,
          private modalCtlr: ModalController,
          private router: Router) { }


  ngOnInit() {
  }


  async lanzarMenu() {

    let tamanioRespuestas =0;
    
      tamanioRespuestas = this.aviso.avisosRespuestaList.length;
    
    
    let guardarBorrarBtn;

      guardarBorrarBtn = {
        text: 'Borrar aviso',
        icon: 'trash',
        cssClass: 'action-dark',
        handler: () => {
          console.log('Borrar aviso');
          console.log(this.aviso);          
          this.dataLocalAvisoService.borrarAviso(this.aviso);
          
        }
      };

    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Ver respuestas ('+tamanioRespuestas+')',
          icon: 'share',
          cssClass: 'action-dark',
          handler: () => {
            console.log('Ver respuestas');     
            this.presentModalRespuestas();
        }
      },
        {
          text: 'Responder',
          icon: 'share',
          cssClass: 'action-dark',
          handler: () => {
            console.log('Responder');
            this.presentModalCreateRespuesta();
        }
      },
      guardarBorrarBtn,
      {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
        cssClass: 'action-dark',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });

    await actionSheet.present();

  }

  async presentModalCreateRespuesta() {
    const modal = await this.modalCtlr.create({
      component: AddRespuestaPage,
    componentProps:{
      titulo: this.aviso.titulo,
      avisoPadre: this.aviso
    },
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  async presentModalRespuestas(){
    const modal = await this.modalCtlr.create({
      component: RespuestasPage,
    componentProps:{
      titulo: this.aviso.titulo,
      respuestas: this.aviso.avisosRespuestaList
    },
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  borrarAviso(aviso: Aviso){
    this.dataLocalAvisoService.borrarAviso(aviso);
    this.router.navigate(['/avisos']);
  }


}
