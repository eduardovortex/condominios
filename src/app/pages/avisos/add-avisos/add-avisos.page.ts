import { Component, OnInit, Input } from '@angular/core';
import { Publicacion } from '../../../models/publicacion.model';
import { AvisoService } from '../../../services/aviso.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { FormControl, FormGroup } from '@angular/forms';
import { ArchivoVortexApp } from 'src/app/models/archivo-vortex.model';
import { FormBuilder, Validators } from "@angular/forms";
import { UserData } from '../../../providers/user-data';
import { AgenteService } from '../../../services/agente.service';


declare var window: any;
@Component({
  selector: 'app-add-avisos',
  templateUrl: './add-avisos.page.html',
  styleUrls: ['./add-avisos.page.scss'],
})
export class AddAvisosPage implements OnInit {


  notificacion: Publicacion = new Publicacion();
  enCamara: boolean;

  data: ArchivoVortexApp[] = new Array();
  /* dataTemp: ArchivoVortexApp[] = new Array();   */

  manzanas: any[] =  [];

  createNotificacion = this.fb.group({
    //Esto para construir los formularios dinamicamente
    destinatario: ["", [Validators.required]],
    titulo: ["", [Validators.required]],
    descripcion: ["", [Validators.required]],
    tipo: ["NOTIFICACION"],
  });


  idEmpresa: number;
  idAgente: number;

  pathBase64:string ="data:image/jpeg;base64,";

  //Inyectamos el servicio de data local.




  constructor(private notificacionService: AvisoService,
    private agenteService: AgenteService,
    private toastr: ToastController,
    private fb: FormBuilder,
    private camera: Camera,
    private router: Router,
    private userData: UserData) {
  }

  ngOnInit() {
    this.buscarManzanas();
    this.idEmpresa = this.userData.getIdEmpresa();
    this.idAgente = this.userData.getIdAgente();
    console.log('this.idEmpresa: '+ this.idEmpresa);


  }

  buscarManzanas(){
    console.log('buscando manzanas');    
/*     this.manzanas = [
      "37-B", "38-B", "39-B",
      "40-A",  
  ]; */

  this.agenteService.getManzanas(this.userData.getIdEmpresa()).subscribe(
    (data) => {
      if (data.status === 200) {
        console.log('Manzanas recuperadas correctamente');
        this.manzanas = data.result;
      } else {
        console.log('Llego otro status al recuperar manzanas');
      }
    },
    (err) => {
      console.log(err);
    }
  );
  }

  getCameraOptions(): CameraOptions {

    let sourceTypeSelected;
    if (this.enCamara) {
      sourceTypeSelected = this.camera.PictureSourceType.CAMERA;
    } else {
      sourceTypeSelected = this.camera.PictureSourceType.PHOTOLIBRARY;
    }
    const options: CameraOptions = {
      quality: 60,
      /* destinationType: this.camera.DestinationType.FILE_URI, */
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      sourceType: sourceTypeSelected
    };
    return options;
  }

  camara() {
    this.enCamara = true;
    this.procesarImagen(this.getCameraOptions());
  }

  libreria() {
    this.enCamara = false;
    this.procesarImagen(this.getCameraOptions());
  }

  procesarImagen(options: CameraOptions) {
    this.camera.getPicture(options).then((imageData) => {
      /* const img = "data:image/jpeg;base64," + imageData; //Se agrega para que se muestren en la lista */
      const title = this.createNotificacion.value.titulo + "_notificacion.jpg";
      /* this.dataTemp.push(new ArchivoVortexApp(img, title)); */
      this.data.push(new ArchivoVortexApp(imageData, title)); //Se setea la imagen en base 64      
    }, (err) => {
      // Handle error
    });
  }

  save() {
    /* console.log('save'); */
    /* this.addMarca(); */
    /* this.addAviso(); */
    /* console.log(this.aviso);    
    this.aviso.tipo = 'Aviso'; */
    console.log(this.createNotificacion.value);
    const notificacionObj ={
      empresa:this.idEmpresa,
      agenteCreador:this.idAgente,
      titulo: this.createNotificacion.value.titulo,
      descripcion: this.createNotificacion.value.descripcion,      
      tipo: this.createNotificacion.value.tipo,
      destinatario: this.createNotificacion.value.destinatario,
      data: {
        archivos: [],//Se debe enviar vacio, ya que las imagenes se procesan por separado.
      },
      respuestas: {
        respuestasPublicacion: [],//Se debe enviar vacio, ya que en un principio no se tienen respuestas
      },
    };

    const formData = new FormData(); //Esto no esta trabajanco chido...
    formData.append("data", JSON.stringify(notificacionObj));
    formData.append("file", JSON.stringify(this.data));
    console.log("anuncio enviado: ", formData);

    this.notificacionService.save(formData).subscribe(
      (data) => {
        if (data.status === 200) {
          console.log('"data.result"', data.result);
          console.log("notificacion registrada correctamente");
          this.showToast("notificacion registrada correctamente");          
          this.router.navigate(["/avisos"]);
        } else {
          console.log('Llego otro status al guardar anuncio');
          this.guardarNotificacionLocalmente();
          this.router.navigate(["/avisos"]);
        }
      },
      (err) => {
        console.log(err);
        console.log('Llego otro status al guardar anuncio');
        this.guardarNotificacionLocalmente();
        this.router.navigate(["/avisos"]);
       
      },
      () => {}
    );

    

    /* this.avisoService.guardarAviso(this.aviso);
    this.router.navigate(['/avisos']);  */
    
  }

  guardarNotificacionLocalmente() {
    console.log('guardando anuncio localmente');    
    this.notificacion.empresa = this.idEmpresa;
    this.notificacion.agenteCreador = this.idAgente;
    this.notificacion.titulo = this.createNotificacion.value.titulo;
    this.notificacion.descripcion = this.createNotificacion.value.descripcion;    
    this.notificacion.tipo = this.createNotificacion.value.tipo;    
    this.notificacion.data = this.data;
    this.notificacionService.saveLocal(this.notificacion);
  }


  
/*   addAviso(){

    console.log('add aviso in add avisos page');
    
    const formularioData = new FormData();
    formularioData.append('empresa','14');
    formularioData.append('titulo',this.aviso.titulo);
    formularioData.append('mensaje',this.aviso.descripcion);
    formularioData.append('agenteCreador','24');
    console.log('quitando el data');
    this.aviso.empresa =14;
    this.aviso.agenteCreador =24;
    console.log('seteando empresa y agente creador');
    console.log('enviando formulario data');

    this.avisoService.addAviso(this.aviso).subscribe(data => {
        if (data.status === 200) {
          console.log(data);
          this.showToast("Se creo correctamente el aviso:"+ data);
        } else {
          this.showToast("Error al crear el aviso:"+ data);
        }
      }, err => {
        this.showToast("Error al crear el aviso"+ err);        
      },
      () => {

      });
    

  } */

  
  showToast(dataMessage: string) {
    this.toastr.create({
      message: dataMessage,
      duration: 2000
    }).then((toastData) => {
      toastData.present();
    });
  }

  getAviso() {

  }

  cancel(){ 
    console.log('in boton cancel..');
    this.router.navigate(['/avisos']);
  }    

}
