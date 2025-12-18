import { Injectable } from '@angular/core';

export interface ExtractedData {
  vendor?: string;          // Razón Social
  cuit?: string;            // CUIT
  operation_number?: string; // N° Operación
  payment_method?: string;  // Método de Pago
  expense_type?: string;    // Tipo de Gasto
  vat?: string | number;    // IVA
  total_amount?: string | number; // Monto Total
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

      // 0. Caso especial: Estructura raw de Gemini/Vertex donde el JSON viene stringificado dentro de text
      // Estructura: { content: { parts: [ { text: "..." } ] } }
      if (rawResponse?.content?.parts?.[0]?.text) {
          try {
              let text = rawResponse.content.parts[0].text;
              // Limpiar bloques de código markdown si existen (ej: ```json ... ```)
              text = text.replace(/```json/g, '').replace(/```/g, '').trim();
              dataToMap = JSON.parse(text);
              console.log('JSON extraído y parseado desde content.parts[0].text:', dataToMap);
          } catch (e) {
              console.warn('Se detectó estructura Gemini pero falló el parseo JSON:', e);
              // Si falla, intentamos usar el rawResponse por si acaso
          }
      }
      // 1. Desempaquetar respuesta estándar n8n (array o propiedad 'data')
      else if (Array.isArray(rawResponse) && rawResponse.length > 0) {
        dataToMap = rawResponse[0];
      } else if (rawResponse.data) {
        dataToMap = rawResponse.data;
      } else if (rawResponse.body) {
        dataToMap = rawResponse.body;
      } else if (rawResponse.json) {
         dataToMap = rawResponse.json;
      }

      // 2. Función auxiliar para buscar valor insensible a mayúsculas/minúsculas y por alias
      const findValue = (keys: string[]): any => {
        if (!dataToMap || typeof dataToMap !== 'object') return '';
        
        const objKeys = Object.keys(dataToMap);
        const searchKeys = keys.map(k => k.toLowerCase());

        for (const objKey of objKeys) {
          if (searchKeys.includes(objKey.toLowerCase())) {
            return dataToMap[objKey];
          }
        }
        return '';
      };

      // 3. Limpieza de moneda (quita $ y espacios, maneja el 0 correctamente)
      const cleanMoney = (val: any) => {
        if (!val && val !== 0) return ''; 
        const str = String(val);
        // Si es solo números y puntos/comas, dejarlo. Si tiene $, quitarlo.
        return str.replace(/[$\s]/g, '').replace(',', '.'); 
      };

      // 4. Construir objeto normalizado usando las claves que mostró el usuario (monto, razon_social, etc.)
      const normalizedData: ExtractedData = {
        vendor: findValue(['vendor', 'razon_social', 'razón_social', 'nombre_fantasia', 'empresa', 'comercio', 'store', 'merchant']),
        cuit: findValue(['cuit', 'tax_id', 'ruc', 'rut', 'nif', 'identificacion_tributaria']),
        operation_number: findValue(['operation_number', 'n_operacion', 'n_ticket', 'numero_operacion', 'nro_ticket', 'ticket_number', 'invoice_no', 'comprobante', 'factura']),
        payment_method: findValue(['payment_method', 'metodo_pago', 'forma_pago', 'medio_pago', 'pago']),
        expense_type: findValue(['expense_type', 'tipo_gasto', 'categoria', 'rubro', 'category', 'item_type']),
        vat: cleanMoney(findValue(['vat', 'iva', 'impuesto', 'tax', 'monto_iva'])),
        total_amount: cleanMoney(findValue(['total_amount', 'monto', 'total', 'importe', 'amount', 'precio_total', 'final_amount']))
      };

      console.log('Datos normalizados para la App:', normalizedData);
      return normalizedData;

    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw error;
    }
  }

  async submitFinalData(modifiedData: ExtractedData, originalData: ExtractedData, originalFile: File): Promise<boolean> {
    const formData = new FormData();
    
    // 1. JSON Modificado por el usuario
    formData.append('data', JSON.stringify(modifiedData));
    
    // 2. JSON Original recibido del primer webhook
    formData.append('original_data', JSON.stringify(originalData));
    
    // 3. Imagen original
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