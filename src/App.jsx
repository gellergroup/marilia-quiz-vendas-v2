import { useState, useEffect } from 'react'
import './index.css'
import { questions, resultsData } from './data'
import shoesImage from './assets/sb-shoes-white.webp'
import { ShieldCheck, Heart, Video, Brain, CalendarDays, Eye, Target, Gift, ArrowUpRight, Clock3, ListChecks, Sparkles, ArrowRight, Copy, Check } from 'lucide-react'

const WEBHOOK_URL = 'https://n8n.painel.alpsdigital.com.br/webhook/quiz-marilian-18082026'

const getUtmParams = () => {
  const params = new URLSearchParams(window.location.search)
  return Object.fromEntries(
    [...params.entries()].filter(([key]) => key.toLowerCase().startsWith('utm_'))
  )
}

const getPhoneDigits = (value = '') => value.replace(/\D/g, '').slice(0, 11)

const formatWhatsapp = (value) => {
  const digits = getPhoneDigits(value)
  if (!digits) return ''
  if (digits.length < 3) return `(${digits}`
  if (digits.length < 8) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function App() {
  const [step, setStep] = useState(() => new URLSearchParams(window.location.search).has('resultado') ? 12 : 0) // use ?resultado for visual QA
  const [answers, setAnswers] = useState({})
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    openQuestion: '',
    learningStyle: '',
    investment: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [couponCopied, setCouponCopied] = useState(false)

  // Fix: Move useEffect to the top level to obey Rules of Hooks
  useEffect(() => {
    if (step === 11) {
      const timer = setTimeout(() => {
        setStep(12)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [step])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [step])

  // Intro Screen
  if (step === 0) {
    return (
      <div className="container intro-container fade-in">
        <div className="card text-center premium-card">
          <div className="intro-header">
            <span className="intro-eyebrow"><Sparkles size={15} /> Diagnóstico de posicionamento</span>
            <h1>Em 10 minutos você vai entender por que o seu nome ainda não é <em>lembrado no mercado.</em></h1>
          </div>

          <div className="intro-body">
            <div className="intro-context">
              <p>Eu convivo há anos com mulheres competentes que continuam invisíveis fora do próprio raio.</p>
              <p>Empresa em movimento, cliente fiel, faturamento bom <strong>e o nome que não circula.</strong></p>
              <p>É para elas que eu estou <strong>preparando uma coisa única, que eu nunca vi ninguém fazer:</strong> para a empresária e a profissional que <strong>quer ser lembrada pelo nome, e não pelo serviço que entrega.</strong></p>
            </div>
            <div className="highlight-box">
              <span className="highlight-icon"><Eye size={23} /></span>
              <p>Mas antes, você precisa entender o <strong>quanto o mercado enxerga de você</strong> hoje e onde está o buraco <strong>entre a mulher que você já se tornou e a imagem que chega antes dela</strong>.</p>
            </div>

            <div className="intro-meta" aria-label="Informações sobre o diagnóstico">
              <div><Clock3 size={20} /><span><b>10 minutos</b><small>rápido e direto</small></span></div>
              <div><ListChecks size={20} /><span><b>São 9 perguntas</b><small>e você entende por onde precisa começar para mudar esse cenário</small></span></div>
            </div>

            <div className="gift-callout"><span><Gift size={21} /></span><p><b>Responda até o final para receber um presente surpresa.</b></p></div>
          </div>

          <button className="primary-btn intro-cta" onClick={() => setStep(1)}><span>QUERO O DIAGNÓSTICO DA MINHA VITRINE</span><ArrowRight size={20} /></button>
        </div>
      </div>
    )
  }

  // Questions Screen
  if (step >= 1 && step <= 9) {
    const currentQ = questions[step - 1]
    const isMultiple = currentQ.multiple
    const currentAnswer = answers[currentQ.id] || (isMultiple ? [] : '')

    const handleOptionToggle = (opt) => {
      if (isMultiple) {
        setAnswers(prev => {
          const arr = prev[currentQ.id] || []
          if (arr.includes(opt)) {
            return { ...prev, [currentQ.id]: arr.filter(x => x !== opt) }
          } else {
            return { ...prev, [currentQ.id]: [...arr, opt] }
          }
        })
      } else {
        setAnswers(prev => ({ ...prev, [currentQ.id]: opt }))
      }
    }

    const canProceed = isMultiple ? currentAnswer.length > 0 : currentAnswer !== ''

    return (
      <div className="container fade-in">
        <div className="card premium-card">
          <div className="progress-container">
            <div className="progress-bar glow" style={{ width: `${(step / 9) * 100}%` }}></div>
          </div>

          <div className="question-header">
            <span className="question-number">0{step}</span>
            <h2 className="serif-heading">{currentQ.text}</h2>
          </div>
          {currentQ.subtitle && <p className="subtitle">{currentQ.subtitle}</p>}

          <div className="options-container mb-8">
            {currentQ.options.map((opt, idx) => {
              const selected = isMultiple ? currentAnswer.includes(opt) : currentAnswer === opt
              return (
                <label key={idx} className={`option-label premium-option ${selected ? 'selected' : ''}`} style={{ animationDelay: `${idx * 0.05}s` }} onClick={() => handleOptionToggle(opt)}>
                  <div className={`custom-checkbox ${selected ? 'checked' : ''}`}></div>
                  <span>{opt}</span>
                </label>
              )
            })}
          </div>

          <div className="action-buttons">
            {step > 1 ? (
              <button className="secondary-btn" onClick={() => setStep(s => s - 1)}>VOLTAR</button>
            ) : <div></div>}
            <button className="primary-btn" onClick={() => setStep(s => s + 1)} disabled={!canProceed}>
              {step === 9 ? 'FINALIZAR' : 'PRÓXIMA'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Lead Form
  if (step === 10) {
    const whatsappDigits = getPhoneDigits(leadData.whatsapp)
    const isFormValid = leadData.name && leadData.email && whatsappDigits.length >= 10 && leadData.openQuestion && leadData.learningStyle && leadData.investment

    const handleSubmit = (e) => {
      e.preventDefault()
      if (!isFormValid || isSubmitting) return

      setIsSubmitting(true)
      setSubmitError('')

      const utms = getUtmParams()
      const quizAnswers = questions.map((question) => ({
        id: question.id,
        question: question.text,
        answer: answers[question.id] ?? null
      }))

      const payload = {
        event: 'quiz_completed',
        quiz: 'quiz-marilian-18082026',
        submitted_at: new Date().toISOString(),
        lead: {
          name: leadData.name,
          email: leadData.email,
          whatsapp: whatsappDigits,
          open_question: leadData.openQuestion,
          learning_style: leadData.learningStyle,
          investment: leadData.investment
        },
        quiz_answers: quizAnswers,
        result_answer: answers[9] ?? null,
        utms,
        ...utms,
        attribution: {
          page_url: window.location.href,
          referrer: document.referrer || null
        }
      }

      // Avança a experiência da usuária imediatamente. O envio ao webhook
      // acontece em segundo plano e nunca bloqueia a navegação: se o n8n
      // estiver fora do ar, lento, ou inacessível (ex: CORS ao testar local),
      // a pessoa não fica presa na tela de carregamento.
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch((error) => {
        console.error('Erro ao enviar o diagnóstico para o webhook:', error)
      })

      setIsSubmitting(false)
      setStep(11)
    }

    return (
      <div className="container fade-in">
        <div className="card premium-card">
          <div className="form-header text-center">
            <h2 className="serif-heading gradient-text">Falta só uma coisa...</h2>
            <p className="subtitle">Preenche aqui embaixo e você garante duas coisas de uma vez:</p>
          </div>

          <div className="benefits-list">
            <div className="benefit-item">
              <span className="benefit-icon">1</span>
              <p>A primeira é o presente que eu te prometi lá em cima.</p>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">2</span>
              <p>A segunda é saber da novidade antes de qualquer anúncio, antes de qualquer story, antes de qualquer pessoa que chegar depois.</p>
            </div>
          </div>

          <p className="mb-8 text-center" style={{ fontStyle: 'italic', color: 'var(--color-primary)', fontWeight: 600 }}>
            Eu vou mandar tudo em primeira mão <strong>pra você.</strong> Então, fique atenta!
          </p>

          <form onSubmit={handleSubmit} className="premium-form">
            <div className="form-group">
              <input type="text" className="form-control" placeholder="Seu nome" required value={leadData.name} onChange={e => setLeadData({ ...leadData, name: e.target.value })} />
            </div>

            <div className="form-group">
              <input type="email" className="form-control" placeholder="Seu melhor e-mail" required value={leadData.email} onChange={e => setLeadData({ ...leadData, email: e.target.value })} />
            </div>

            <div className="form-group">
              <input
                type="tel"
                className="form-control"
                placeholder="WhatsApp: (XX) XXXXX-XXXX"
                required
                inputMode="numeric"
                autoComplete="tel"
                maxLength={15}
                value={leadData.whatsapp}
                onChange={e => setLeadData({ ...leadData, whatsapp: formatWhatsapp(e.target.value) })}
                onKeyDown={e => {
                  if (!/\d/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault()
                  }
                }}
              />
            </div>

            <div className="form-group">
              <label>Se a gente sentasse por 5 minutos, o que você me perguntaria?</label>
              <textarea className="form-control" rows="3" placeholder="Sua pergunta aqui..." required value={leadData.openQuestion} onChange={e => setLeadData({ ...leadData, openQuestion: e.target.value })}></textarea>
            </div>

            <div className="form-group">
              <label>Como você aprende de verdade, do jeito que a sua rotina permite?</label>
              <div className="options-grid">
                {[
                  "Aulas gravadas, para eu assistir no meu tempo",
                  "Aulas gravadas com encontro ao vivo para tirar dúvida",
                  "Mentoria, com acompanhamento de perto",
                  "Material escrito, para eu ler e aplicar sozinha"
                ].map((opt, i) => (
                  <label key={i} className={`option-label premium-option ${leadData.learningStyle === opt ? 'selected' : ''}`} onClick={() => setLeadData({ ...leadData, learningStyle: opt })}>
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group mb-8">
              <label>Quanto você investiria em uma solução que resolva de vez o que apareceu no seu diagnóstico?</label>
              <div className="options-grid">
                {[
                  "De 3.000 a 4.500",
                  "De 5.000 a 8.000",
                  "De 10.000 a 25.000",
                  "Acima de 90.000"
                ].map((opt, i) => (
                  <label key={i} className={`option-label premium-option ${leadData.investment === opt ? 'selected' : ''}`} onClick={() => setLeadData({ ...leadData, investment: opt })}>
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {submitError && <p className="submit-error" role="alert">{submitError}</p>}
            {!isFormValid && (
              <p className="form-hint" role="status">
                Preencha todos os campos acima (nome, e-mail, WhatsApp, a pergunta, como aprende e o investimento) para liberar o botão.
              </p>
            )}
            <button type="submit" className="primary-btn glow-btn" style={{ width: '100%' }} disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? 'ENVIANDO SUAS RESPOSTAS...' : 'RECEBER MEU DIAGNÓSTICO'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Loading Screen
  if (step === 11) {
    return (
      <div className="container fade-in">
        <div className="card premium-card text-center loading-card">
          <div className="loader-ring"></div>
          <h2 className="serif-heading mt-8">Seu diagnóstico está em análise...</h2>
          <p className="mt-4 subtitle">
            Agora eu cruzo as suas respostas com o comportamento de centenas de mulheres que vivem exatamente a mesma etapa que você para montar o seu diagnóstico de vitrine.
          </p>
        </div>
      </div>
    )
  }

  // Results Screens (split across multiple pages, each with its own "AVANÇAR")
  if (step >= 12 && step <= 15) {
    const q9Answer = answers[9] || "Aparecer falando de mim sem sentir vergonha depois"
    const result = resultsData[q9Answer] || resultsData["Saber dizer em uma frase quem eu sou, sem parecer arrogante"] // fallback

    // Determine position on heatmap based on answer roughly (10% to 90%)
    let heatmapPos = 50;
    if (q9Answer.includes("Saber dizer")) heatmapPos = 20;
    else if (q9Answer.includes("postar")) heatmapPos = 40;
    else if (q9Answer.includes("depender")) heatmapPos = 60;
    else if (q9Answer.includes("percepção")) heatmapPos = 80;
    else heatmapPos = 30;

    const paragraphs = result.text.split('\n\n')
    const closingSentence = 'A mulher que sabe exatamente qual é a frase dela grava, publica e segue com o dia.'
    const secondParagraph = paragraphs[1].replace(closingSentence, '').trim()

    const copyCoupon = async () => {
      const coupon = 'VITRINE20'
      try {
        await navigator.clipboard.writeText(coupon)
      } catch {
        const textArea = document.createElement('textarea')
        textArea.value = coupon
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }
      setCouponCopied(true)
      window.setTimeout(() => setCouponCopied(false), 2500)
    }

    // Page 1 of 4: o diagnóstico em si (nota da vitrine + leitura + ações)
    if (step === 12) {
      return (
        <main className="result-page fade-in">
          <div className="result-shell">
            <header className="result-header text-center">
              <span className="badge"><ShieldCheck size={18} /> Seu diagnóstico está pronto</span>
              <h1>{result.title}</h1>
              <div className="heart-divider"><span></span><Heart size={19} /><span></span></div>
            </header>

            <section className="heatmap-section">
              <h2>A nota da sua vitrine:</h2>
              <div className="heatmap-wrapper">
                <div className="heatmap-tooltip" style={{ left: `${heatmapPos}%` }}>Você está aqui</div>
                <div className="heatmap-container">
                  <div className="heatmap-marker pulse-marker" style={{ left: `${heatmapPos}%` }}></div>
                </div>
                <div className="heatmap-labels">
                  <span>MARCA INVISÍVEL</span>
                  <span>MARCA CONHECIDA</span>
                  <span>MARCA FORTE</span>
                </div>
              </div>
            </section>

            <section className="diagnostic-copy">
              <div className="copy-row"><div className="round-icon"><Video /></div><p>{paragraphs[0]}</p></div>
              <div className="copy-row"><div className="round-icon"><Brain /></div><p>{secondParagraph}</p></div>
              <div className="copy-row"><div className="round-icon"><CalendarDays /></div><p>A mulher que sabe exatamente qual é a frase dela <strong>grava, publica e segue</strong> com o dia.</p></div>
            </section>

            <section className="action-steps-section">
              <h2>Por onde começar ainda hoje:</h2>
              {result.actionIntro && <p className="action-intro">{result.actionIntro}</p>}
              <ol className="action-steps-list">
                {result.actionSteps.map((stepText, i) => <li key={i}>{stepText}</li>)}
              </ol>
            </section>

            <button className="primary-btn results-advance-btn" onClick={() => setStep(13)}>
              <span>AVANÇAR</span><ArrowRight size={20} />
            </button>
          </div>
        </main>
      )
    }

    // Page 2 of 4: por que nada do que ela tentou resolveu
    if (step === 13) {
      return (
        <main className="result-page fade-in">
          <div className="result-shell">
            <section className="explanation-section">
              <span className="eyebrow">Por que isso acontece?</span>
              <div className="explanation-grid">
                <div className="explanation-copy">
                  <h2>Por que nada do que<br />você tentou resolveu?</h2>
                  <i></i>
                  <p>Você já contratou social media, já fez ensaio, já comprou curso, já pediu ajuda para arrumar o guarda-roupa. E todos entregaram aquilo que venderam. Mas nenhum entregou a sua mensagem.</p>
                  <p><strong>E faz sentido: essa mensagem nunca fez parte do serviço.</strong></p>
                  <p>Você não errou o fornecedor. <strong>Você pulou uma camada.</strong><br />E, enquanto ela continuar aberta, tudo o que vem em cima perde sustentação.</p>
                  <p>Foi nessa camada que eu concentrei os últimos meses.<br />Uma coisa só, feita para quem <strong>já está no meio do caminho.</strong></p>
                </div>
                <div className="layer-list">
                  <div><span><Eye /></span><p><b>Aparência</b><small>O que os outros veem</small></p></div>
                  <div><span><Target /></span><p><b>Estratégia</b><small>O que você faz</small></p></div>
                  <div><span><Heart /></span><p><b>Essência</b><small>O que sustenta tudo</small></p></div>
                </div>
              </div>
              <div className="anticipation"><Heart /><b>E quando tudo estiver pronto, você vai ser uma das primeiras a saber.</b></div>
            </section>

            <button className="primary-btn results-advance-btn" onClick={() => setStep(14)}>
              <span>AVANÇAR</span><ArrowRight size={20} />
            </button>
          </div>
        </main>
      )
    }

    // Page 3 of 4: os 3 caminhos de oferta
    if (step === 14) {
      return (
        <main className="result-page fade-in">
          <div className="result-shell">
            <section className="offer-stack-section">
              <h2>Você já sabe por onde começar.<br />Agora decida até onde quer levar essa mudança.</h2>
              <p>O seu diagnóstico mostrou onde a sua vitrine perde força e você já saiu daqui com as primeiras ações para começar a mudar essa percepção hoje.</p>
              <p>Enquanto eu finalizo uma nova estrutura que estou preparando para mulheres que querem fortalecer a própria marca, existem hoje 03 caminhos para avançar comigo.</p>
              <p>São experiências com profundidades e níveis de acompanhamento diferentes, porque cada mulher está em uma etapa da sua construção. O ponto aqui não é escolher o maior caminho. É entender qual deles faz sentido para o momento que você vive agora.</p>
              <div className="offer-buttons">
                <a href="https://chk.eduzz.com/89AQQRV5WD" target="_blank" rel="noreferrer" className="secondary-btn offer-btn">QUERO CONHECER O E-BOOK EXCLUSIVO A ERA DA MARCA PESSOAL <span>R$ 67,00</span></a>
                <a href="https://mahandriolli.com/o-jogo-da-marca/#prices" target="_blank" rel="noreferrer" className="secondary-btn offer-btn">QUERO ESTAR NO PODCAST PRESENCIAL EM ALPHAVILLE NO DIA 23/09 <span>A partir de R$ 748,00</span></a>
                <a href="https://mahandriolli.com/mv-club/" target="_blank" rel="noreferrer" className="secondary-btn offer-btn">QUERO CONHECER A MENTORIA MVCLUB <span>A partir de R$ 88.000,00</span></a>
              </div>
              <p className="offer-closing"><strong>Você já decidiu que não quer mais deixar a sua marca no automático.</strong> Agora escolha o caminho coerente com o lugar que quer começar a ocupar.</p>
            </section>

            <button className="primary-btn results-advance-btn" onClick={() => setStep(15)}>
              <span>AVANÇAR</span><ArrowRight size={20} />
            </button>
          </div>
        </main>
      )
    }

    // Page 4 of 4: o presente (My SB Shoes) - página final, sem "avançar"
    return (
      <main className="result-page fade-in">
        <div className="result-shell">
          <section className="gift-section">
            <div className="gift-visual"><div className="gift-icon"><Gift size={42} /></div><img src={shoesImage} alt="Sapato branco com biqueira dourada sobre caixa My SB Shoes" /></div>
            <div className="gift-content">
              <h2>E o presente que eu te prometi?</h2>
              <p>Lembra que vitrine fez parte da minha vida inteira e que, dentro da multimarca, a gente criou uma marca própria de calçados?</p>
              <p><strong>Ela existe, se chama My SB Shoes, e hoje está em mais de 250 lojas pelo Brasil.</strong></p>
              <p>Esse presente não está no site, não está no meu perfil e não vai para quem saiu no meio do caminho. Ele é para as pouquíssimas mulheres comprometidas o suficiente com a própria marca para chegar até aqui.</p>
              <p><b>Sim. Você chegou até aqui.</b></p>
              <button type="button" className={`coupon-box ${couponCopied ? 'is-copied' : ''}`} onClick={copyCoupon} aria-label="Copiar cupom VITRINE20">
                <span className="coupon-label">Cupom especial</span>
                <span className="coupon-code">VITRINE20</span>
                <span className="coupon-desc">20% de desconto em qualquer par da My SB Shoes</span>
                <span className="coupon-copy-status" aria-live="polite">{couponCopied ? <><Check size={14} /> Cupom copiado!</> : <><Copy size={14} /> Toque para copiar</>}</span>
              </button>
              <a href="https://www.mysbshoes.com.br/" target="_blank" rel="noreferrer" className="shop-button">CONHECER A MY SB SHOES <ArrowUpRight size={19} /></a>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return null
}

export default App
