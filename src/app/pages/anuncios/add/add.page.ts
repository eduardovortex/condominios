import { Component, OnInit, LOCALE_ID } from "@angular/core";
import { Anuncio } from "../../../models/anuncio.model";
import { AnuncioService } from "../../../services/anuncio.service";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";

declare var window: any;
import { Router } from "@angular/router";
import { Publicacion } from "../../../models/publicacion.model";
import { ArchivoVortexApp } from "src/app/models/archivo-vortex.model";
import { FormBuilder, Validators } from "@angular/forms";
import { ToastController } from "@ionic/angular";
import { UserData } from "../../../providers/user-data";

@Component({
  selector: "app-add",
  templateUrl: "./add.page.html",
  styleUrls: ["./add.page.scss"],
})
export class AddPage implements OnInit {
  anuncio: Publicacion = new Publicacion();
  
  enCamara: boolean;
  data: ArchivoVortexApp[] = new Array();
  /* dataTemp: ArchivoVortexApp[] = new Array();   */

  createAnuncio = this.fb.group({
    //Esto para construir los formularios dinamicamente
    titulo: ["", [Validators.required]],
    descripcion: ["", [Validators.required]],
    precio: ["", [Validators.required]],
    telefono: [""],
    tipo: ["ANUNCIO"],
    fechaVence: [new Date()],
    estatus: [true],
  });
  idEmpresa: number;
  idAgente: number;
  pathBase64:string ="data:image/jpeg;base64,";

  /* momentjs: any = moment; */

  constructor(

    private anuncioService: AnuncioService,
    private camera: Camera,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastController,
    private userData: UserData
  ) {
    /* this.idEmpresa = JSON.parse(window.localStorage.getItem('empresaData')).id;//Recuperamos el id empresa de empresaData
    this.idAgente = JSON.parse(window.localStorage.getItem('userDetails')).id;//Recuperamos el id agente de userDetails */
  }

  ngOnInit() {
    this.idEmpresa = this.userData.getIdEmpresa();
    this.idAgente = this.userData.getIdAgente();
    console.log("this.idEmpresa: "+ this.idEmpresa);
    console.log("this.idAgente: "+ this.idAgente);
  }

  getCameraOptions(): any {
    let sourceTypeSelected;
    if (this.enCamara) {
      sourceTypeSelected = this.camera.PictureSourceType.CAMERA;
    } else {
      sourceTypeSelected = this.camera.PictureSourceType.PHOTOLIBRARY;
    }
    const options: CameraOptions = {
      quality: 60,
      /* destinationType: this.camera.DestinationType.FILE_URI, */
      destinationType: this.camera.DestinationType.DATA_URL, //Esto es para que lo transforme en BASE64
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      sourceType: sourceTypeSelected,
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

  async procesarImagen(options: CameraOptions) {
    this.camera.getPicture(options).then(
      (imageData) => {
        /* console.log("imageData:" + imageData); */
        /* const img = window.Ionic.WebView.convertFileSrc(imageData); */
        /* const img = "data:image/jpeg;base64," + imageData; //Se agrega para que se muestren en la lista */
        const title = this.createAnuncio.value.titulo + "_aviso.jpg";
        /* this.dataTemp.push(new ArchivoVortexApp(img, title)); */
        this.data.push(new ArchivoVortexApp(imageData, title)); //Se setea la imagen en base 64
      },
      (err) => {
        // Handle error
      }
    );
  }
  save() {
    console.log(this.createAnuncio.value);
    /* this.anuncio.tipo = 'ANUNCIO'; */
    const anuncioObj = {
      empresa: this.idEmpresa,
      agenteCreador: this.idAgente,
      titulo: this.createAnuncio.value.titulo,
      descripcion: this.createAnuncio.value.descripcion,
      precio: this.createAnuncio.value.precio,      
      tipo: this.createAnuncio.value.tipo,
      fechaVence: this.createAnuncio.value.fechaVence,
      data: {
        archivos: [],//Se debe enviar vacio, ya que las imagenes se procesan por separado.
      },
    };
    const formData = new FormData(); //Esto no esta trabajanco chido...
    formData.append("data", JSON.stringify(anuncioObj));
    formData.append("file", JSON.stringify(this.data));
    console.log("anuncio enviado: ", formData);

    //Se envia a guardar en el server
    this.anuncioService.guardarAnuncio(formData).subscribe(
      (data) => {
        if (data.status === 200) {
          console.log('"data.result"', data.result);
          console.log("anuncio registrado correctamente");
          this.showToast("anuncio registrado correctamente");
          /* this.guardarAnuncioLocalmente(); */
          this.router.navigate(["/anuncios"]);
        } else {
          console.log('Llego otro status al guardar anuncio');
          this.guardarAnuncioLocalmente();
          this.router.navigate(["/anuncios"]);
        }
      },
      (err) => {
        console.log(err);
        this.showToast("Error: "+ err);
        this.guardarAnuncioLocalmente();
        this.router.navigate(["/anuncios"]);
       
      },
      () => {}
    );
    /*     this.anuncioService.guardarAnuncio(this.anuncio);
    this.router.navigate(['/anuncios']); */
  }

  guardarAnuncioLocalmente() {
    console.log('guardando anuncio localmente');    
    this.anuncio.empresa = this.idEmpresa;
    this.anuncio.agenteCreador = this.idAgente;
    this.anuncio.titulo = this.createAnuncio.value.titulo;
    this.anuncio.descripcion = this.createAnuncio.value.descripcion;
    this.anuncio.precio = this.createAnuncio.value.precio;
    this.anuncio.tipo = this.createAnuncio.value.tipo;
    this.anuncio.fechaVence = this.createAnuncio.value.fechaVence;
    this.anuncio.data = this.data;
    this.anuncioService.guardarAnuncioLocal(this.anuncio);
  }

  showToast(dataMessage: string) {
    this.toastr
      .create({
        message: dataMessage,
        duration: 2000,
      })
      .then((toastData) => {
        toastData.present();
      });
  }
  cambioFechaVence(event) {
    console.log("cambio fecha vence: ", event);
    this.anuncio.fechaVence = new Date(event.detail.value);
  }
}
