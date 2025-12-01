import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Financa {
  _id?: string;
  tipo: 'Entrada' | 'Saida';
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  classe?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FinancasService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/financas';

  listar(): Observable<Financa[]> {
    return this.http.get<Financa[]>(this.base);
  }

  buscarPorId(id: string): Observable<Financa> {
    return this.http.get<Financa>(`${this.base}/${id}`);
  }

  criar(financa: Financa): Observable<Financa> {
    console.log(financa);
    return this.http.post<Financa>(this.base, financa);
  }

  atualizar(id: string, financa: Partial<Financa>): Observable<Financa> {
    return this.http.put<Financa>(`${this.base}/${id}`, financa);
  }

  excluir(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
