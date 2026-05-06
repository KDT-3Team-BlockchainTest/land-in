import { useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function PdfTextExtractor() {
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [filename, setFilename] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] ?? null
    setFile(selectedFile)
    setText('')
    setFilename('')
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!file) {
      setError('pdf 선택 바람')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/pdf/extract`, {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? 'pdf text 추출 실패.')
      }

      setFilename(result.data?.filename ?? file.name)
      setText(result.data?.text ?? '')
    } catch (requestError) {
      setError(requestError.message)
      setText('')
      setFilename('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm">
      <div className="mb-6">
        <h1 className="m-0 text-2xl font-semibold text-slate-950">PDF</h1>
        <p className="mt-2 text-sm text-slate-600">
          pdf 업로드 하면 아래 내용 채워집니당.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-slate-400 hover:bg-slate-100">
          <span className="text-sm font-medium text-slate-900">
            {file ? file.name : 'Choose PDF file'}
          </span>
          <span className="mt-1 text-xs text-slate-500">Max 10MB</span>
          <input className="sr-only" type="file" accept="application/pdf" onChange={handleFileChange} />
        </label>

        <button
          className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? '추출중...' : '성공'}
        </button>
      </form>

      {error && (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {filename && (
        <div className="mt-6">
          <div className="mb-2 text-sm font-medium text-slate-700">{filename}</div>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-50">
            {text || '추출된 텍스트 없음.'}
          </pre>
        </div>
      )}
    </section>
  )
}

export default PdfTextExtractor
