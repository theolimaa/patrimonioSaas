import React, { useState } from 'react'
import { gerarObservacao } from '../utils'

// Botão que gera um rascunho das "Observações do Assessor" a partir do que foi
// preenchido no módulo (e dos documentos enviados, quando houver).
export default function ObservacaoIA({ modulo, contexto, texto, arquivos, onGerado }) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  const semDados = !contexto
  const qtdDocs = (arquivos || []).length

  async function gerar() {
    if (texto && texto.trim() && !window.confirm('Já existe um texto nas observações. Substituir pelo texto gerado?')) return
    setLoading(true)
    setErro('')
    setAviso('')
    try {
      const r = await gerarObservacao(modulo, contexto, arquivos)
      if (!r.texto) throw new Error('A IA não retornou texto. Tente novamente.')
      onGerado(r.texto)
      if (r.total > r.usados) {
        setAviso(r.usados + ' de ' + r.total + ' documentos usados (os demais passam do limite de tamanho).')
      }
    } catch (e) {
      setErro(e.message || 'Não foi possível gerar o texto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: '14px' }}>
      <button
        type="button"
        onClick={gerar}
        disabled={semDados || loading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px', borderRadius: '10px',
          background: semDados || loading ? 'transparent' : 'var(--gold-dim)',
          border: '1.5px solid ' + (semDados || loading ? 'var(--border-strong)' : 'var(--gold)'),
          color: semDados || loading ? 'var(--text-dim)' : 'var(--text)',
          fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-display)',
          cursor: semDados || loading ? 'not-allowed' : 'pointer', transition: 'all 0.18s',
        }}
      >
        <span style={{ fontSize: '15px' }}>✨</span>
        {loading ? 'Gerando...' : 'Gerar com IA'}
      </button>
      <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
        {semDados
          ? 'Preencha os dados deste módulo para liberar a geração.'
          : 'Cria um rascunho a partir do que você preencheu' + (qtdDocs > 0 ? ' e dos documentos enviados' : '') + '. Revise e ajuste antes de gerar o PDF.'}
      </div>
      {aviso && <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>{aviso}</div>}
      {erro && <div style={{ marginTop: '6px', fontSize: '12px', color: '#c0392b' }}>{erro}</div>}
    </div>
  )
}
