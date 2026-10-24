import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/client'
import E from '../../api/endpoints'
import { AiLabel, PageHeader } from '../../components/ui'

const SUGGESTIONS = {
  admin: ['How many active employees do we have?', 'Who is on leave today?', 'What is the payroll summary this month?', 'What is the leave policy?'],
  hr: ['Who came late most often this month?', 'What is this month\'s attendance rate?', 'Who is on leave today?', 'What are the attendance rules?'],
  employee: ['How many sick leaves do I have left this year?', 'What is my attendance this month?', 'What is the late policy?', 'How is payroll calculated?'],
}

const friendly = (e) => {
  if (e.response?.status === 429) return 'You have reached the hourly AI limit. Please try again later.'
  if (e.code === 'ECONNABORTED') return 'The assistant took too long to respond. Please try again.'
  return 'The assistant is unavailable right now. You can still use the normal screens.'
}

export default function AiAssistant() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! Ask me about your data or company policy.' },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])

  const send = async (text) => {
    const q = (text ?? input).trim()
    if (!q || busy) return
    const history = messages.filter((m) => !m.error).slice(-10)
    setMessages((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setBusy(true)
    try {
      const { data } = await api.post(E.aiChat, { message: q, history }, { timeout: 20000 })
      setMessages((m) => [...m, { role: 'assistant', text: data.reply || data.answer || data.message, ai: true }])
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', text: friendly(e), error: true }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="AI Assistant" subtitle="Answers come from your real data, within your access" />
      <div className="card flex h-[70vh] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'bg-teal-600 text-white'
                    : m.error
                      ? 'bg-amber-50 text-amber-800'
                      : 'bg-slate-100 text-slate-800'
                }`}
              >
                {m.text}
                {m.ai && (
                  <div className="mt-1">
                    <AiLabel />
                  </div>
                )}
              </div>
            </div>
          ))}
          {busy && <div className="text-sm text-slate-400">Assistant is thinking...</div>}
          <div ref={endRef} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(SUGGESTIONS[user.role] || []).map((s) => (
            <button key={s} className="rounded-full border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <input className="input" placeholder="Type your question..." value={input} onChange={(e) => setInput(e.target.value)} />
          <button className="btn" disabled={busy || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </>
  )
}
