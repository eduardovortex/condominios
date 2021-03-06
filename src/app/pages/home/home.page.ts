import { Component, OnInit } from "@angular/core";
import { AlertController, ModalController } from "@ionic/angular";
import { Router } from "@angular/router";
import { DataLocalService } from "../../services/data-local.service";
import { AuthService } from "../../services/auth.service";
import { LoadingController } from "@ionic/angular";
import { ToastController } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { UserOptions } from "../../interfaces/user-option";
import { UserData } from "../../providers/user-data";
import { EmpresaPage } from "../empresa/empresa.page";
import { AgenteService } from '../../services/agente.service';

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
})
export class HomePage implements OnInit {
  login: UserOptions = { username: "", password: "" };
  load: any;
  idAgente: number = 0;
  empresas: any[] = [];
  user: string;

  constructor(
    public userData: UserData,
    private authService: AuthService,
    public loadingController: LoadingController,
    private toastr: ToastController,
    public alertController: AlertController,
    public storage: Storage,
    private router: Router,
    private dataLocalService: DataLocalService,
    private modalCtrl: ModalController,
    private agenteService: AgenteService
  ) {}

  ngOnInit() {}

  onLogin() {
    console.log("onLogin()");
    console.log("this.user:" + this.login.username);
    console.log("this.pass:" + this.login.password);

    if(this.login.username === "" || this.login.password ===""){
      this.showToast("Se necesita usuario y contraseña")
      return;
    }

    const loginPayload = {
      username: this.login.username,
      password: this.login.password,
    };
    console.log("loginPayload: " + loginPayload);
    this.showLoading();

    this.user = loginPayload.username.toLowerCase();
    if (
      loginPayload.username.toLowerCase() === "test1" &&
      loginPayload.password.toLowerCase() === "test1"
    ) {//Usuario admin prueba
      window.localStorage.setItem("userDetails",JSON.stringify({ "username": "test1", "nombre": "Test1", "id": 4 }));
      this.storage.set("userDetails",JSON.stringify({ "username": "test1", "nombre": "Test1", "id": 4 }));
      
      this.idAgente = 4;
      this.buscarEmpresasAgente();
      console.log("empresas: " + this.empresas);
      this.presentModalListEmpresas(); //Debo presentar el modal para seleccionar una empresa
    } else if (
      (loginPayload.username.toLowerCase() === "rcortes" &&
        loginPayload.password.toLowerCase() === "rcortes") ||
      (loginPayload.username.toLowerCase() === "eosorio" &&
        loginPayload.password.toLowerCase() === "eosorio")
    ) {//Usuarios de prueba
      window.localStorage.setItem("userDetails",JSON.stringify({ "username": "test1", "nombre": "Test1", "id": 4 }));
      this.storage.set("userDetails",JSON.stringify({ "username": "test1", "nombre": "Test1", "id": 4 }));
      this.idAgente = 4;
      this.buscarEmpresasAgente();
      window.localStorage.setItem('empresaData', JSON.stringify({"nombre":this.empresas[0].nombre,"id":this.empresas[0].id}));
      this.storage.set('empresaData', JSON.stringify({"nombre":this.empresas[0].nombre,"id":this.empresas[0].id}));
      this.userData.setConfigEmpresa();

      this.router.navigate(["/inicio"]);
      this.showToast("Bienvenido a armonía residencial: " +loginPayload.username.toLowerCase());
    } else {
       this.authService.login(loginPayload).subscribe(data => {
         if (data.status === 200) {
           window.localStorage.setItem('userDetails', JSON.stringify(data.result));
           this.storage.set('userDetails', JSON.stringify(data.result));
           this.agenteService.getUserById(data.result.id).subscribe(userFull => {
            if (userFull.status === 200) {
              this.storage.set('userFull', userFull.result);
              console.log('userFull.result.activo === false: ',(userFull.result.activo === false));              
              if(userFull.result.activo === false){
                this.router.navigate(['/']);
                this.showToast("El usuario " + data.result.nombreCompleto + ", no esta activo para la aplicación móvil");   
              }else{
                  //Aqui debo preguntar a cuantas empresas tiene acceso
             console.log("data.result del login: "+data.result);                          
             this.idAgente = data.result.id;
             let nombreAgente = data.result.nombreCompleto;
             this.authService.getListEmpresas(this.idAgente).subscribe(data => {
              console.log("getListEmpresas: data: "+data);
              if (data.status === 200) {
                this.empresas = data.result;
                console.log("estatus200:" + this.empresas);
                if(this.empresas.length == 1){//Debo redirecionar al inicio, solo hay una empresa
                window.localStorage.setItem('empresaData', JSON.stringify({"nombre":this.empresas[0].nombre,"id":this.empresas[0].id}));
                this.storage.set('empresaData', JSON.stringify({"nombre":this.empresas[0].nombre,"id":this.empresas[0].id}));                  
                this.userData.setConfigEmpresa();
                this.router.navigateByUrl('/inicio');
                this.showToast("Bienvenido " + nombreAgente +" a armonía residencial");
                }else if(this.empresas.length > 1){
                  this.presentModalListEmpresas()//Debo presentar el modal para seleccionar una empresa
                }else{
                  console.log("Error al recuperar empresas del agente: ", nombreAgente);//Error al recuperar las empresas del user
                }
              }
            }, err => {
              console.log('Error al buscar las empresas');
            });
              }
            }else{
              console.log('Llego otro status al recuperar el usauario');                            
            }            
          });
         }else{
          this.showToast("Error usuario o contraseña inválidos");
         }
       }, err => {
         this.showToast("Error usuario o contraseña inválidos");
       }); 
    }
  }

