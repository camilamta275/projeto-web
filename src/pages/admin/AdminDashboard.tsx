'use client'

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { UserRole } from '@/types'

// TODO: GET /api/orgs
const ORGS = [
  { id: 'pmr', sigla: 'PMR', nome: 'Prefeitura Municipal do Recife', tipo: 'municipal', responsavel: 'João Silva', email: 'joao@prefeitura.gov.br', sla: 72, status: 'ativo', categorias: ['Problemas na Via', 'Iluminação Pública', 'Saneamento Básico', 'Sinalização'] },
  { id: 'gope', sigla: 'GOPE', nome: 'Governo do Estado de Pernambuco', tipo: 'estadual', responsavel: 'Maria Lima', email: 'maria@pe.gov.br', sla: 120, status: 'ativo', categorias: ['Problemas na Via'] },
  { id: 'compesa', sigla: 'COMPESA', nome: 'Compesa', tipo: 'concessionaria', responsavel: 'Carlos Santos', email: 'carlos@compesa.com.br', sla: 48, status: 'ativo', categorias: ['Água e Esgoto', 'Saneamento Básico'] },
  { id: 'enrg', sigla: 'ENRG', nome: 'Energisa Pernambuco', tipo: 'concessionaria', responsavel: 'Ana Costa', email: 'ana@energisa.com.br', sla: 24, status: 'ativo', categorias: ['Iluminação Pública'] },
  { id: 'detran', sigla: 'DETRAN', nome: 'DETRAN-PE', tipo: 'estadual', responsavel: 'Pedro Alves', email: 'pedro@detran.pe.gov.br', sla: 96, status: 'ativo', categorias: ['Sinalização'] },
]

const CATEGORIES = ['Problemas na Via', 'Água e Esgoto', 'Iluminação Pública', 'Saneamento Básico', 'Sinalização']

const CATEGORY_ICONS: Record<string, string> = {
  'Problemas na Via': '🏗️',
  'Água e Esgoto': '💧',
  'Iluminação Pública': '💡',
  'Saneamento Básico': '🗑️',
  'Sinalização': '🚦',
}

const TIPO_LABELS: Record<string, string> = {
  municipal: 'Municipal',
  estadual: 'Estadual',
  concessionaria: 'Concessionária',
}

type Rule = {
  id: number;
  categoria: string;
  subcategoria: string;
  orgaoPrincipal: string;
  orgaoSecundario: string | null;
  sla: number;
  prioridade: string;
}

// TODO: GET /api/matrix-rules
const INITIAL_RULES: Rule[] = [
  { id: 1, categoria: 'Problemas na Via', subcategoria: 'Via local / municipal', orgaoPrincipal: 'PMR', orgaoSecundario: null, sla: 72, prioridade: 'media' },
  { id: 2, categoria: 'Problemas na Via', subcategoria: 'Rodovia / BR / PE', orgaoPrincipal: 'GOPE', orgaoSecundario: 'PMR', sla: 120, prioridade: 'alta' },
  { id: 3, categoria: 'Água e Esgoto', subcategoria: 'Falta de água', orgaoPrincipal: 'COMPESA', orgaoSecundario: null, sla: 24, prioridade: 'alta' },
  { id: 4, categoria: 'Água e Esgoto', subcategoria: 'Vazamento de água', orgaoPrincipal: 'COMPESA', orgaoSecundario: null, sla: 12, prioridade: 'critica' },
  { id: 5, categoria: 'Água e Esgoto', subcategoria: 'Esgoto a céu aberto', orgaoPrincipal: 'COMPESA', orgaoSecundario: null, sla: 24, prioridade: 'critica' },
  { id: 6, categoria: 'Água e Esgoto', subcategoria: 'Pressão baixa', orgaoPrincipal: 'COMPESA', orgaoSecundario: null, sla: 48, prioridade: 'baixa' },
  { id: 7, categoria: 'Iluminação Pública', subcategoria: 'Poste apagado', orgaoPrincipal: 'ENRG', orgaoSecundario: null, sla: 24, prioridade: 'media' },
  { id: 8, categoria: 'Iluminação Pública', subcategoria: 'Luminária danificada', orgaoPrincipal: 'PMR', orgaoSecundario: 'ENRG', sla: 48, prioridade: 'baixa' },
  { id: 9, categoria: 'Saneamento Básico', subcategoria: 'Coleta de lixo irregular', orgaoPrincipal: 'PMR', orgaoSecundario: null, sla: 48, prioridade: 'media' },
]

