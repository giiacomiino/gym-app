/* Configuración de Supabase. La anon key es pública por diseño: el acceso a los
   datos lo protege RLS (cada fila solo es visible para su dueño). Deja vacío
   para usar la app solo con almacenamiento local. */
window.ACL_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: ''
};