  buscarEmpresasAgente() {//Es para pruebas locales
    console.log("buscando empresas...");
    if (this.idAgente > 0) {
      this.empresas = [
        {
          id: 7,
          nombre: "RINCON ESMERALDA",
          alias: "ESME",
          rfc: "ASDA232323ASS",
          urlPaginaWeb: "http://pruebaintegral.com",
          email: "prueba@integral.com",
          telefono: "5454322222",
          integrantes: 4,
          actividadEconomica: 11,
          direccion: {
            calle: "Otra Calle Inventada",
            numeroExterior: "5432",
            numeroInterior: "",
            asentamiento: {
              id: 66344,
              codigoPostal: "52105",
              colonia: "San Pedro",
              ciudad: "San Mateo Atenco",
              municipio: "San Mateo Atenco",
              estado: "México",
            },
          },
          configuracionEmpresa: {
            logoFondoClaro: "",
            logoFondoOscuro: "",
            ejercicioActual: 2020,
            mascaraCuentasContables: "9999-9999-9999-9999",
            mesDeTrabajo: 12,
            estructuraDeCuentas: "444400",
            usarPlanDePagos: false,
            usarDireccionDeEntrega: true,
            usarCasetasDeLinea: true,
            permitirSaldosNegativos: true,
          },
        },
        {
          id: 12,
          nombre: "EXPLANADA SUR",
          alias: "SUR",
          rfc: "ERES232323222",
          urlPaginaWeb: "http://tyv.com",
          email: "tyv@tyv.com",
          telefono: "4543225666",
          integrantes: 3,
          actividadEconomica: 11,
          direccion: {
            calle: "LKUNASNDA ASDAS",
            numeroExterior: "342",
            numeroInterior: "1",
            asentamiento: {
              id: 66659,
              codigoPostal: "52303",
              colonia: "El Carrizal",
              ciudad: "Desconocida",
              municipio: "Tenango del Valle",
              estado: "México",
            },
          },
          configuracionEmpresa: {
            logoFondoClaro: "",
            logoFondoOscuro: "",
            ejercicioActual: 2020,
            mascaraCuentasContables: "9999-9999-9999-9999",
            mesDeTrabajo: 12,
            estructuraDeCuentas: "444400",
            usarPlanDePagos: false,
            usarDireccionDeEntrega: true,
            usarCasetasDeLinea: true,
            permitirSaldosNegativos: true,
          },
        },
      ];
    }
  }

  async presentModalListEmpresas() {
    const modal = await this.modalCtrl.create({
      component: EmpresaPage,
      componentProps: {
        empresas: this.empresas,
        username: this.user,
      },
      cssClass: "my-custom-class",
    });
    return await modal.present();
  }

  

  showLoading() {
    this.load = this.loadingController
      .create({
        message: "Iniciando sesión, espere",
        /* duration: 2000 */
        duration: 300,
      })
      .then((loadingData) => {
        loadingData.present();
      });
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

  async presentAlert() {
    const alert = await this.alertController.create({
      cssClass: "my-custom-class",
      header: "Mensaje",
      subHeader: "Error de autenticación",
      message: "Usuario o contraseña inválidos.",
      buttons: ["OK"],
    });

    await alert.present();
  }
}
