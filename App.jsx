import React, { useMemo, useState } from 'react'
import {
  Plane, TrainFront, Bus, CarFront, Sparkles, ArrowRight, ArrowUpRight,
  MapPin, CalendarDays, Users, Search, SlidersHorizontal, Clock3, Wallet,
  CheckCircle2, AlertTriangle, Route, ChevronDown, MessageCircle, Send,
  Compass, ShieldCheck, Zap, Globe2, RefreshCw, Info, X, Luggage, Coffee
} from 'lucide-react'

const cityOptions = [
  'Chennai', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune',
  'Kochi', 'Goa', 'Jaipur', 'Kolkata', 'Vellore', 'Tiruppur', 'Bali, Indonesia',
  'Singapore', 'Dubai', 'London'
]

const knownRoutes = {
  'chennai|bengaluru': { distance: 350, bus: [650, 1400, 6.5], cab: [5200, 7600, 6], train: [350, 1450, 5.5], flight: [2600, 6500, 1.1] },
  'bengaluru|chennai': { distance: 350, bus: [650, 1400, 6.5], cab: [5200, 7600, 6], train: [350, 1450, 5.5], flight: [2600, 6500, 1.1] },
  'delhi|mumbai': { distance: 1150, bus: [1800, 3200, 22], cab: [17000, 24000, 19], train: [900, 2800, 16], flight: [4200, 9500, 2.2] },
  'mumbai|delhi': { distance: 1150, bus: [1800, 3200, 22], cab: [17000, 24000, 19], train: [900, 2800, 16], flight: [4200, 9500, 2.2] },
  'mumbai|pune': { distance: 150, bus: [350, 900, 3.5], cab: [2200, 3800, 3], train: [150, 700, 3], flight: null },
  'pune|mumbai': { distance: 150, bus: [350, 900, 3.5], cab: [2200, 3800, 3], train: [150, 700, 3], flight: null },
  'chennai|hyderabad': { distance: 630, bus: [900, 1900, 11], cab: [8500, 12500, 10], train: [450, 1800, 10], flight: [3000, 7200, 1.3] },
  'hyderabad|chennai': { distance: 630, bus: [900, 1900, 11], cab: [8500, 12500, 10], train: [450, 1800, 10], flight: [3000, 7200, 1.3] },
  'chennai|kochi': { distance: 690, bus: [900, 1800, 12], cab: [9000, 14000, 11], train: [450, 1700, 12], flight: [2800, 6500, 1.3] },
  'delhi|jaipur': { distance: 280, bus: [450, 1100, 5.5], cab: [3800, 6000, 5], train: [250, 1100, 4.5], flight: [3200, 7000, 1] },
  'jaipur|delhi': { distance: 280, bus: [450, 1100, 5.5], cab: [3800, 6000, 5], train: [250, 1100, 4.5], flight: [3200, 7000, 1] }
}

const transport = [
  { id: 'flight', label: 'Flight', Icon: Plane, color: 'blue', detail: 'Airline options' },
  { id: 'train', label: 'Train', Icon: TrainFront, color: 'violet', detail: 'Rail connections' },
  { id: 'bus', label: 'Bus', Icon: Bus, color: 'orange', detail: 'Intercity coaches' },
  { id: 'cab', label: 'Cab', Icon: CarFront, color: 'green', detail: 'Private road travel' }
]

