import { useAudio } from '../audio/hooks/useAudio'
import ArcadeButton from './ui/ArcadeButton'

interface AudioControlsProps {
  compact?: boolean
  className?: string
}

export function AudioControls({ compact = false, className = '' }: AudioControlsProps) {
  const { settings, toggleMute, setMasterVolume, setSfxVolume, setMusicVolume, isInitialized } =
    useAudio()

  if (!isInitialized) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-sm font-mono">Loading audio...</div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <ArcadeButton
          onClick={toggleMute}
          className="p-2 text-sm"
          variant={settings.muted ? 'danger' : 'secondary'}
          title={settings.muted ? 'Unmute audio' : 'Mute audio'}
        >
          {settings.muted ? '🔇' : '🔊'}
        </ArcadeButton>

        {!settings.muted && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">VOL</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              title="Master volume"
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-gray-800/50 rounded-lg p-4 border border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-yellow-400 font-mono font-bold text-sm">🎵 AUDIO</h3>
        <ArcadeButton
          onClick={toggleMute}
          className="p-2 text-xs"
          variant={settings.muted ? 'danger' : 'secondary'}
        >
          {settings.muted ? '🔇 MUTED' : '🔊 ON'}
        </ArcadeButton>
      </div>

      {!settings.muted && (
        <div className="space-y-3">
          {/* Master Volume */}
          <div className="flex items-center justify-between gap-3">
            <label className="text-gray-300 text-xs font-mono min-w-[60px]">MASTER</label>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) => setMasterVolume(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-yellow-400 font-mono text-xs min-w-[30px] text-right">
                {Math.round(settings.masterVolume * 100)}
              </span>
            </div>
          </div>

          {/* SFX Volume */}
          <div className="flex items-center justify-between gap-3">
            <label className="text-gray-300 text-xs font-mono min-w-[60px]">SFX</label>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => setSfxVolume(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-blue-400 font-mono text-xs min-w-[30px] text-right">
                {Math.round(settings.sfxVolume * 100)}
              </span>
            </div>
          </div>

          {/* Music Volume */}
          <div className="flex items-center justify-between gap-3">
            <label className="text-gray-300 text-xs font-mono min-w-[60px]">MUSIC</label>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => setMusicVolume(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-green-400 font-mono text-xs min-w-[30px] text-right">
                {Math.round(settings.musicVolume * 100)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Audio Status Info */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="text-xs font-mono text-gray-500 text-center">Original Pacman sounds</div>
      </div>
    </div>
  )
}
