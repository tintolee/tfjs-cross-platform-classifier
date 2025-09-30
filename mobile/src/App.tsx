
import React, { useEffect, useState } from 'react'
import { SafeAreaView, Text, View, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-react-native'
import * as mobilenet from '@tensorflow-models/mobilenet'
import { decodeImage } from '@tensorflow/tfjs-react-native';
type Pred = { className: string; probability: number }

export default function App() {
  const [ready, setReady] = useState(false)
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null)
  const [preds, setPreds] = useState<Pred[]>([])
  const [imgUri, setImgUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    (async () => {
      await tf.ready()
      const m = await mobilenet.load({ version: 2, alpha: 1.0 })
      setModel(m)
      setReady(true)
    })().catch(err => {
      console.warn('TF init error', err)
      Alert.alert('TensorFlow init failed', String(err?.message || err))
    })
  }, [])

  const pick = async () => {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!p.granted) return
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 })
    if (!res.canceled && res.assets && res.assets[0]?.uri) {
      setImgUri(res.assets[0].uri)
      setPreds([])
    }
  }

  const classify = async () => {
    if (!ready || !model || !imgUri) return
    try {
      setLoading(true)
      // mobilenet.classify accepts tensors or image elements; in RN, tfjs-react-native provides decodeImage
      const response = await fetch(imgUri)
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()
      const u8 = new Uint8Array(arrayBuffer)
      const imageTensor = await decodeImage(u8, 3);

      const results = await model.classify(imageTensor, 3)
      setPreds(results.map(r => ({ className: r.className, probability: r.probability })))

      imageTensor.dispose()
    } catch (e: any) {
      Alert.alert('Classification error', String(e?.message || e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>TFJS React Native — Mobilenet</Text>

      <View style={styles.card}>
        {imgUri ? (
          <Image source={{ uri: imgUri }} style={styles.preview} />
        ) : (
          <View style={[styles.preview, styles.previewEmpty]}>
            <Text style={styles.muted}>Pick an image to begin</Text>
          </View>
        )}

        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={pick}>
            <Text style={styles.btnText}>Choose Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, (!imgUri || !ready) && styles.btnDisabled]} onPress={classify} disabled={!imgUri || !ready || loading}>
            {loading ? <ActivityIndicator /> : <Text style={styles.btnText}>Classify</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.results}>
          {preds.length ? preds.map((p, i) => (
            <View key={i} style={styles.rowItem}>
              <Text style={styles.label}>{p.className}</Text>
              <Text style={styles.conf}>{(p.probability * 100).toFixed(1)}%</Text>
            </View>
          )) : (
            <Text style={styles.muted}>Top-3 predictions will appear here</Text>
          )}
        </View>
      </View>

      <Text style={styles.footer}>On-device inference with TensorFlow.js</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b0f14', padding: 16 },
  title: { color: 'white', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: '#121821', borderRadius: 16, padding: 12 },
  preview: { width: '100%', height: 260, borderRadius: 12, backgroundColor: '#222' },
  previewEmpty: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  btn: { backgroundColor: '#2d6cdf', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: 'white', fontWeight: '600' },
  results: { marginTop: 16 },
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#2a3340' },
  label: { color: 'white', fontSize: 16, fontWeight: '500' },
  conf: { color: 'white', fontSize: 16 },
  muted: { color: '#9aa4b2' },
  footer: { color: '#6b7280', textAlign: 'center', marginTop: 16 },
})