type User = {
  id: number;
  nome: string;
  email: string;
  perfil: UserRole;
  orgao: string | null;
  status: string;
  cadastro: string;
}

// TODO: GET /api/users
const INITIAL_USERS: User[] = [
  { id: 1, nome: 'Maria Silva', email: 'maria@email.com', perfil: UserRole.CITIZEN, orgao: null, status: 'ativo', cadastro: '2026-01-15' },
  { id: 2, nome: 'Carlos Santos', email: 'carlos@email.com', perfil: UserRole.CITIZEN, orgao: null, status: 'ativo', cadastro: '2026-02-01' },
  { id: 3, nome: 'João Gestor', email: 'joao@prefeitura.gov.br', perfil: UserRole.MANAGER, orgao: 'PMR', status: 'ativo', cadastro: '2026-01-01' },
  { id: 4, nome: 'Ana Costa', email: 'ana@energisa.com.br', perfil: UserRole.MANAGER, orgao: 'ENRG', status: 'ativo', cadastro: '2026-01-05' },
  { id: 5, nome: 'Pedro Admin', email: 'pedro@admin.gov.br', perfil: UserRole.ADMIN, orgao: null, status: 'ativo', cadastro: '2025-12-01' },
  { id: 6, nome: 'Lucia Ferreira', email: 'lucia@email.com', perfil: UserRole.CITIZEN, orgao: null, status: 'ativo', cadastro: '2026-03-10' },
  { id: 7, nome: 'Roberto Almeida', email: 'roberto@email.com', perfil: UserRole.CITIZEN, orgao: null, status: 'inativo', cadastro: '2026-02-20' },
  { id: 8, nome: 'Marcos Gestor', email: 'marcos@compesa.com.br', perfil: UserRole.MANAGER, orgao: 'COMPESA', status: 'ativo', cadastro: '2026-01-10' },
]

function priorityBadge(p: string) {
  const map: Record<string, { label: string; bg: string; color: string; border: string }> = {
    critica: { label: 'Crítica', bg: '#fff1f0', color: '#cf1322', border: '#ffa39e' },
    alta: { label: 'Alta', bg: '#fff7e6', color: '#d46b08', border: '#ffd591' },
    media: { label: 'Média', bg: '#fffbe6', color: '#ad8b00', border: '#ffe58f' },
    baixa: { label: 'Baixa', bg: '#e6f4ff', color: '#0958d9', border: '#91caff' },
  }
  const s = map[p] || map.media
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 500,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
    }}>{s.label}</span>
  )
}

function perfilBadge(p: UserRole) {
  const map: Record<UserRole, { label: string; bg: string; color: string }> = {
    [UserRole.ADMIN]: { label: 'Admin', bg: '#fff1f0', color: '#cf1322' },
    [UserRole.MANAGER]: { label: 'Gestor', bg: '#fff7e6', color: '#d46b08' },
    [UserRole.CITIZEN]: { label: 'Cidadão', bg: '#e6f4ff', color: '#0958d9' },
    [UserRole.INSPECTOR]: { label: 'Fiscal', bg: '#f3e8ff', color: '#7c3aed' },
  }
  const s = map[p] || map[UserRole.CITIZEN]
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 500,
      background: s.bg,
      color: s.color,
    }}>{s.label}</span>
  )
}

function statusBadge(s: string) {
  const ativo = s === 'ativo'
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 500,
      background: ativo ? '#f6ffed' : '#f5f5f5',
      color: ativo ? '#389e0d' : '#8c8c8c',
    }}>{ativo ? 'Ativo' : 'Inativo'}</span>
  )
}

