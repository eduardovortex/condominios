import { Component, OnInit, ViewChild } from '@angular/core';
import { Componente } from 'src/app/interfaces/interface';
import { DataService } from '../../services/data.service';
import { Observable } from 'rxjs';
import { IonInfiniteScroll, MenuController } from '@ionic/angular';
import { PublicacionService } from '../../services/publicacion.service';
import { Publicacion } from '../../models/publicacion.model';
import { AnuncioService } from '../../services/anuncio.service';
import { UserData } from '../../providers/user-data';
import { Storage } from "@ionic/storage";

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  componentes: Observable<Componente[]>;

  idEmpresa: number;  
  filters: any;

  public anunciosList : Publicacion[];
  public anunciosListLocal : Publicacion[];
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  anunciosPage:number=0;


  pathS3:string ="https://almacenamientonube.s3.us-west-1.amazonaws.com/";
  pathBase64:string ="data:image/jpeg;base64,";

  constructor(private dataService: DataService,
              private menuCtrl: MenuController,
              public publicacionService : PublicacionService,
              private anuncioService : AnuncioService,
              private storage: Storage,
              private userData:UserData) {
                this.componentes = this.dataService.getMenuOpts();

                /* this.publicaciones = this.publicacionService.publicaciones;
                  console.log('this.publicaciones:'+ this.publicaciones); */
                  this.idEmpresa = this.userData.getIdEmpresa();
     }

 
  ngOnInit() {
    /* this.cargarAnunciosLocalesStorage(); */
    this.cargaAnunciosStorage();
  }

  async cargaAnunciosStorage(){      
      await this.cargarAnunciosTemporalesStorage(this.idEmpresa);      
      if(this.anunciosList.length == 0){        
        await this.getAnuncios(this.anunciosPage, 10);
      }     
  }

  getAnuncios(page: number, size: number, eventInfinite?, eventRefresh?) {
    /* this.anuncioService.getDataAnuncios(this.idEmpresa, this.anunciosPage, size, this.filters);     */
    this.anuncioService
      .getAnuncios(this.idEmpresa, page, size, this.filters)
      .subscribe(
        (data) => {
          if (data.status === 200) {
            if(eventRefresh){
              this.anunciosList = [];
            }            
            console.log("data.result.content: ", data.result.content);
            /* this.anunciosList.push(...data.result.content); */
            if (eventInfinite) {
              if (data.result.content.length === 0) {
                eventInfinite.target.disabled = true;
                eventInfinite.target.complete();
                return;
              }
            }
            this.anunciosList.push(...data.result.content);            
            this.storage.set(this.idEmpresa + "_anuncios", this.anunciosList);
            this.completeEvent(eventInfinite, eventRefresh);
          } else {
            console.log(data.status);            
            this.completeEvent(eventInfinite, eventRefresh);
          }
        },
        (err) => {
          console.log(err);
          this.completeEvent(eventInfinite, eventRefresh);          
        }
      );
  }

  completeEvent(eventInfinite?, eventRefresh?){
    if (eventInfinite) {
      eventInfinite.target.complete();
    }
    if(eventRefresh){
      eventRefresh.target.complete();
    }
  }

  async cargarAnunciosTemporalesStorage(idEmpresa: number) {
    /* console.log("cargarAnunciosTemporalesStorage: ", idEmpresa + "_anuncios"); */
    const ann = await this.storage.get(idEmpresa + "_anuncios");
    /* console.log(idEmpresa+"_anuncios:"  + ann); */
    if (ann) {
      this.anunciosList = ann;
    } else {
      this.anunciosList = [];
    }
  }

  async cargarAnunciosLocalesStorage() {
    /* console.log('cargarAnunciosLocalesStorage');     */
    const anncios = await this.storage.get(this.userData.getIdEmpresa() + "_anuncios_local");
    console.log(this.userData.getIdEmpresa() + "_anuncios_local");
    /* console.log("anunciosListLocal: ", anncios); */
    if (anncios) {
      this.anunciosListLocal = anncios;
    } else {
      this.anunciosListLocal = [];
    }
  }

  loadData(event) {//Desde el infinite scroll
    /* console.log("load data"); */
    this.anunciosPage++;
    this.getAnuncios(this.anunciosPage, 10, event);
  }

  doRefresh(event) {    
    this.anunciosPage = 0;
    this.infiniteScroll.disabled = false;//Cada que se hace el refresh se habilita el componente infinite scroll
    this.getAnuncios(this.anunciosPage, 10, null, event);
  }

  toogleMenu(){
    this.menuCtrl.toggle();
  }

}

