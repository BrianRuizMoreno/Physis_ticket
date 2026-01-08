import { Injectable } from '@angular/core';

export interface ExtractedData {
  proveedor?: string;          // Antes vendor
  fecha?: string;              // Antes date (YYYY-MM-DD)
  cuit?: string;               // CUIT
  numero_operacion?: string;   // Antes operation_number
  metodo_pago?: string;        // Antes payment_method
  tipo_gasto?: string;         // Antes expense_type
  descripcion_items?: string;  // Antes items_description
  otros_gastos?: { descripcion: string, monto: string | number }[]; // Antes other_expenses
  iva?: string | number;       // Antes vat
  monto_total?: string | number; // Antes total_amount
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly WEBHOOK_A_URL = 'https://n8n.automatizaciones-physis.cloud/webhook/ProcesaImagen';
  private readonly WEBHOOK_B_URL = 'https://n8n.automatizaciones-physis.cloud/webhook/RecibeInfo';

  async uploadImageForExtraction(file: File): Promise<ExtractedData> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(this.WEBHOOK_A_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
      }

      const rawResponse = await response.json();
      console.log('Respuesta cruda de n8n:', rawResponse);

      // --- Lógica de Normalización ---
      
      let dataToMap = rawResponse;

      // 0. Caso especial: Estructura raw de Gemini/Vertex
      if (rawResponse?.content?.parts?.[0]?.text) {
          try {
              let text = rawResponse.content.parts[0].text;
              text = text.replace(/```json/g, '').replace(/```/g, '').trim();
              dataToMap = JSON.parse(text);
          } catch (e) {
              console.warn('Se detectó estructura Gemini pero falló el parseo JSON:', e);
          }
      }
      else if (Array.isArray(rawResponse) && rawResponse.length > 0) {
        dataToMap = rawResponse[0];
      } else if (rawResponse.data) {
        dataToMap = rawResponse.data;
      } else if (rawResponse.body) {
        dataToMap = rawResponse.body;
      } else if (rawResponse.json) {
         dataToMap = rawResponse.json;
      }

      // 2. Helpers
      const findValue = (keys: string[]): any => {
        if (!dataToMap || typeof dataToMap !== 'object') return '';
        const objKeys = Object.keys(dataToMap);
        const searchKeys = keys.map(k => k.toLowerCase());
        for (const objKey of objKeys) {
          if (searchKeys.includes(objKey.toLowerCase())) return dataToMap[objKey];
        }
        return '';
      };

      const cleanMoney = (val: any) => {
        if (!val && val !== 0) return ''; 
        const str = String(val);
        return str.replace(/[$\s]/g, '').replace(',', '.'); 
      };

      // Normalizar fecha a YYYY-MM-DD para input type="date"
      const cleanDate = (val: any): string => {
        if (!val) return '';
        let str = String(val).trim();
        
        // Si ya es YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

        // Intentar parsear DD/MM/YYYY o DD-MM-YYYY
        const ddmmyyyy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        if (ddmmyyyy) {
            const day = ddmmyyyy[1].padStart(2, '0');
            const month = ddmmyyyy[2].padStart(2, '0');
            const year = ddmmyyyy[3];
            return `${year}-${month}-${day}`;
        }
        
        // Intentar parsear DD/MM/YY
        const ddmmyy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/);
        if (ddmmyy) {
             const day = ddmmyy[1].padStart(2, '0');
            const month = ddmmyy[2].padStart(2, '0');
            const year = '20' + ddmmyy[3];
            return `${year}-${month}-${day}`;
        }
        return '';
      };

      // Normalización de Otros Gastos
      let rawOther = findValue(['other_expenses', 'otros_gastos', 'otros', 'propina', 'tip', 'percepciones', 'impuestos_internos']);
      let normalizedOtherExpenses: { descripcion: string, monto: string | number }[] = [];

      if (Array.isArray(rawOther)) {
        normalizedOtherExpenses = rawOther.map((item: any) => ({
           descripcion: item.description || item.descripcion || item.concepto || 'Gasto Extra',
           monto: cleanMoney(item.amount || item.monto || 0)
        }));
      } else if (rawOther) {
        normalizedOtherExpenses = [{
          descripcion: 'Varios / Otros',
          monto: cleanMoney(rawOther)
        }];
      }

      // Construcción del objeto en Español
      const normalizedData: ExtractedData = {
        proveedor: findValue(['vendor', 'proveedor', 'razon_social', 'razón_social', 'nombre_fantasia', 'empresa', 'comercio', 'store', 'merchant']),
        fecha: cleanDate(findValue(['date', 'fecha', 'fecha_emision', 'emision', 'issued_at', 'time', 'day'])),
        cuit: findValue(['cuit', 'tax_id', 'ruc', 'rut', 'nif', 'identificacion_tributaria']),
        numero_operacion: findValue(['operation_number', 'numero_operacion', 'n_operacion', 'n_ticket', 'numero_operacion', 'nro_ticket', 'ticket_number', 'invoice_no', 'comprobante', 'factura']),
        metodo_pago: findValue(['payment_method', 'metodo_pago', 'forma_pago', 'medio_pago', 'pago']),
        tipo_gasto: findValue(['expense_type', 'tipo_gasto', 'categoria', 'rubro', 'category', 'item_type']),
        descripcion_items: findValue(['items_description', 'descripcion_items', 'description', 'descripcion', 'detalle', 'items', 'conceptos', 'glosa']),
        otros_gastos: normalizedOtherExpenses,
        iva: cleanMoney(findValue(['vat', 'iva', 'impuesto', 'tax', 'monto_iva'])),
        monto_total: cleanMoney(findValue(['total_amount', 'monto_total', 'monto', 'total', 'importe', 'amount', 'precio_total', 'final_amount']))
      };

      console.log('Datos normalizados (ES):', normalizedData);
      return normalizedData;

    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw error;
    }
  }

  async submitFinalData(modifiedData: ExtractedData, originalData: ExtractedData, originalFile: File): Promise<boolean> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(modifiedData));
    formData.append('original_data', JSON.stringify(originalData));
    formData.append('file', originalFile);

    try {
      const response = await fetch(this.WEBHOOK_B_URL, {
        method: 'POST',
        body: formData
      });
      return response.ok;
    } catch (error) {
      console.error('Error enviando datos finales:', error);
      return false;
    }
  }
}