import { useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const initialSignupForm = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  name: '홍길동',
  nickname: 'tester',
  phone: '010-0000-0000',
  role: 'RENTER',
}

const initialLoginForm = {
  username: 'testuser',
  password: 'password123',
}

function AuthTester() {
  const [signupForm, setSignupForm] = useState(initialSignupForm)
  const [loginForm, setLoginForm] = useState(initialLoginForm)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const updateSignupForm = (event) => {
    const { name, value } = event.target
    setSignupForm((form) => ({ ...form, [name]: value }))
  }

  const updateLoginForm = (event) => {
    const { name, value } = event.target
    setLoginForm((form) => ({ ...form, [name]: value }))
  }

  const submitJson = async (path, payload) => {
    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? '요청 실패함')
      }

      setResult(data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm">
      <div className="mb-6">
        <h1 className="m-0 text-2xl font-semibold text-slate-950">로그인 테스트</h1>
        <p className="mt-2 text-sm text-slate-600">
          회원가입이랑 로그인 되는지 그냥 확인용
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form className="flex flex-col gap-3" onSubmit={(event) => {
          event.preventDefault()
          submitJson('/api/auth/signup', signupForm)
        }}>
          <h2 className="m-0 text-lg font-semibold text-slate-900">회원가입</h2>
          <TextInput label="아이디" name="username" value={signupForm.username} onChange={updateSignupForm} />
          <TextInput label="이메일" name="email" type="email" value={signupForm.email} onChange={updateSignupForm} />
          <TextInput label="비밀번호" name="password" type="password" value={signupForm.password} onChange={updateSignupForm} />
          <TextInput label="이름" name="name" value={signupForm.name} onChange={updateSignupForm} />
          <TextInput label="닉네임" name="nickname" value={signupForm.nickname} onChange={updateSignupForm} />
          <TextInput label="전화번호" name="phone" value={signupForm.phone} onChange={updateSignupForm} />
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            역할
            <select
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-slate-500"
              name="role"
              value={signupForm.role}
              onChange={updateSignupForm}
            >
              <option value="RENTER">임차인</option>
              <option value="OWNER">임대인</option>
              <option value="ADMIN">관리자</option>
            </select>
          </label>
          <button className="mt-2 h-10 rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:bg-slate-400" disabled={isLoading} type="submit">
            가입하기
          </button>
        </form>

        <form className="flex flex-col gap-3" onSubmit={(event) => {
          event.preventDefault()
          submitJson('/api/auth/login', loginForm)
        }}>
          <h2 className="m-0 text-lg font-semibold text-slate-900">로그인</h2>
          <TextInput label="아이디" name="username" value={loginForm.username} onChange={updateLoginForm} />
          <TextInput label="비밀번호" name="password" type="password" value={loginForm.password} onChange={updateLoginForm} />
          <button className="mt-2 h-10 rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:bg-slate-400" disabled={isLoading} type="submit">
            로그인하기
          </button>
        </form>
      </div>

      {error && (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <pre className="mt-5 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-50">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </section>
  )
}

function TextInput({ label, name, value, onChange, type = 'text' }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      <input
        className="h-10 rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none focus:border-slate-500"
        name={name}
        type={type}
        value={value}
        onChange={onChange}
      />
    </label>
  )
}

export default AuthTester
