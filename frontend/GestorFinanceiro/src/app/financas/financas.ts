import { Component, OnInit, inject } from '@angular/core';
import { FinancasService, Financa } from '../financas-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-financas',
  imports: [FormsModule, CommonModule],
  templateUrl: './financas.html',
  standalone: true,
  styleUrl: './financas.css',
})

export class Financas {
  private api = inject(FinancasService);

  financas: Financa[] = [];
  carregando = false;
  salvando = false;
  erro = '';

  tipo = '';
  categoria = '';
  descricao = '';
  data = '';
  valor: number | null = null;

  filtroCategoria: string = 'todas';


  ngOnInit() { this.carregar(); }

  carregar() {
    this.carregando = true;
    this.api.listar().subscribe({
      next: xs => { this.financas = xs.map(f => ({ ...f, classe: this.getCategoriaClasse(f.categoria) }));; this.carregando = false; },
      error: e => { this.erro = e.message ?? 'Falha ao carregar'; this.carregando = false; }
    });
  }

  getCategoriaClasse(cat: string): string {
    const c = (cat || '').toLowerCase();
    if (c.includes('salário')) return 'cat-salario';
    if (c.includes('alimentação')) return 'cat-alimentacao';
    if (c.includes('transporte')) return 'cat-transporte';
    if (c.includes('lazer')) return 'cat-lazer';
    if (c.includes('moradia')) return 'cat-moradia';
    return 'cat-outros';
  }

  get totalEntradas() {
    return this.financas
      .filter(f => f.tipo === 'Entrada')
      .reduce((soma, f) => soma + Number(f.valor), 0);
  }

  get totalSaidas() {
    return this.financas
      .filter(f => f.tipo === 'Saida')
      .reduce((soma, f) => soma + Number(f.valor), 0);
  }

  get totalGeral() {
    return this.totalEntradas - this.totalSaidas;
  }

  get financasFiltradas() {
    if (this.filtroCategoria === 'todas') {
      return this.financas;
    }

    return this.financas.filter(f => f.categoria === this.filtroCategoria);
  }


  criar() {
    if (!this.tipo || !this.categoria || !this.descricao || !this.data || this.valor === null) return;

    const financa: Financa = {
      tipo: this.tipo as 'Entrada' | 'Saida',
      categoria: this.categoria,
      descricao: this.descricao,
      data: this.data,
      valor: this.valor
    };

    this.salvando = true;
    this.api.criar(financa).subscribe({
      next: _ => {
        this.tipo = '';
        this.categoria = '';
        this.descricao = '';
        this.data = '';
        this.valor = null;
        this.salvando = false;
        this.carregar();
      },
      error: e => {
        this.erro = e.message ?? 'Falha ao criar'; this.salvando = false;
      }
    });
  }

  atualizar(financa: Financa) {
    const novoValor = prompt("Novo valor:", financa.valor.toString());

    if (novoValor === null) return; // cancelou

    const valorConvertido = Number(novoValor);

    if (isNaN(valorConvertido)) {
      alert("Valor inválido");
      return;
    }

    this.api.atualizar(financa._id!, { valor: valorConvertido }).subscribe({
      next: () => this.carregar(),
      error: e => this.erro = e.message ?? "Erro ao atualizar"
    });
  }


  excluir(id?: string) {
    if (!id) return;

    this.api.excluir(id).subscribe({
      next: _ => { this.carregar(); },
      error: e => { this.erro = e.message ?? 'Falha ao excluir'; }
    });
  }
}
