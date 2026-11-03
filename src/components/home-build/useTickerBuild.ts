import { useSectionBuild } from './useSectionBuild'
import { createTickerScene } from './ticker-scene'

export function useTickerBuild(options: Pick<Parameters<typeof useSectionBuild>[0], 'rootRef' | 'onArm' | 'onStart' | 'onComplete'>) {
  return useSectionBuild({ ...options, id: 'now', createScene: createTickerScene })
}
