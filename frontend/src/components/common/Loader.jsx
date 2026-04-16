export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex gap-3 justify-center items-center p-6 bg-white rounded-2xl border border-emerald-100 shadow-sm">
      <div className="w-5 h-5 rounded-full border-2 border-emerald-600 animate-spin border-t-transparent" />
      <span className="text-sm font-medium text-slate-600">{text}</span>
    </div>
  );
}