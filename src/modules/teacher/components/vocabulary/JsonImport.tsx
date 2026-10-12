import { AlertCircle } from 'lucide-react'

interface JsonImportProps {
  jsonInput: string
  setJsonInput: (json: string) => void
  jsonError: string
  setJsonError: (err: string) => void
  handleJsonImport: () => void
}

const JsonImport = ({ jsonInput, setJsonInput, jsonError, handleJsonImport }: JsonImportProps) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-start gap-2">
        <AlertCircle size={16} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Hỗ trợ import JSON dạng array chứa các object:{' '}
          <code className="bg-white px-1 py-0.5 rounded text-gray-800 font-mono">
            [{'{"word":"hello", "vi":"xin chào"}'}]
          </code>
          . Rất hữu ích khi copy từ file data chuẩn.
        </p>
      </div>
      <textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder="Dán mảng JSON vào đây..."
        className="w-full h-100 bg-gray-900 text-green-400 font-mono text-sm rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none custom-scrollbar"
      />
      {jsonError && <p className="text-red-500 text-sm font-medium">{jsonError}</p>}
      <button
        onClick={handleJsonImport}
        disabled={!jsonInput.trim()}
        className="px-6 py-2 bg-gray-900 text-white rounded-xl font-medium shadow-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        Import JSON Data
      </button>
    </div>
  )
}

export default JsonImport
