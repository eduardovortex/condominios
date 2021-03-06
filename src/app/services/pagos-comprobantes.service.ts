import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { environment } from 'src/environments/environment';
import { PagosComprobantes } from '../models/pagos-comprobantes.model';
import { DataLocalService } from './data-local.service';
import { UserData } from '../providers/user-data';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../models/api-response.model';
import { share } from 'rxjs/operators';
import { Observable } from 'rxjs/index';

@Injectable({
  providedIn: 'root'
})
export class PagosComprobantesService {

  pagosComprobantes: PagosComprobantes[] = [];
  pagosComprobantesValidar: PagosComprobantes[] = [];

/*   nombreEtiquetaJson ="pagoscomprobantes"; */

  baseUrl: string = environment.coreServiceBaseUrl;
  pagoComprobanteContext: string = environment.coreApiBasePagoComprobanteOperation;  
  nombreEtiqueta = "_pagos-comprobantes";
  nombreEtiquetaValidar = "_pagos-comprobantes-validar";

  constructor(private storage: Storage,
              private dataLocalService: DataLocalService,
              private userData:UserData,
              private http:HttpClient) {

    
  }

  /* construyeNombreEtiqueta(){
    return this.nombreEtiquetaJson = this.dataLocalService.idempresa + "_pagoscomprobantes";

  } */

  save(pagoComprobanteData: FormData): Observable<ApiResponse> {
    console.log('save pago comprobante:'+this.baseUrl + this.pagoComprobanteContext);    
    return this.http.post<ApiResponse>(this.baseUrl + this.pagoComprobanteContext, pagoComprobanteData).pipe(share());
  } 

  delete(id: number) : Observable<ApiResponse> {
    console.log('borrando pago comprobante: ',this.baseUrl + this.pagoComprobanteContext +environment.coreApiBaseDeleteOperation + "/" + id );    
    return this.http.delete<ApiResponse>(this.baseUrl + this.pagoComprobanteContext + environment.coreApiBaseDeleteOperation + "/" + id).pipe(share());
  }

  getPagosComprobantes(idEmpresa: number, page: number, size: number, filters: string){
    console.log(this.baseUrl + this.pagoComprobanteContext+ environment.coreApiGetPagoComprobanteListOperation +"/"+idEmpresa+"?page="+page+"&size="+size+(filters ? ('&filters=' + filters):''));
    return this.http.get<ApiResponse>(this.baseUrl + this.pagoComprobanteContext+ environment.coreApiGetPagoComprobanteListOperation +"/"+idEmpresa+"?page="+page+"&size="+size+(filters ? ('&filters=' + filters):'')).pipe(share());
  }

  updateStatus(data:FormData): Observable<ApiResponse> {
    console.log('updateStatusPagoComprobante: ', this.baseUrl + this.pagoComprobanteContext + '/updateStatus' );
    return this.http.patch<ApiResponse>(this.baseUrl + this.pagoComprobanteContext + '/updateStatus' ,data).pipe(share());    
  }

  /* 
  getAllAdeudosByEmpresaAndAgente(idEmpresa: number, idAgente:number){
    console.log('getAllAdeudosByEmpresaAndAgente: '+ this.baseUrl + this.pagoComprobanteContext+'/listByEmpresa'+"/"+idEmpresa);
    return this.http.get<ApiResponse>(this.baseUrl + this.pagoComprobanteContext+'/listByEmpresa'+"/"+idEmpresa).pipe(share());
  } */

  async getPagosComprobatesFromStorage(idEmpresa : number){
    console.log('getPagosComprobatesFromStorage: ', idEmpresa + this.nombreEtiqueta);   
     const arr = await this.storage.get(idEmpresa + this.nombreEtiqueta)
     console.log('arr: '+arr);    
     if (arr)  this.pagosComprobantes = arr;
     else this.pagosComprobantes =[];
   }

   async getPagosComprobatesValidarFromStorage(idEmpresa : number){
    console.log('getPagosComprobatesValidarFromStorage: ', idEmpresa + this.nombreEtiquetaValidar);   
     const arr = await this.storage.get(idEmpresa + this.nombreEtiquetaValidar)
     console.log('arr: '+arr);    
     if (arr)  this.pagosComprobantesValidar = arr;
     else this.pagosComprobantesValidar =[];
   }


/*   guardarPagoComprobante(pagoComprobante: PagosComprobantes) {
    const existe = this.pagosComprobantes.find( pag => pag.idpagocomprobante === pagoComprobante.idpagocomprobante );
    if(! existe ){
      pagoComprobante.idpagocomprobante = this.dataLocalService.getNumeroNegativo()*-1;      
      this.pagosComprobantes.unshift(pagoComprobante);
      this.storage.set(this.construyeNombreEtiqueta(), this.pagosComprobantes);
      this.dataLocalService.presentToast('Pago comprobante agregado');
    }
  } */
/* 
  borrarPagoComprobante(pagoComprobante: PagosComprobantes){
    this.pagosComprobantes = this.pagosComprobantes.filter(pag => pag.idpagocomprobante !== pagoComprobante.idpagocomprobante);
    this.storage.set(this.construyeNombreEtiqueta(), this.pagosComprobantes);
    this.dataLocalService.presentToast('Pago comprobante borrado');
  } */

/*   async cargarPagosComprobantes() {
    const pgsComprobantes = await this.storage.get(this.construyeNombreEtiqueta());
    if (pgsComprobantes) {
      this.pagosComprobantes = pgsComprobantes;
    }
  } */


}
