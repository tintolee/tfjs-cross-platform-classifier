
import React, { useRef, useState } from 'react'
import * as mobilenet from '@tensorflow-models/mobilenet'
import '@tensorflow/tfjs'

type Pred = { className: string; probability: number }

export default function App() {
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null)
  const [preds, setPreds] = useState<Pred[]>([])
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadModel() {
    if (model) return
    setLoading(true)
    const m = await mobilenet.load({ version: 2, alpha: 1.0 })
    setModel(m)
    setLoading(false)
  }

  async function classify() {
    if (!model || !imgRef.current) return
    setLoading(true)
    const res = await model.classify(imgRef.current, 3)
    setPreds(res.map(r => ({ className: r.className, probability: r.probability })))
    setLoading(false)
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    if (imgRef.current) {
      imgRef.current.src = url
    }
    setPreds([])
  }

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h2>TFJS Web — Mobilenet</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={loadModel} disabled={!!model || loading}>
          {model ? 'Model Loaded' : loading ? 'Loading…' : 'Load Model'}
        </button>
        <input type="file" accept="image/*" onChange={onFile} />
        <button onClick={classify} disabled={!model || loading}>
          {loading ? 'Running…' : 'Classify'}
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <img ref={imgRef} alt="preview" style={{ maxWidth: 360, borderRadius: 8 }} />
      </div>

      <div style={{ marginTop: 16 }}>
        {preds.length ? (
          <ul>
            {preds.map((p, i) => (
              <li key={i}>
                {p.className} — {(p.probability * 100).toFixed(1)}%
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#666' }}>Top-3 predictions will appear here</p>
        )}
      </div>
    </div>
  )
}
