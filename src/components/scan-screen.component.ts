import { Component, output } from '@angular/core';

@Component({
  selector: 'app-scan-screen',
  standalone: true,
  template: `
    <div class="flex flex-col h-full w-full bg-white relative overflow-hidden">
      
      <!-- Top Instruction (Minimalist) -->
      <div class="px-6 pt-6 pb-2 shrink-0">
        <h2 class="text-[#003366] text-2xl font-bold tracking-tight">Nuevo Ticket</h2>
        <p class="text-gray-400 text-sm font-medium">Sube una foto clara del comprobante</p>
      </div>

      <!-- Main Trigger Area (Fills remaining space) -->
      <div class="flex-grow p-4 w-full flex flex-col">
        <label class="group relative flex-grow w-full bg-blue-50/30 rounded-[1.5rem] border-2 border-dashed border-blue-200 cursor-pointer transition-all duration-300 hover:bg-blue-50 hover:border-[#49a5c5] active:scale-[0.99] overflow-hidden">
          
          <div class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            
            <!-- Icon Circle -->
            <div class="w-24 h-24 rounded-full bg-white text-[#49a5c5] flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 shadow-sm border border-blue-100">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
            </div>
            
            <span class="text-[#003366] font-bold text-xl mb-1 block group-hover:text-[#49a5c5] transition-colors">
              Tomar Foto
            </span>
            <span class="text-gray-400 text-sm font-medium">
              Toca aquí para escanear
            </span>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            class="hidden" 
            (change)="onFileSelected($event)"
          />
        </label>
      </div>

      <!-- Bottom Status (Minimal) -->
      <div class="pb-6 px-6 shrink-0 text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">
           <span>Listo para capturar</span>
        </div>
      </div>

    </div>
  `
})
export class ScanScreenComponent {
  imageSelected = output<File>();

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.imageSelected.emit(file);
    }
  }
}