function formatDate(d: string) {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 12, width: '100%', maxWidth: 480,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          maxHeight: '90vh', overflowY: 'auto',
          margin: '0 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#8c8c8c', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: CSSProperties = {
  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
  borderRadius: 8, fontSize: 14, color: '#111827', outline: 'none',
  background: '#fff', boxSizing: 'border-box',
}

const selectStyle: CSSProperties = { ...inputStyle, cursor: 'pointer' }

function MatrizTab() {
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES)
  const [filterOrg, setFilterOrg] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ categoria: '', subcategoria: '', orgaoPrincipal: '', orgaoSecundario: '', sla: '48', prioridade: 'media' })

  const filtered = useMemo(() =>
    rules.filter((r) =>
      (!filterOrg || r.orgaoPrincipal === filterOrg || r.orgaoSecundario === filterOrg) &&
      (!filterCat || r.categoria === filterCat)
    ), [rules, filterOrg, filterCat])

  // TODO: POST /api/matrix-rules
  const saveRule = () => {
    if (!form.categoria || !form.orgaoPrincipal) return
    setRules((prev) => [...prev, {
      id: Date.now(),
      categoria: form.categoria,
      subcategoria: form.subcategoria,
      orgaoPrincipal: form.orgaoPrincipal,
      orgaoSecundario: form.orgaoSecundario || null,
      sla: Number(form.sla),
      prioridade: form.prioridade,
    }])
    setShowModal(false)
    setForm({ categoria: '', subcategoria: '', orgaoPrincipal: '', orgaoSecundario: '', sla: '48', prioridade: 'media' })
  }

  // TODO: DELETE /api/matrix-rules/:id
  const deleteRule = (id: number) => {
    setRules((prev) => prev.filter((x) => x.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Matriz de Competências</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>Define o roteamento automático de chamados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Adicionar Regra
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={filterOrg} onChange={(e) => setFilterOrg(e.target.value)} style={{ ...selectStyle, width: 'auto', minWidth: 160 }}>
          <option value="">Todos os órgãos</option>
          {ORGS.map((o) => <option key={o.id} value={o.sigla}>{o.sigla}</option>)}
        </select>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={{ ...selectStyle, width: 'auto', minWidth: 180 }}>
          <option value="">Todas categorias</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              {['Categoria', 'Subcategoria', 'Órgão Principal', 'Órgão Secundário', 'SLA (horas)', 'Prioridade', 'Ações'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 500, color: '#6b7280' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <td style={{ padding: '14px 16px', fontSize: 14, color: '#111827' }}>
                  <span>{CATEGORY_ICONS[r.categoria]} {r.categoria}</span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 14, color: '#374151' }}>{r.subcategoria}</td>
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#2563eb' }}>{r.orgaoPrincipal}</td>
                <td style={{ padding: '14px 16px', fontSize: 14, color: '#9ca3af' }}>{r.orgaoSecundario || '—'}</td>
                <td style={{ padding: '14px 16px', fontSize: 14, color: '#374151' }}>{r.sla}h</td>
                <td style={{ padding: '14px 16px' }}>{priorityBadge(r.prioridade)}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 16, padding: 2 }}>✏️</button>
                    <button onClick={() => deleteRule(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 16, padding: 2 }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24, background: '#f8faff', border: '1px solid #dbeafe', borderRadius: 12, padding: '16px 20px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1e40af', margin: '0 0 12px' }}>Fluxo de Roteamento</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {['Cidadão abre chamado', 'Categoria + Subcategoria', 'Matriz define órgão + SLA', 'Roteado automaticamente'].map((step, i, arr) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 500 }}>{step}</span>
              {i < arr.length - 1 && <span style={{ color: '#93c5fd', fontWeight: 700 }}>→</span>}
            </div>
          ))}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Adicionar Regra">
        <Field label="Categoria">
          <select value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))} style={selectStyle}>
            <option value="">Selecione...</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Subcategoria">
          <input value={form.subcategoria} onChange={(e) => setForm((f) => ({ ...f, subcategoria: e.target.value }))} style={inputStyle} placeholder="Ex: Buraco na pista" />
        </Field>
        <Field label="Órgão Principal">
          <select value={form.orgaoPrincipal} onChange={(e) => setForm((f) => ({ ...f, orgaoPrincipal: e.target.value }))} style={selectStyle}>
            <option value="">Selecione...</option>
            {ORGS.map((o) => <option key={o.id} value={o.sigla}>{o.sigla} — {o.nome}</option>)}
          </select>
        </Field>
        <Field label="Órgão Secundário">
          <select value={form.orgaoSecundario} onChange={(e) => setForm((f) => ({ ...f, orgaoSecundario: e.target.value }))} style={selectStyle}>
            <option value="">Nenhum</option>
            {ORGS.map((o) => <option key={o.id} value={o.sigla}>{o.sigla} — {o.nome}</option>)}
          </select>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="SLA (horas)">
            <input type="number" value={form.sla} onChange={(e) => setForm((f) => ({ ...f, sla: e.target.value }))} style={inputStyle} min={1} />
          </Field>
          <Field label="Prioridade">
            <select value={form.prioridade} onChange={(e) => setForm((f) => ({ ...f, prioridade: e.target.value }))} style={selectStyle}>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </Field>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <button onClick={() => setShowModal(false)} style={{ padding: '8px 18px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancelar</button>
          <button onClick={saveRule} style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Salvar Regra</button>
        </div>
      </Modal>
    </div>
  )
}

