import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { retry, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { Product, ProductDTO, UpdateProductDTO } from './../models/product.model';

import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private apiUrl = `${environment.API_URL}/api/v1/products`;

  constructor(
    private http: HttpClient
  ) { }

  getAllProducts(limit?: number, offset?: number) {
    let params = new HttpParams();
    if (limit != undefined && offset != undefined) {
      params = params.set('limit', limit);
      params = params.set('offset', offset);
    }
    return this.http.get<Product[]>(this.apiUrl, { params })
      .pipe(
        retry(3)
      );
  }

  getProductById(id: string) {
    return this.http.get<Product>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === HttpStatusCode.Conflict) {
            return throwError(()=> new Error("Algo falla en el servidor"));
          }
          if (error.status === HttpStatusCode.NotFound|| error.status === HttpStatusCode.BadRequest) {
            return throwError(()=> new Error("El prodcuto no existe"));
          }
          if (error.status === HttpStatusCode.Unauthorized) {
            return throwError(()=> new Error("No estas autorizado"));
          }
          return throwError(()=> new Error("Algo salio mal"));
        })
      );
  }

  getByPage(limit: number, offset: number) {
    return this.http.get<Product[]>(`${this.apiUrl}`, {
      params: {
        limit,
        offset
      }
    });
  }

  create(dto: ProductDTO) {
    return this.http.post<Product>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateProductDTO) {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string) {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

}
