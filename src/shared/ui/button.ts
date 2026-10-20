const base =
  'cursor-pointer rounded-md border px-3 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50';

export const btn = {
  default: `${base} border-slate-300 bg-white text-slate-700 enabled:hover:bg-slate-50`,
  primary: `${base} border-blue-600 bg-blue-600 text-white enabled:hover:bg-blue-700`,
  danger: `${base} border-red-600 bg-red-600 text-white enabled:hover:bg-red-700`,
};