function OrgaosTab() {
  const [orgs, setOrgs] = useState(ORGS)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nome: '', sigla: '', tipo: 'municipal', responsavel: '', email: '', sla: '48', categorias: [] as string[] })

  const toggleCat = (cat: string) => {
    setForm((f) => ({
      ...f,
      categorias: f.categorias.includes(cat) ? f.categorias.filter((c) => c !== cat) : [...f.categorias, cat],
    }))
  }

  // TODO: POST /api/orgs
  const saveOrg = () => {
    if (!form.nome || !form.sigla) return
    setOrgs((prev) => [...prev, { id: form.sigla.toLowerCase(), nome: form.nome, sigla: form.sigla, tipo: form.tipo, responsavel: form.responsavel, email: form.email, sla: Number(form.sla), status: 'ativo', categorias: form.categorias }])
    setShowModal(false)
    setForm({ nome: '', sigla: '', tipo: 'municipal', responsavel: '', email: '', sla: '48', categorias: [] })
  }

  // TODO: DELETE /api/orgs/:id
  const deleteOrg = (id: string) => {
    setOrgs((prev) => prev.filter((o) => o.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Gestão de Órgãos</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>Cadastre e gerencie os órgãos responsáveis</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Novo Órgão
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {orgs.map((org) => (
          <div key={org.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 6 }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 15 }}>✏️</button>
              <button onClick={() => deleteOrg(org.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 15 }}>🗑️</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>🏛️</div>
              <div style={{ paddingRight: 48 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#111827', lineHeight: 1.3 }}>{org.nome}</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>{org.sigla} · {TIPO_LABELS[org.tipo]} · SLA: {org.sla}h</p>
              </div>
            </div>
            <p style={{ margin: '0 0 2px', fontSize: 13, color: '#374151' }}>Responsável: {org.responsavel}</p>
            <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280' }}>{org.email}</p>
            <div style={{ marginBottom: 12 }}>
              {statusBadge(org.status)}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {org.categorias.map((cat) => (
                <span key={cat} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 20, padding: '3px 10px', fontSize: 12, color: '#374151' }}>
                  {CATEGORY_ICONS[cat]} {cat}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Novo Órgão">
        <Field label="Nome completo">
          <input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} style={inputStyle} placeholder="Ex: Prefeitura Municipal..." />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Sigla">
            <input value={form.sigla} onChange={(e) => setForm((f) => ({ ...f, sigla: e.target.value.toUpperCase() }))} style={inputStyle} placeholder="PMR" />
          </Field>
          <Field label="Tipo">
            <select value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))} style={selectStyle}>
              <option value="municipal">Municipal</option>
              <option value="estadual">Estadual</option>
              <option value="concessionaria">Concessionária</option>
            </select>
          </Field>
        </div>
        <Field label="Responsável">
          <input value={form.responsavel} onChange={(e) => setForm((f) => ({ ...f, responsavel: e.target.value }))} style={inputStyle} placeholder="Nome do responsável" />
        </Field>
        <Field label="E-mail">
          <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="email@orgao.gov.br" type="email" />
        </Field>
        <Field label="SLA padrão (horas)">
          <input type="number" value={form.sla} onChange={(e) => setForm((f) => ({ ...f, sla: e.target.value }))} style={inputStyle} min={1} />
        </Field>
        <Field label="Categorias de competência">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => {
              const active = form.categorias.includes(cat)
              return (
                <button key={cat} onClick={() => toggleCat(cat)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: active ? '1px solid #2563eb' : '1px solid #d1d5db', background: active ? '#eff6ff' : '#fff', color: active ? '#1d4ed8' : '#6b7280', fontWeight: active ? 500 : 400 }}>
                  {CATEGORY_ICONS[cat]} {cat}
                </button>
              )
            })}
          </div>
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <button onClick={() => setShowModal(false)} style={{ padding: '8px 18px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancelar</button>
          <button onClick={saveOrg} style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Salvar Órgão</button>
        </div>
      </Modal>
    </div>
  )
}

