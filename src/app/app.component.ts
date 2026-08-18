import { Component } from '@angular/core';

interface Operacion {
  numero1: number;
  numero2: number;
  operador: string;
  resultado: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  numero1: number | null = null;
  numero2: number | null = null;
  operador: string = '+';

  resultado: number | null = null;

  historial: Operacion[] = [];

  calcular(): void {
    if (this.numero1 === null || this.numero2 === null) {
      return;
    }

    let resultado = 0;

    switch (this.operador) {
      case '+':
        resultado = this.numero1 + this.numero2;
        break;
      case '-':
        resultado = this.numero1 - this.numero2;
        break;
      case '*':
        resultado = this.numero1 * this.numero2;
        break;
      case '/':
        if (this.numero2 === 0) {
          alert('No se puede dividir entre 0');
          return;
        }
        resultado = this.numero1 / this.numero2;
        break;
    }

    this.resultado = resultado;

    this.historial.unshift({
      numero1: this.numero1,
      numero2: this.numero2,
      operador: this.operador,
      resultado: resultado
    });
  }

  limpiarHistorial(): void {
    this.historial = [];
  }

  simboloOperador(operador: string): string {
    switch (operador) {
      case '+': return '+';
      case '-': return '-';
      case '*': return '×';
      case '/': return '÷';
      default: return operador;
    }
  }
}
