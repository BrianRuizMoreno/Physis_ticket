import { Component, input, output, signal, computed, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { ExtractedData } from '../services/api.service';

@Component({
  selector: 'app-review-screen',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  template: `
    <div class="w-full flex flex-col h-full bg-gray-50/30">
      
      <!-- Split View Container -->
      <div class="flex-grow flex flex-col overflow-hidden relative">
        
        <!-- Image Preview (Collapsible / Resizable) -->
        <div class="w-full h-48 sm:h-56 bg-gray-900 flex-shrink-0 relative shadow-inner overflow-hidden group">
          @if (imageUrl()) {
            <img [src]="imageUrl()" alt="Receipt Preview" class="w-full h-full object-contain opacity-90 transition-opacity group-hover:opacity-100" />
          }
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
          <div class="absolute bottom-3 left-3 flex items-center gap-2">
             <span class="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10">
               IMAGEN ORIGINAL
             </span>
          </div>
        </div>

        <!-- Form Section (Scrollable) -->
        <div class="flex-grow overflow-y-auto px-5 py-6 sm:px-8 bg-white rounded-t-2xl -mt-4 relative z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          
          <div class="flex items-center justify-between mb-6 border-b border-gray-100 pb-2 sticky top-0 bg-white z-20 pt-2">
            <h3 class="text-[#003366] font-bold text-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#49a5c5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Datos Extraídos
            </h3>
            <span class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Revisar</span>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-5 pb-24 sm:pb-6">
            
            <!-- Vendor -->
            <div class="form-group">
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Razón Social</label>
              <input 
                type="text" 
                formControlName="vendor"
                class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#49a5c5]/20 focus:border-[#49a5c5] transition-all placeholder:text-gray-300"
                placeholder="Ej. Supermercado X"
              />
            </div>

            <!-- CUIT & Operation Number Grid -->
            <div class="grid grid-cols-2 gap-4">
               <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">CUIT</label>
                <input 
                  type="text" 
                  formControlName="cuit"
                  class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#49a5c5]/20 focus:border-[#49a5c5] transition-all"
                  placeholder="20-..."
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">N° Operación</label>
                <input 
                  type="text" 
                  formControlName="operation_number"
                  class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#49a5c5]/20 focus:border-[#49a5c5] transition-all"
                  placeholder="#0000"
                />
              </div>
            </div>
            
            <!-- Payment & Expense Type -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Método de Pago</label>
                <input 
                  type="text" 
                  formControlName="payment_method"
                  class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#49a5c5]/20 focus:border-[#49a5c5] transition-all"
                  placeholder="Efectivo / Tarjeta"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Tipo de Gasto</label>
                <input 
                  type="text" 
                  formControlName="expense_type"
                  class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#49a5c5]/20 focus:border-[#49a5c5] transition-all"
                  placeholder="Categoría"
                />
              </div>
            </div>

            <!-- Financials Card -->
            <div class="mt-2 bg-[#f8faff] p-4 rounded-xl border border-blue-50/50">
              <div class="grid grid-cols-2 gap-4 items-end">
                 <!-- VAT -->
                 <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">IVA</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                    <input 
                      type="text" 
                      formControlName="vat"
                      class="w-full p-3 pl-7 bg-white border border-gray-200 rounded-lg text-gray-600 text-sm focus:outline-none focus:border-[#49a5c5] transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <!-- Total Amount (Highlighted) -->
                <div>
                  <label class="block text-xs font-extrabold text-[#003366] uppercase tracking-wide mb-1.5 ml-1">Total</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#003366] font-bold text-lg">$</span>
                    <input 
                      type="text" 
                      formControlName="total_amount"
                      class="w-full p-3 pl-8 bg-white border border-[#55c1e6] rounded-lg text-[#003366] font-extrabold text-xl focus:outline-none focus:ring-4 focus:ring-[#49a5c5]/10 transition-all shadow-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>
      </div>

      <!-- Sticky Bottom Action Bar -->
      <div class="border-t border-gray-100 bg-white p-4 pb-6 sm:pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30">
        <div class="flex gap-3 max-w-md mx-auto">
          <button 
            type="button"
            (click)="onCancel()"
            [disabled]="submitting()"
            class="flex-1 bg-white text-gray-600 font-bold py-3.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          
          <button 
            (click)="onSubmit()"
            [disabled]="submitting()"
            class="flex-[2] bg-[#27c24c] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-[#22aa42] transition-colors shadow-lg shadow-green-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 transform active:scale-98"
          >
            @if (submitting()) {
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            } @else {
              CONFIRMAR
            }
          </button>
        </div>
      </div>
      
    </div>
  `
})
export class ReviewScreenComponent {
  data = input.required<ExtractedData>();
  imageFile = input.required<File | null>();
  saveData = output<ExtractedData>();
  cancel = output<void>();

  submitting = signal(false);
  form: FormGroup;
  
  imageUrl = computed(() => {
    const file = this.imageFile();
    return file ? URL.createObjectURL(file) : null;
  });

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      vendor: ['', Validators.required],
      cuit: [''],
      operation_number: [''],
      payment_method: [''],
      expense_type: [''],
      vat: [''],
      total_amount: ['', Validators.required]
    });

    effect(() => {
      const d = this.data();
      console.log('Datos recibidos en el formulario:', d);
      if (d) {
        // Map data from normalized JSON to Form Controls
        this.form.patchValue({
          vendor: d.vendor || '',
          cuit: d.cuit || '',
          operation_number: d.operation_number || '',
          payment_method: d.payment_method || '',
          expense_type: d.expense_type || '',
          vat: d.vat || '',
          total_amount: d.total_amount || ''
        });
      }
    });
  }

  onSubmit() {
    if (this.form.valid && !this.submitting()) {
      this.submitting.set(true);
      this.saveData.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel() {
    if (!this.submitting()) {
      this.cancel.emit();
    }
  }
}