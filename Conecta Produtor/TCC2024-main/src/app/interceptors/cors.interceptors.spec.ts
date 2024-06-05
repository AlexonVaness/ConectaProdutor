import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CorsInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Adicione lógica aqui para manipular os cabeçalhos CORS
    const newRequest = request.clone({
      // Adicione cabeçalhos CORS necessários aqui
    });
    return next.handle(newRequest);
  }
}