function UsuariosTab() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [filterPerfil, setFilterPerfil] = useState('')
  const [filterOrg, setFilterOrg] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', perfil: UserRole.CITIZEN, orgao: '', setor: '' })

  const tempPass = 'Sc#2026xT9k'

  const filtered = useMemo(() =>
    users.filter((u) =>
      (!filterPerfil || u.perfil === filterPerfil) &&
      (!filterOrg || u.orgao === filterOrg) &&
      (!filterStatus || u.status === filterStatus) &&
      (!search || u.nome.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    ), [users, filterPerfil, filterOrg, filterStatus, search])

  // TODO: PATCH /api/users/:id/status
  const toggleStatus = (id: number) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === 'ativo' ? 'inativo' : 'ativo' } : u))
  }

  // TODO: POST /api/users
  const saveUser = () => {
    if (!form.nome || !form.email) return
    setUsers((prev) => [...prev, { id: Date.now(), nome: form.nome, email: form.email, perfil: form.perfil, orgao: form.orgao || null, status: 'ativo', cadastro: new Date().toISOString().split('T')[0] }])
    setShowModal(false)
    setForm({ nome: '', email: '', perfil: UserRole.CITIZEN, orgao: '', setor: '' })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Gestão de Usuários</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>Gerencie contas de cidadãos, gestores e administradores</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Novo Usuário
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={filterPerfil} onChange={(e) => setFilterPerfil(e.target.value)} style={{ ...selectStyle, width: 'auto', minWidth: 140 }}>
          <option value="">Todos perfis</option>
          <option value={UserRole.CITIZEN}>Cidadão</option>
          <option value={UserRole.MANAGER}>Gestor</option>
          <option value={UserRole.ADMIN}>Admin</option>
        </select>
        <select value={filterOrg} onChange={(e) => setFilterOrg(e.target.value)} style={{ ...selectStyle, width: 'auto', minWidth: 140 }}>
          <option value="">Todos órgãos</option>
          {ORGS.map((o) => <option key={o.id} value={o.sigla}>{o.sigla}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...selectStyle, width: 'auto', minWidth: 140 }}>
          <option value="">Todos status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 32 }}
            placeholder="Buscar por nome ou e-mail..."
          />
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              {['Nome', 'E-mail', 'Perfil', 'Órgão', 'Status', 'Cadastro', 'Ações'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 500, color: '#6b7280' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 500, color: '#111827' }}>{u.nome}</td>
                <td style={{ padding: '14px 16px', fontSize: 14, color: '#6b7280' }}>{u.email}</td>
                <td style={{ padding: '14px 16px' }}>{perfilBadge(u.perfil)}</td>
                <td style={{ padding: '14px 16px', fontSize: 14, color: '#374151' }}>{u.orgao || '—'}</td>
                <td style={{ padding: '14px 16px' }}>{statusBadge(u.status)}</td>
                <td style={{ padding: '14px 16px', fontSize: 14, color: '#374151' }}>{formatDate(u.cadastro)}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ padding: '5px 12px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151' }}>Editar</button>
                    <button
                      onClick={() => toggleStatus(u.id)}
                      style={{ padding: '5px 12px', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500, background: u.status === 'ativo' ? '#fff1f0' : '#f0fdf4', color: u.status === 'ativo' ? '#cf1322' : '#15803d' }}
                    >
                      {u.status === 'ativo' ? 'Desativar' : 'Reativar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Novo Usuário">
        <Field label="Nome completo">
          <input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} style={inputStyle} placeholder="Nome completo" />
        </Field>
        <Field label="E-mail">
          <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="email@exemplo.com" type="email" />
        </Field>
        <Field label="Perfil">
          <select value={form.perfil} onChange={(e) => setForm((f) => ({ ...f, perfil: e.target.value as UserRole }))} style={selectStyle}>
            <option value={UserRole.CITIZEN}>Cidadão</option>
            <option value={UserRole.MANAGER}>Gestor</option>
            <option value={UserRole.ADMIN}>Admin</option>
          </select>
        </Field>
        {form.perfil === UserRole.MANAGER && (
          <Field label="Órgão">
            <select value={form.orgao} onChange={(e) => setForm((f) => ({ ...f, orgao: e.target.value }))} style={selectStyle}>
              <option value="">Selecione...</option>
              {ORGS.map((o) => <option key={o.id} value={o.sigla}>{o.sigla} — {o.nome}</option>)}
            </select>
          </Field>
        )}
        <Field label="Setor de atuação">
          <input value={form.setor} onChange={(e) => setForm((f) => ({ ...f, setor: e.target.value }))} style={inputStyle} placeholder="Ex: Infraestrutura Urbana" />
        </Field>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, color: '#1e40af', fontWeight: 600 }}>Senha temporária gerada:</p>
          <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 15, color: '#1e3a8a', fontWeight: 700 }}>{tempPass}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <button onClick={() => setShowModal(false)} style={{ padding: '8px 18px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancelar</button>
          <button onClick={saveUser} style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Criar Usuário</button>
        </div>
      </Modal>
    </div>
  )
}

