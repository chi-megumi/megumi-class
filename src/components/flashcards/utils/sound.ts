type SoundType = 'flip' | 'correct' | 'incorrect'

let audioContext: AudioContext | null = null

const getAudioContext = () => {
  if (audioContext) return audioContext

  const AudioCtx =
    window.AudioContext ||
    (
      window as unknown as {
        webkitAudioContext: typeof AudioContext
      }
    ).webkitAudioContext

  if (!AudioCtx) return null

  audioContext = new AudioCtx()

  return audioContext
}

const createGainEnvelope = (
  ctx: AudioContext,
  startTime: number,
  attack: number,
  release: number,
  peak: number,
) => {
  const gain = ctx.createGain()

  gain.gain.setValueAtTime(0.001, startTime)
  gain.gain.exponentialRampToValueAtTime(peak, startTime + attack)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + attack + release)

  return gain
}

const createNoiseBuffer = (ctx: AudioContext, duration: number, decay = 0.25) => {
  const bufferSize = Math.floor(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    const envelope = Math.exp(-i / (bufferSize * decay))
    data[i] = (Math.random() * 2 - 1) * envelope
  }

  return buffer
}

export const playSound = (type: SoundType) => {
  switch (type) {
    case 'flip':
      playFlipSound()
      break

    case 'correct':
      playCorrectSound()
      break

    case 'incorrect':
      playIncorrectSound()
      break
  }
}

export const playFlipSound = () => {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      void ctx.resume()
    }

    const now = ctx.currentTime
    const duration = 0.1

    // ----------------------------------------
    // Paper friction / snap
    // ----------------------------------------

    const noise = ctx.createBufferSource()
    noise.buffer = createNoiseBuffer(ctx, duration, 0.25)

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1800, now)
    filter.frequency.exponentialRampToValueAtTime(500, now + duration)
    filter.Q.value = 0.8

    const gain = createGainEnvelope(ctx, now, 0.005, duration, 0.22)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    noise.start(now)
    noise.stop(now + duration)

    // ----------------------------------------
    // Soft tonal "snap"
    // ----------------------------------------

    const oscillator = ctx.createOscillator()
    const oscillatorGain = createGainEnvelope(ctx, now, 0.005, duration, 0.08)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(320, now)
    oscillator.frequency.exponentialRampToValueAtTime(680, now + 0.06)
    oscillator.frequency.exponentialRampToValueAtTime(220, now + duration)

    oscillator.connect(oscillatorGain)
    oscillatorGain.connect(ctx.destination)

    oscillator.start(now)
    oscillator.stop(now + duration)
  } catch (error) {
    console.debug('Flip sound unavailable:', error)
  }
}

export const playCorrectSound = () => {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      void ctx.resume()
    }

    const now = ctx.currentTime

    // C5 → E5 → G5
    const notes = [
      { frequency: 523.25, start: 0, duration: 0.1 },
      { frequency: 659.25, start: 0.07, duration: 0.1 },
      { frequency: 783.99, start: 0.14, duration: 0.14 },
    ]

    notes.forEach(({ frequency, start, duration }) => {
      const oscillator = ctx.createOscillator()
      const gain = createGainEnvelope(ctx, now + start, 0.008, duration, 0.1)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, now + start)

      oscillator.connect(gain)
      gain.connect(ctx.destination)

      oscillator.start(now + start)
      oscillator.stop(now + start + duration)
    })
  } catch (error) {
    console.debug('Correct sound unavailable:', error)
  }
}

export const playIncorrectSound = () => {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      void ctx.resume()
    }

    const now = ctx.currentTime

    // A short descending "wrong" sound.
    // F4 → D4
    const notes = [
      { frequency: 349.23, start: 0, duration: 0.13 },
      { frequency: 293.66, start: 0.08, duration: 0.16 },
    ]

    notes.forEach(({ frequency, start, duration }) => {
      const oscillator = ctx.createOscillator()
      const gain = createGainEnvelope(ctx, now + start, 0.005, duration, 0.09)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, now + start)

      oscillator.connect(gain)
      gain.connect(ctx.destination)

      oscillator.start(now + start)
      oscillator.stop(now + start + duration)
    })
  } catch (error) {
    console.debug('Incorrect sound unavailable:', error)
  }
}
