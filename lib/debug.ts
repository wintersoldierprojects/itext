export const debugLog = (component: string, action: string, data?: any) => {
  const timestamp = new Date().toLocaleTimeString();
  if (typeof window !== 'undefined') {
    console.log(`🐛 [${timestamp}] [${component}] ${action}:`, data);
  }
  
  // Server-side logging
  console.log(`🐛 [${timestamp}] [${component}] ${action}:`, data);
};

export const debugError = (component: string, error: any) => {
  const timestamp = new Date().toLocaleTimeString();
  console.error(`❌ [${timestamp}] [${component}] Error:`, error);
};

export const debugAuth = (action: string, data?: any) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`🔐 [${timestamp}] [AUTH] ${action}:`, data);
};

export const debugNavigation = (from: string, to: string, data?: any) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`🧭 [${timestamp}] [NAV] ${from} → ${to}:`, data);
};

// Phase 2 specific debug functions
export const debugForm = (formName: string, action: string, data?: any) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`📝 [${timestamp}] [FORM-${formName}] ${action}:`, data);
};

export const debugStyle = (component: string, action: string, data?: any) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`🎨 [${timestamp}] [STYLE-${component}] ${action}:`, data);
};

export const debugValidation = (field: string, action: string, data?: any) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`✅ [${timestamp}] [VALIDATION-${field}] ${action}:`, data);
};