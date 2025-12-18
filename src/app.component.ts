import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, ExtractedData } from './services/api.service';
import { ScanScreenComponent } from './components/scan-screen.component';
import { ReviewScreenComponent } from './components/review-screen.component';

type AppState = 'SCAN' | 'PROCESSING' | 'REVIEW' | 'SUCCESS' | 'ERROR';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ScanScreenComponent, ReviewScreenComponent],
  template: `
    <!-- Global Container: Physis Blue Background -->
    <div class="h-[100dvh] w-full bg-[#49a5c5] flex items-center justify-center overflow-hidden font-sans">
      
      <!-- Main App Window -->
      <div class="w-full h-full sm:max-w-[480px] sm:h-[90vh] sm:max-h-[850px] bg-white sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative">
        
        <!-- Header: Physis Blue Background -->
        <header class="bg-[#49a5c5] pt-4 pb-2 px-6 flex items-center justify-end z-20 shrink-0 h-[70px]">
           <!-- Logo Directo (Sin contenedor blanco) -->
           <img src="https://physis.com.ar/wp-content/uploads/2025/02/physis.png" width="80" alt="Physis Logo" class="opacity-100">
        </header>

        <!-- Dynamic Content Area -->
        <main class="flex-grow flex flex-col relative bg-white overflow-hidden">
          
          @switch (currentState()) {
            
            @case ('SCAN') {
              <app-scan-screen 
                (imageSelected)="handleImageSelection($event)" 
                class="flex-grow flex flex-col h-full"
              ></app-scan-screen>
            }

            @case ('PROCESSING') {
              <div class="flex-grow flex flex-col items-center justify-center p-8 space-y-10 animate-in fade-in duration-500">
                <!-- Modern Ripple Loader -->
                <div class="relative flex items-center justify-center">
                  <div class="absolute w-32 h-32 bg-[#49a5c5]/20 rounded-full animate-ping"></div>
                  <div class="absolute w-24 h-24 bg-[#49a5c5]/40 rounded-full animate-pulse"></div>
                  <div class="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 z-10">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-[#003366] animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                     </svg>
                  </div>
                </div>

                <div class="text-center space-y-2 max-w-[240px]">
                  <h3 class="text-[#003366] font-bold text-xl">Analizando Imagen</h3>
                  <p class="text-gray-400 text-sm font-medium leading-relaxed">
                    Nuestra IA está extrayendo los datos del ticket...
                  </p>
                </div>
              </div>
            }

            @case ('REVIEW') {
              <app-review-screen
                [data]="extractedData()"
                [imageFile]="selectedFile()"
                (saveData)="handleFinalSubmit($event)"
                (cancel)="reset()"
                class="flex-grow flex flex-col h-full overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
              ></app-review-screen>
            }

            @case ('SUCCESS') {
              <div class="flex-grow flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-300 bg-white">
                <div class="w-24 h-24 bg-[#27c24c] rounded-full flex items-center justify-center shadow-lg shadow-green-200 mb-8 transform hover:scale-105 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div class="space-y-3 mb-12">
                  <h2 class="text-[#003366] font-bold text-3xl tracking-tight">¡Listo!</h2>
                  <p class="text-gray-500 text-base max-w-[260px] mx-auto leading-relaxed">
                    El comprobante ha sido procesado y enviado al sistema correctamente.
                  </p>
                </div>
                
                <button 
                  (click)="reset()"
                  class="w-full max-w-[280px] bg-[#003366] hover:bg-[#002850] text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-blue-900/10 transform active:scale-95 transition-all duration-200"
                >
                  Escanear Otro
                </button>
              </div>
            }

            @case ('ERROR') {
              <div class="flex-grow flex flex-col items-center justify-center p-8 text-center animate-in shake duration-300">
                <div class="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100 rotate-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div class="space-y-2 mb-8">
                  <h2 class="text-red-700 font-bold text-xl">Error de Procesamiento</h2>
                  <p class="text-gray-500 text-sm px-4 leading-relaxed">{{ errorMessage() }}</p>
                </div>
                <button 
                  (click)="reset()"
                  class="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Intentar Nuevamente
                </button>
              </div>
            }

          }
        </main>

        <!-- Footer -->
        <footer class="bg-gray-50 py-3 text-center shrink-0 border-t border-gray-100 z-20">
          <p class="text-[#003366]/60 text-[10px] font-bold uppercase tracking-widest">
            Physis Informática S.A.
          </p>
        </footer>

      </div>
    </div>
  `,
  styles: [`
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    .shake {
      animation: shake 0.4s ease-in-out;
    }
  `]
})
export class AppComponent {
  private apiService = inject(ApiService);

  // State
  currentState = signal<AppState>('SCAN');
  selectedFile = signal<File | null>(null);
  extractedData = signal<ExtractedData>({}); 
  errorMessage = signal<string>('');

  async handleImageSelection(file: File) {
    this.selectedFile.set(file);
    this.currentState.set('PROCESSING');
    this.errorMessage.set('');

    try {
      const data = await this.apiService.uploadImageForExtraction(file);
      this.extractedData.set(data); 
      this.currentState.set('REVIEW');
    } catch (error) {
      console.error(error);
      this.errorMessage.set('No pudimos conectar con el servidor de análisis. Verifica tu conexión.');
      this.currentState.set('ERROR');
    }
  }

  async handleFinalSubmit(modifiedData: ExtractedData) {
    const file = this.selectedFile();
    const originalData = this.extractedData(); 

    if (!file) return;

    try {
      const success = await this.apiService.submitFinalData(modifiedData, originalData, file);
      if (success) {
        this.currentState.set('SUCCESS');
      } else {
        throw new Error('Falló el envío final');
      }
    } catch (error) {
      console.error(error);
      this.errorMessage.set('No se pudo enviar la información final.');
      alert('Error al enviar. Por favor intente nuevamente.');
    }
  }

  reset() {
    this.selectedFile.set(null);
    this.extractedData.set({});
    this.currentState.set('SCAN');
    this.errorMessage.set('');
  }
}