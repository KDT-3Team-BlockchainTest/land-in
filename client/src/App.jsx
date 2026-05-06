import PdfTextExtractor from './components/PdfTextExtractor'
import AuthTester from './components/AuthTester'
import './App.css'
import Header from './shared/header/header'

function App() {
  return (
    <div>
      <Header />
      <div className="min-h-screen bg-slate-100 px-4 py-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
          <AuthTester />
          <PdfTextExtractor />
        </div>
      </div>
    </div>
  )
}

export default App