const money = n => '₹' + Math.round(n).toLocaleString('en-IN')
const fmtTime = h => h < 1 ? `${Math.round(h * 60)} min` : `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`
const keyFor = (a, b) => `${a.split(',')[0].trim().toLowerCase()}|${b.split(',')[0].trim().toLowerCase()}`
const isInternational = (a, b) => {
  const intl = s => /bali|indonesia|singapore|dubai|london/i.test(s)
  return intl(a) !== intl(b) || (intl(a) && intl(b) && a.split(',').pop()?.trim() !== b.split(',').pop()?.trim())
}
const isBaliRoute = (a, b) => /bali|indonesia/i.test(a + ' ' + b) && !/bali|indonesia/i.test(a + ' ' + b.replace(/bali|indonesia/ig, ''))
const isIndiaToBali = (a, b) => (/bali|indonesia/i.test(a) && !/bali|indonesia/i.test(b)) || (/bali|indonesia/i.test(b) && !/bali|indonesia/i.test(a))
const demoData = (a, b) => {
  const route = knownRoutes[keyFor(a,b)]
  if (route) return { ...route, confidence: 'curated-demo', note: 'Illustrative estimates for a supported sample route.' }
  const international = isIndiaToBali(a,b) || isInternational(a,b)
  if (international) {
    const flight = [18000, 52000, 5.5]
    return {
      distance: null, confidence: 'generic-demo',
      flight,
      train: null, bus: null, cab: null,
      note: 'Cross-border or sea-separated route: only air travel is shown as a feasible end-to-end mode in this demo. Other modes may be possible for individual segments, but not as a direct journey.'
    }
  }
  // Deterministic route-specific estimates. Clearly labelled as illustrative, never presented as live.
  const seed = [...(a + '|' + b)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  const distance = 180 + (seed % 950)
  const road = distance / 52
  const train = distance / 62
  const flight = distance > 400 ? distance / 620 + 1.4 : null
  return {
    distance,
    confidence: 'generated-demo',
    bus: [Math.round(distance * 1.7 + (seed % 180)), Math.round(distance * 3.2 + (seed % 320)), road + 1.1],
    cab: [Math.round(distance * 12 + (seed % 800)), Math.round(distance * 18 + (seed % 1400)), road],
    train: [Math.round(distance * 0.8 + (seed % 140)), Math.round(distance * 2.1 + (seed % 260)), train],
    flight: flight ? [Math.round(distance * 5 + 1200), Math.round(distance * 10 + 2600), flight] : null,
    note: 'Illustrative estimate generated for this route. It is not a live quote or confirmation of service.'
  }
}

function buildOptions(from, to, people, date) {
  const data = demoData(from, to)
  return transport.map(t => {
    const raw = data[t.id]
    if (!raw) return { ...t, feasible: false, reason: isIndiaToBali(from,to) ? 'No direct end-to-end service' : 'No suitable direct option in this demo' }
    const [low, high, hours] = raw
    const multiplier = t.id === 'cab' ? 1 : people
    const extra = t.id === 'flight' && isIndiaToBali(from,to) ? 0 : 0
    const lowTotal = (low * multiplier) + extra
    const highTotal = (high * multiplier) + extra
    const doorHours = hours + (t.id === 'flight' ? 2.5 : t.id === 'train' ? 0.5 : t.id === 'bus' ? 0.3 : 0)
    return {
      ...t, feasible: true, low: lowTotal, high: highTotal, hours: doorHours,
      perPerson: t.id === 'cab' ? lowTotal / people : low,
      meta: t.id === 'flight' ? 'Includes estimated airport buffer' : t.id === 'cab' ? 'Whole vehicle estimate' : 'Per-person fare estimate',
      badge: t.id === 'cab' ? 'Private travel' : t.id === 'flight' ? 'Airport buffer included' : 'Per person'
    }
  })
}

function scoreOptions(options, priority) {
  const available = options.filter(o => o.feasible)
  if (!available.length) return {}
  const minCost = Math.min(...available.map(o => o.low))
  const maxCost = Math.max(...available.map(o => o.low))
  const minTime = Math.min(...available.map(o => o.hours))
  const maxTime = Math.max(...available.map(o => o.hours))
  const score = o => {
    const cost = maxCost === minCost ? 1 : 1 - (o.low - minCost) / (maxCost - minCost)
    const time = maxTime === minTime ? 1 : 1 - (o.hours - minTime) / (maxTime - minTime)
    return priority === 'cheapest' ? cost * .8 + time * .2 :
      priority === 'fastest' ? time * .8 + cost * .2 : cost * .55 + time * .45
  }
  const cheapest = [...available].sort((a,b) => a.low - b.low)[0]
  const fastest = [...available].sort((a,b) => a.hours - b.hours)[0]
  const best = [...available].sort((a,b) => score(b) - score(a))[0]
  return { cheapest: cheapest.id, fastest: fastest.id, best: best.id, scores: Object.fromEntries(available.map(o => [o.id, Math.round(score(o)*100)])) }
}

function App() {
  const [from, setFrom] = useState('Chennai')
  const [to, setTo] = useState('Bengaluru')
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0,10))
  const [people, setPeople] = useState(1)
  const [priority, setPriority] = useState('balanced')
  const [budget, setBudget] = useState('Any budget')
  const [searched, setSearched] = useState(false)
  const [query, setQuery] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hi! I’m Wayfinder, your local AI travel planner. Try “cheapest route from Chennai to Bengaluru for 2 people” or “Can I take a cab from India to Bali?”' }
  ])
  const [activeTab, setActiveTab] = useState('compare')
  const [showLogic, setShowLogic] = useState(false)

  const options = useMemo(() => buildOptions(from, to, people, date), [from,to,people,date])
  const recs = useMemo(() => scoreOptions(options, priority), [options,priority])
  const feasible = options.filter(o => o.feasible)
  const international = isIndiaToBali(from,to) || isInternational(from,to)
  const best = options.find(o => o.id === recs.best)
  const routeNote = demoData(from,to).note

  const doSearch = (e) => { e?.preventDefault(); setSearched(true); setActiveTab('compare') }
  const runPrompt = (raw) => {
    const text = raw.trim()
    if (!text) return
    setChatMessages(prev => [...prev, {role:'user', text}])
    const low = text.toLowerCase()
    let reply = ''
    const match = text.match(/(?:from|between)\s+(.+?)\s+(?:to|and|towards)\s+(.+?)(?:\s+for\s+(\d+)\s+people?)?(?:[,.!?]|$)/i)
    if (match) {
      const a = match[1].trim().replace(/\b(for|with a budget of|under)\b.*$/i,'').trim()
      const b = match[2].trim().replace(/\b(for|with a budget of|under)\b.*$/i,'').trim()
      const knownA = cityOptions.find(c => c.toLowerCase().startsWith(a.toLowerCase()))
      const knownB = cityOptions.find(c => c.toLowerCase().startsWith(b.toLowerCase()))
      if (knownA && knownB) {
        setFrom(knownA); setTo(knownB); setSearched(true)
        const pax = match[3] ? Math.max(1,Math.min(9,Number(match[3]))) : people
        setPeople(pax)
        const ops = buildOptions(knownA, knownB, pax, date)
        const r = scoreOptions(ops, priority)
        const bo = ops.find(o=>o.id===r.best)
        reply = `I’ve updated the comparison to ${knownA} → ${knownB} for ${pax} traveller${pax>1?'s':''}. ${bo ? `My current best-overall demo pick is ${bo.label}, with an illustrative total range of ${money(bo.low)}–${money(bo.high)} and an estimated door-to-door duration of ${fmtTime(bo.hours)}.` : 'There are no feasible direct options in this demo.'} These are illustrative values, not live fares.`
      }
    }
    if (!reply && /bali|indonesia/.test(low) && /(india|chennai|delhi|mumbai|bengaluru|cab|drive|road)/.test(low)) {
      reply = 'For India → Bali, a direct cab, bus or train journey is not feasible: Bali is an island separated from India by sea. This prototype marks those end-to-end modes unavailable and recommends flying, with a separate local transfer on each end if needed. Flight prices shown here are illustrative demo estimates, not live fares.'
      if (/chennai/.test(low)) { setFrom('Chennai'); setTo('Bali, Indonesia'); setSearched(true) }
      else if (/delhi/.test(low)) { setFrom('Delhi'); setTo('Bali, Indonesia'); setSearched(true) }
    }
    if (!reply && /(cheapest|budget|cheap)/.test(low)) {
      const o = options.filter(x=>x.feasible).sort((a,b)=>a.low-b.low)[0]
      reply = o ? `For ${from} → ${to}, the lowest illustrative starting price in this demo is ${o.label} at ${money(o.low)}. This is not a live quote. I rank total estimated cost first, then duration, for the cheapest recommendation.` : 'There are no feasible direct modes in the current route model.'
    }
    if (!reply && /(fastest|quick|time)/.test(low)) {
      const o = options.filter(x=>x.feasible).sort((a,b)=>a.hours-b.hours)[0]
      reply = o ? `The fastest estimated door-to-door option in this demo is ${o.label} at about ${fmtTime(o.hours)}. Flight times include a buffer for airport procedures; ground options are illustrative and can vary with traffic or schedules.` : 'There are no feasible direct modes in the current route model.'
    }
    if (!reply) reply = `For ${from} → ${to}, I compare feasible modes using estimated total price, door-to-door duration and your priority (${priority}). The best-overall recommendation is ${best?.label || 'not available'}; the scores are rule-based and explainable, not generated by a remote AI model. Try asking for the cheapest option, fastest option, a route to Bali, or enter a route in the search form.`
    setChatMessages(prev => [...prev, {role:'assistant', text:reply}])
    setChatInput('')
  }

  const handleNaturalSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    runPrompt(query)
    setQuery('')
  }

  const selectedRec = id => id === recs.best ? 'Best overall' : id === recs.cheapest ? 'Cheapest' : id === recs.fastest ? 'Fastest' : null

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Compass size={22}/></div><div><strong>wayfinder<span>.ai</span></strong><small>TRAVEL ORCHESTRATION</small></div></div>
        <div className="workspace-label">WORKSPACE</div>
        <button className={`nav-item ${activeTab==='compare'?'active':''}`} onClick={()=>setActiveTab('compare')}><Route size={17}/> Journey studio <span className="nav-dot"/></button>
        <button className={`nav-item ${activeTab==='assistant'?'active':''}`} onClick={()=>setActiveTab('assistant')}><Sparkles size={17}/> AI assistant <span className="new-tag">LOCAL AI</span></button>
        <button className={`nav-item ${activeTab==='method'?'active':''}`} onClick={()=>setActiveTab('method')}><SlidersHorizontal size={17}/> How it decides</button>
        <div className="sidebar-bottom">
          <div className="local-card"><div className="local-icon"><ShieldCheck size={17}/></div><div><b>Private by design</b><p>Runs locally in your browser. No API key.</p></div></div>
          <div className="profile"><div className="avatar">WF</div><div><b>Prototype mode</b><small>Research demonstration</small></div><ChevronDown size={15}/></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs">Workspace <span>/</span> <b>{activeTab==='compare'?'Journey studio':activeTab==='assistant'?'AI assistant':'Decision engine'}</b></div>
          <div className="top-actions"><span className="status-pill"><span/> Offline demo engine</span><button className="icon-button" title="Refresh comparison" onClick={()=>setSearched(true)}><RefreshCw size={16}/></button><div className="avatar small-avatar">WF</div></div>
        </header>

        {activeTab==='compare' && <div className="page">
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow"><Sparkles size={14}/> YOUR PERSONAL TRAVEL INTELLIGENCE</div>
              <h1>Better journeys.<br/><em>Not just bookings.</em></h1>
              <p>One request. Every realistic way to get there. Compare complete journeys, then let your priorities guide the recommendation.</p>
              <div className="hero-proof"><span><CheckCircle2 size={15}/> Multimodal thinking</span><span><CheckCircle2 size={15}/> Explainable ranking</span><span><CheckCircle2 size={15}/> No API key needed</span></div>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="globe"><Globe2 size={88} strokeWidth={1}/></div>
              <div className="float-card float-a"><Plane size={17}/><div><b>Flight</b><small>Air connections</small></div></div>
              <div className="float-card float-b"><TrainFront size={17}/><div><b>Train</b><small>Rail network</small></div></div>
              <div className="float-card float-c"><Bus size={17}/><div><b>Bus + road</b><small>Ground journeys</small></div></div>
              <div className="route-line"><span/><span/><span/></div>
            </div>
          </section>

          <section className="search-panel">
            <div className="section-kicker">PLAN A JOURNEY <span>01 / INPUT</span></div>
            <form className="search-grid" onSubmit={doSearch}>
              <label className="field"><span><MapPin size={14}/> FROM</span><select value={from} onChange={e=>setFrom(e.target.value)}>{cityOptions.filter(c=>c!==to).map(c=><option key={c}>{c}</option>)}</select></label>
              <button type="button" className="swap-button" title="Swap locations" onClick={()=>{setFrom(to);setTo(from)}}><RefreshCw size={16}/></button>
              <label className="field"><span><MapPin size={14}/> TO</span><select value={to} onChange={e=>setTo(e.target.value)}>{cityOptions.filter(c=>c!==from).map(c=><option key={c}>{c}</option>)}</select></label>
              <label className="field date-field"><span><CalendarDays size={14}/> DEPARTURE</span><input type="date" min={new Date().toISOString().slice(0,10)} value={date} onChange={e=>setDate(e.target.value)}/></label>
              <label className="field people-field"><span><Users size={14}/> TRAVELLERS</span><select value={people} onChange={e=>setPeople(Number(e.target.value))}>{[1,2,3,4,5,6,7,8,9].map(n=><option key={n} value={n}>{n} {n===1?'traveller':'travellers'}</option>)}</select></label>
              <button className="primary-button search-button" type="submit"><Search size={17}/> Compare journeys <ArrowRight size={16}/></button>
            </form>
            <form className="natural-search" onSubmit={handleNaturalSearch}><Sparkles size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Or ask naturally: "Find the cheapest way to Bali for 2 people"'/><button type="submit">Ask Wayfinder <ArrowUpRight size={15}/></button></form>
          </section>

          <section className="results-section">
            <div className="results-heading"><div><div className="section-kicker">YOUR OPTIONS <span>02 / COMPARE</span></div><h2>{from} <ArrowRight size={21}/> {to}</h2><p>One route, multiple ways to get there. Prices below are prototype estimates.</p></div>
              <div className="priority-select"><label>OPTIMIZE FOR</label><select value={priority} onChange={e=>setPriority(e.target.value)}><option value="balanced">Best balance</option><option value="cheapest">Lowest cost</option><option value="fastest">Shortest time</option></select></div>
            </div>
            <div className="notice"><Info size={16}/><div><b>Prototype data, not live inventory.</b> Estimates demonstrate comparison and ranking logic. Verify prices, schedules and availability with providers before booking.</div></div>
            {international && <div className="feasibility-banner"><Globe2 size={18}/><div><b>International / sea-separated route detected</b><p>Direct road, bus and train journeys are marked unavailable where the end-to-end route is not feasible. Multi-leg suggestions are conceptual, not confirmed connections.</p></div></div>}
            <div className="recommendation-strip">
              <div className="rec-label"><Sparkles size={17}/><div><b>Wayfinder's shortlist</b><small>Recommendations based on your priority</small></div></div>
              <div className="rec-pills"><span><Wallet size={14}/> Cheapest <b>{options.find(o=>o.id===recs.cheapest)?.label || '—'}</b></span><span><Zap size={14}/> Fastest <b>{options.find(o=>o.id===recs.fastest)?.label || '—'}</b></span><span><CheckCircle2 size={14}/> Best overall <b>{options.find(o=>o.id===recs.best)?.label || '—'}</b></span></div>
            </div>
            <div className="mode-grid">
              {options.map(o => {
                const tag = selectedRec(o.id)
                return <article key={o.id} className={`mode-card ${!o.feasible?'unavailable':''} ${o.id===recs.best?'recommended':''}`}>
                  {o.id===recs.best && o.feasible && <div className="recommend-ribbon"><Sparkles size={12}/> BEST OVERALL</div>}
                  <div className={`mode-icon ${o.color}`}><o.Icon size={21}/></div>
                  <div className="mode-title-row"><h3>{o.label}</h3>{tag && <span className={`mini-tag ${tag==='Best overall'?'best-tag':''}`}>{tag}</span>}</div>
                  <p className="mode-detail">{o.detail}</p>
                  {o.feasible ? <>
                    <div className="price">{money(o.low)}<span> – {money(o.high)}</span></div>
                    <div className="price-caption">{o.meta}{o.id==='cab'?' · whole vehicle':' · estimated'}</div>
                    <div className="mode-metrics"><span><Clock3 size={15}/><b>{fmtTime(o.hours)}</b></span>{dataDistanceLabel(from,to) && <span><Route size={15}/>{dataDistanceLabel(from,to)}</span>}</div>
                    <div className="score-track"><span style={{width:`${recs.scores?.[o.id] || 45}%`}}/></div><div className="score-caption"><span>Preference fit</span><b>{recs.scores?.[o.id] || 45}/100</b></div>
                    <button className="text-button" onClick={()=>{setShowLogic(true);setActiveTab('method')}}>Why this option? <ArrowUpRight size={14}/></button>
                  </> : <>
                    <div className="unavailable-state"><AlertTriangle size={20}/><b>Not feasible direct</b><p>{o.reason}</p></div>
                    <div className="disabled-note">May be possible as a separate local segment.</div>
                  </>}
                </article>
              })}
            </div>
            <div className="route-composer">
              <div className="composer-heading"><div className="composer-icon"><Route size={20}/></div><div><h3>Journey combination lab</h3><p>Think beyond one ticket: connect feasible modes into a door-to-door plan.</p></div></div>
              {international ? <div className="combo-plan"><div className="combo-step"><span className="step-dot green-dot"/><div><b>Local transfer to departure airport</b><small>Choose a city and provider for a verified quote</small></div><span className="segment-tag">OPTIONAL</span></div><div className="combo-connector"/><div className="combo-step"><span className="step-dot blue-dot"/><div><b>Flight to destination region</b><small>Illustrative segment · check live routes and visas</small></div><span className="segment-tag">AIR</span></div><div className="combo-connector"/><div className="combo-step"><span className="step-dot orange-dot"/><div><b>Arrival transfer / ferry if needed</b><small>Depends on airport, destination and schedule</small></div><span className="segment-tag">LOCAL</span></div></div> : <div className="combo-plan"><div className="combo-step"><span className="step-dot green-dot"/><div><b>Start point</b><small>{from} · first-mile transport if required</small></div><span className="segment-tag">START</span></div><div className="combo-connector"/><div className="combo-step"><span className="step-dot blue-dot"/><div><b>{best?.label || 'Choose a mode'} main journey</b><small>{best?.feasible ? `${fmtTime(best.hours)} estimated · ${money(best.low)}–${money(best.high)} illustrative` : 'No feasible direct option'}</small></div><span className="segment-tag">MAIN</span></div><div className="combo-connector"/><div className="combo-step"><span className="step-dot orange-dot"/><div><b>Arrival point</b><small>{to} · last-mile transport if required</small></div><span className="segment-tag">END</span></div></div>}
              <button className="secondary-button" onClick={()=>setActiveTab('assistant')}><Sparkles size={16}/> Ask AI to optimize this journey <ArrowRight size={15}/></button>
            </div>
          </section>
        </div>}

        {activeTab==='assistant' && <div className="page assistant-page">
          <div className="section-kicker">LOCAL INTELLIGENCE <span>03 / ASSISTANT</span></div>
          <h1 className="page-title">Talk through your journey.</h1><p className="page-subtitle">Ask questions in natural language. The local rules engine interprets supported intents and explains its reasoning without sending data to an external service.</p>
          <div className="chat-layout">
            <div className="chat-panel"><div className="chat-top"><div className="assistant-avatar"><Sparkles size={19}/></div><div><b>Wayfinder assistant</b><small><span className="online-dot"/> Local demo engine · no API key</small></div><span className="local-badge">PRIVATE</span></div>
              <div className="chat-body">{chatMessages.map((m,i)=><div key={i} className={`chat-message ${m.role}`}><div className="chat-bubble">{m.text}</div></div>)}</div>
              <form className="chat-compose" onSubmit={e=>{e.preventDefault();runPrompt(chatInput)}}><input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Ask about a route, cost, or travel time…"/><button type="submit" aria-label="Send message"><Send size={17}/></button></form>
            </div>
            <div className="prompt-panel"><h3>Try a prompt</h3><p>Click one to see the prototype reason through a scenario.</p>{[
              'Find the cheapest route from Chennai to Bengaluru for 2 people',
              'What is the fastest way from Delhi to Mumbai?',
              'Can I take a cab from India to Bali?',
              'Explain how you choose the best overall option'
            ].map(p=><button key={p} className="prompt-chip" onClick={()=>runPrompt(p)}><MessageCircle size={15}/>{p}<ArrowUpRight size={14}/></button>)}<div className="disclaimer-small"><ShieldCheck size={16}/><span>Local demo only. Responses use deterministic rules and sample estimates, not a remote LLM or live transport APIs.</span></div></div>
          </div>
        </div>}

        {activeTab==='method' && <div className="page method-page">
          <div className="section-kicker">TRANSPARENT AI <span>04 / EXPLAINABILITY</span></div><h1 className="page-title">How Wayfinder decides.</h1><p className="page-subtitle">A deterministic, explainable decision engine designed for a prototype demonstration. No hidden model calls.</p>
          <div className="method-hero"><div className="method-symbol"><SlidersHorizontal size={28}/></div><div><h2>Feasibility → Normalize → Rank → Explain</h2><p>The prototype first filters impossible direct modes, then compares estimated cost and door-to-door duration. The ranking changes when the user changes their priority.</p></div></div>
          <div className="method-grid">
            <div className="method-card"><span className="method-num">01</span><div className="method-icon"><ShieldCheck size={21}/></div><h3>Feasibility check</h3><p>Cross-border and sea-separated journeys do not get fake direct road prices. Infeasible modes are excluded from rankings.</p><div className="method-tag">Constraint rules</div></div>
            <div className="method-card"><span className="method-num">02</span><div className="method-icon"><Wallet size={21}/></div><h3>Cost normalization</h3><p>Fare estimates are converted to a total for the selected passenger count. Cab estimates are treated as a vehicle total.</p><div className="method-tag">Cost score</div></div>
            <div className="method-card"><span className="method-num">03</span><div className="method-icon"><Clock3 size={21}/></div><h3>Door-to-door time</h3><p>Flight comparisons include an airport buffer. Ground travel includes indicative road or rail duration.</p><div className="method-tag">Time score</div></div>
            <div className="method-card"><span className="method-num">04</span><div className="method-icon"><Sparkles size={21}/></div><h3>Weighted ranking</h3><p>Cheapest favors cost (80%), fastest favors time (80%), and balanced uses 55% cost and 45% time score.</p><div className="method-tag">Explainable score</div></div>
          </div>
          <div className="method-note"><AlertTriangle size={18}/><div><b>Academic honesty note</b><p>This is a front-end AI-style prototype with a local rules engine, not a trained machine-learning model. Prices and schedules are illustrative. A production system needs live provider APIs, robust geographic routing and real booking availability.</p></div></div>
          <button className="primary-button" onClick={()=>setActiveTab('compare')}><ArrowRight size={16}/> Back to journey studio</button>
        </div>}

        <footer className="footer"><div><Compass size={16}/> <b>wayfinder.ai</b><span>Prototype build · 2026</span></div><div><span className="footer-dot"/> Local decision engine <span>·</span> Illustrative fares, not live quotes</div></footer>
      </main>
    </div>
  )
}

function dataDistanceLabel(from,to) {
  const d = demoData(from,to).distance
  return d ? `~${d.toLocaleString('en-IN')} km` : ''
}

export default App
