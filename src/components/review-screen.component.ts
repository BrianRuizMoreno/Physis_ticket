import { Component, input, output, signal, computed, effect, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { ExtractedData } from '../services/api.service';
import { distinctUntilChanged } from 'rxjs/operators';

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
          
          <!-- Header -->
          <div class="flex items-center justify-between mb-6 border-b border-gray-100 pb-2 pt-2">
            <h3 class="text-[#003366] font-bold text-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#49a5c5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Datos Extraídos
            </h3>
            <span class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Revisar</span>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-5 pb-24 sm:pb-6">
            
            <!-- Vendor (Proveedor) -->
            <div class="form-group">
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Razón Social</label>
              <input 
                type="text" 
                formControlName="proveedor"
                class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#49a5c5]/20 focus:border-[#49a5c5] transition-all placeholder:text-gray-300"
                placeholder="Ej. Supermercado X"
              />
            </div>

            <!-- Date & CUIT Grid -->
            <div class="grid grid-cols-2 gap-4">
               <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Fecha</label>
                <input 
                  type="date" 
                  formControlName="fecha"
                  class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#49a5c5]/20 focus:border-[#49a5c5] transition-all"
                />
              </div>
               <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">CUIT</label>
                <input 
                  type="text" 
                  formControlName="cuit"
                  class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#49a5c5]/20 focus:border-[#49a5c5] transition-all"
                  placeholder="20-..."
                />
              </div>
            </div>

            <!-- Operation Number & Payment Method -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">N° Operación</label>
                <input 
                  type="text" 
                  formControlName="numero_operacion"
                  class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#49a5c5]/20 focus:border-[#49a5c5] transition-all"
                  placeholder="#0000"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Medio Pago</label>
                <input 
                  type="text" 
                  formControlName="metodo_pago"
                  class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#49a5c5]/20 focus:border-[#49a5c5] transition-all"
                  placeholder="Ej. Efectivo"
                />
              </div>
            </div>
            
            <!-- Expense Type (Tipo Gasto) -->
             <div>
                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Tipo de Gasto</label>
                <input 
                  type="text" 
                  formControlName="tipo_gasto"
                  class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#49a5c5]/20 focus:border-[#49a5c5] transition-all"
                  placeholder="Categoría (Ej. Viáticos)"
                />
              </div>

            <!-- Items Description -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Descripción de Items</label>
              <textarea 
                formControlName="descripcion_items"
                rows="2"
                class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#49a5c5]/20 focus:border-[#49a5c5] transition-all resize-none"
                placeholder="Ingrese detalle de los productos o servicios..."
              ></textarea>
            </div>

            <!-- Financials Card -->
            <div class="mt-2 bg-[#f8faff] p-4 rounded-xl border border-blue-50/50">
              
              <!-- VAT (IVA) -->
              <div class="mb-4">
                 <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">IVA</label>
                 <div class="relative">
                   <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                   <input 
                     type="text" 
                     formControlName="iva"
                     class="w-full p-3 pl-7 bg-white border border-gray-200 rounded-lg text-gray-600 text-sm focus:outline-none focus:border-[#49a5c5] transition-all"
                     placeholder="0.00"
                   />
                 </div>
              </div>

              <!-- Other Expenses Dynamic Section (Otros Gastos) -->
              <div class="mb-5">
                 <div class="flex items-center justify-between mb-2">
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Otros Gastos</label>
                    <button 
                      type="button" 
                      (click)="addOtherExpense()"
                      class="text-[10px] font-bold text-[#49a5c5] border border-[#49a5c5]/30 rounded px-2 py-0.5 hover:bg-[#49a5c5]/10 transition-colors"
                    >
                      + AGREGAR
                    </button>
                 </div>

                 <!-- Dynamic List -->
                 <div formArrayName="otros_gastos" class="space-y-2">
                    @for (control of otherExpensesControls.controls; track $index) {
                      <div [formGroupName]="$index" class="flex gap-2 items-start animate-in fade-in slide-in-from-top-1 duration-200">
                         <!-- Concept (Descripcion) -->
                         <div class="flex-grow">
                           <input 
                             type="text" 
                             formControlName="descripcion"
                             class="w-full h-9 p-2 bg-white border border-gray-200 rounded-lg text-gray-800 text-xs focus:border-[#49a5c5] outline-none placeholder:text-gray-400"
                             placeholder="Concepto (ej. Propina)"
                           />
                         </div>
                         <!-- Amount (Monto) -->
                         <div class="w-28 relative">
                            <span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                            <input 
                              type="text" 
                              formControlName="monto"
                              class="w-full h-9 p-2 pl-5 bg-white border border-gray-200 rounded-lg text-gray-800 text-xs focus:border-[#49a5c5] outline-none font-medium placeholder:text-gray-300"
                              placeholder="0.00"
                            />
                         </div>
                         <!-- Delete -->
                         <button 
                           type="button" 
                           (click)="removeOtherExpense($index)"
                           class="h-9 w-9 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                           </svg>
                         </button>
                      </div>
                    }
                    @if (otherExpensesControls.length === 0) {
                      <div class="text-xs text-gray-400 italic text-center py-2 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                        No hay gastos adicionales
                      </div>
                    }
                 </div>
              </div>

              <div class="h-px bg-gray-200 my-4"></div>

              <!-- Total Amount (Monto Total) -->
              <div>
                <label class="block text-xs font-extrabold text-[#003366] uppercase tracking-wide mb-1.5 ml-1">Total</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#003366] font-bold text-lg">$</span>
                  <input 
                    type="text" 
                    formControlName="monto_total"
                    class="w-full p-3 pl-8 bg-white border border-[#55c1e6] rounded-lg text-[#003366] font-extrabold text-xl focus:outline-none focus:ring-4 focus:ring-[#49a5c5]/10 transition-all shadow-sm"
                    placeholder="0.00"
                  />
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
  
  private baseTotal: number = 0;
  private isProgrammaticUpdate = false;

  imageUrl = computed(() => {
    const file = this.imageFile();
    return file ? URL.createObjectURL(file) : null;
  });

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      proveedor: ['', Validators.required],
      fecha: [''],
      cuit: [''],
      numero_operacion: [''],
      metodo_pago: [''],
      tipo_gasto: [''],
      descripcion_items: [''],
      otros_gastos: this.fb.array([]),
      iva: [''],
      monto_total: ['', Validators.required]
    });

    // Listen to changes in Other Expenses array
    this.form.get('otros_gastos')?.valueChanges.subscribe(() => {
        this.updateTotal();
    });

    // Listen to manual changes in Total
    this.form.get('monto_total')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((val) => {
        if (!this.isProgrammaticUpdate) {
           const currentTotal = this.parseAmount(val);
           const currentExtras = this.calculateExtrasSum();
           this.baseTotal = currentTotal - currentExtras;
        }
    });

    effect(() => {
      const d = this.data();
      if (d) {
        this.form.patchValue({
          proveedor: d.proveedor || '',
          fecha: d.fecha || '',
          cuit: d.cuit || '',
          numero_operacion: d.numero_operacion || '',
          metodo_pago: d.metodo_pago || '',
          tipo_gasto: d.tipo_gasto || '',
          descripcion_items: d.descripcion_items || '',
          iva: d.iva || '',
          monto_total: d.monto_total || ''
        }, { emitEvent: false });

        this.otherExpensesControls.clear();
        let initialExtrasSum = 0;

        if (d.otros_gastos && Array.isArray(d.otros_gastos)) {
          d.otros_gastos.forEach(exp => {
             this.addOtherExpense(exp.descripcion, exp.monto, false);
             initialExtrasSum += this.parseAmount(exp.monto);
          });
        }

        const initialTotal = this.parseAmount(d.monto_total);
        this.baseTotal = initialTotal - initialExtrasSum;
      }
    });
  }

  get otherExpensesControls() {
    return this.form.get('otros_gastos') as FormArray;
  }

  addOtherExpense(desc: string = '', amt: string | number = '', emitEvent = true) {
    const group = this.fb.group({
      descripcion: [desc],
      monto: [amt]
    });
    if (!emitEvent) {
       this.otherExpensesControls.push(group, { emitEvent: false });
    } else {
       this.otherExpensesControls.push(group);
    }
  }

  removeOtherExpense(index: number) {
    this.otherExpensesControls.removeAt(index);
  }

  private updateTotal() {
    const extrasSum = this.calculateExtrasSum();
    const newTotal = this.baseTotal + extrasSum;
    this.isProgrammaticUpdate = true;
    this.form.get('monto_total')?.setValue(newTotal.toFixed(2), { emitEvent: true });
    this.isProgrammaticUpdate = false;
  }

  private calculateExtrasSum(): number {
    const controls = this.otherExpensesControls.controls;
    let sum = 0;
    controls.forEach(ctrl => {
      const val = ctrl.get('monto')?.value;
      sum += this.parseAmount(val);
    });
    return sum;
  }

  private parseAmount(val: any): number {
    if (!val) return 0;
    const str = String(val).replace(/[$\s]/g, '').replace(',', '.');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
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