type Tab = 'matrix' | 'orgs' | 'users'

const NAV_ITEMS: { id: Tab; icon: string; label: string }[] = [
  { id: 'matrix', icon: '⊞', label: 'Matriz de Competências' },
  { id: 'orgs', icon: '🏛️', label: 'Órgãos' },
  { id: 'users', icon: '👥', label: 'Usuários' },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('matrix')
  const router = useRouter()
  const { usuario, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && (!usuario || usuario.perfil !== UserRole.ADMIN)) {
      router.push('/login')
    }
  }, [usuario, isLoading, router])

  if (isLoading || !usuario || usuario.perfil !== UserRole.ADMIN) {
    return null
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: '#f9fafb' }}>
      <main style={{ padding: '32px 32px 48px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#111827' }}>Painel Administrativo</h1>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6b7280' }}>Gerencie matriz de competências, órgãos e usuários.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 8, borderRadius: 16, background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}>
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px',
                    border: 'none', borderRadius: 12, cursor: 'pointer',
                    background: active ? '#dbeafe' : 'transparent',
                    color: active ? '#1d4ed8' : '#4b5563',
                    fontSize: 14, fontWeight: active ? 700 : 500,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        {activeTab === 'matrix' && <MatrizTab />}
        {activeTab === 'orgs' && <OrgaosTab />}
        {activeTab === 'users' && <UsuariosTab />}
      </main>
    </div>
  )
}