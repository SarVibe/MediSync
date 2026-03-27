import React from "react";

/**
 * InputField – reusable form input with label and inline error message.
 *
 * Props:
 *  id        – unique id (ties label → input)
 *  label     – visible label text
 *  type      – input type (text | email | password | number | tel)
 *  value     – controlled value
 *  onChange  – change handler
 *  error     – validation error string (optional)
 *  placeholder – placeholder text (optional)
 *  required  – boolean (optional)
 */
const InputField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder = "",
  required = false,
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label
        htmlFor={id}
        className="text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 bg-white
          outline-none transition-all duration-200
          placeholder:text-slate-400
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? "border-red-400 bg-red-50" : "border-slate-300 hover:border-blue-400"}`}
      />

      {error && (
        <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
          <span>⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
