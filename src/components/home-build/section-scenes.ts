import { createSceneTools, type SceneRole } from './section-scene-tools'
import type { SceneFactory } from './useSectionBuild'

export type SectionKind = 'project' | 'sticky' | 'stack' | 'heading' | 'activity' | 'reading' | 'match' | 'contact' | 'footer'
const DESIGN = 'SceneDesign'
const COPY = 'SceneCopy'
const BUILD = 'SceneBuild'
const DETAIL = 'SceneDetail'
export const SCENE_ROLES: Record<SectionKind, SceneRole[]> = {
  project: [DESIGN, COPY, BUILD, DETAIL], sticky: [COPY, DESIGN],
  stack: [COPY, DESIGN, BUILD], heading: [COPY], activity: [DESIGN, COPY, BUILD],
  reading: [COPY, DESIGN, BUILD], match: [COPY, DESIGN],
  contact: [DESIGN, COPY, BUILD, DETAIL], footer: [DESIGN, COPY],
}

function factory(kind: SectionKind): SceneFactory {
  return (root, complete) => {
    const s = createSceneTools(root, complete)
    return s.run(() => {
      switch (kind) {
        case 'project': {
          const imageDone = s.generate(DESIGN, 0.02)
          s.type('[data-build-text="caption"]', DESIGN, imageDone, 0.28)
          const metaDone = s.type('[data-build-text="project-meta"]', COPY, 0.06, 0.32)
          const metaStyled = s.emphasize(s.get('.project__no'), COPY, metaDone)
          s.type('[data-build-text="project-title"]', COPY, metaStyled, 0.42)
          s.type('[data-build-text="project-description"]', BUILD, 0.12, 1.35)
          const linksDone = s.type('[data-build-text="project-links"]', DETAIL, 0.2, 0.75)
          s.emphasize(s.get('.pf-tags'), DETAIL, linksDone)
          break
        }
        case 'sticky': {
          const done = s.type('[data-build-text]', COPY, 0.02, 0.46)
          s.emphasize(s.get('.sticky__emph'), DESIGN, done + 0.06)
          break
        }
        case 'stack': {
          const lineDone = s.rule('[data-build-rule]', DESIGN, 0.04)
          s.type('[data-build-text="stack-label"]', DESIGN, lineDone, 0.32)
          const copyDone = s.type('[data-build-text="stack-copy"]', COPY, 0.08, 2)
          const keywords = s.all('.stack__kw-text')
          // Every keyword gets an actual style pass, after all text is typed.
          // Three collaborators work through separate groups in parallel.
          const lanes: [SceneRole, number[]][] = [[COPY, [0, 1, 2]], [DESIGN, [3, 4]], [BUILD, [5, 6]]]
          lanes.forEach(([role, indexes], lane) => {
            let next = copyDone + 0.06 + lane * 0.08
            indexes.forEach(index => { next = s.emphasize(keywords[index], role, next) })
          })
          break
        }
        case 'heading':
          s.type('[data-build-text]', COPY, 0.02, 0.42)
          break
        case 'activity': {
          const regionDone = s.panel('[data-build-box]', DESIGN, 0.02)
          s.type('[data-build-text="signal-label"]', COPY, regionDone, 0.35)
          const heatmap = root.querySelector<HTMLElement>('.heatmap')
          if (heatmap) {
            s.populate(heatmap, s.all('.heatmap__col, .heatmap__legend'), DESIGN, regionDone, 0.75)
            const statsDone = s.type('[data-build-text="heatmap-stat"]', BUILD, regionDone, 0.75)
            const statsStyled = s.emphasize(s.get('.heatmap__stat-number'), BUILD, statsDone)
            s.type('[data-build-text="signal-meta"]', BUILD, statsStyled, 0.3)
          } else s.type('[data-build-text="activity-fallback"]', DESIGN, regionDone, 0.55)
          if (!heatmap) s.type('[data-build-text="signal-meta"]', BUILD, regionDone + 0.15, 0.3)
          break
        }
        case 'reading': {
          const regionDone = s.panel('[data-build-box]', DESIGN, 0.02)
          s.type('[data-build-text="signal-label"]', DESIGN, regionDone, 0.22)
          s.type('[data-build-text="book"]', COPY, regionDone + 0.08, 0.65)
          const progressDone = s.growBar(s.get('.signal__bar'), BUILD, regionDone + 0.08)
          s.type('[data-build-text="signal-meta"]', BUILD, progressDone, 0.32)
          break
        }
        case 'match': {
          const regionDone = s.panel('[data-build-box]', DESIGN, 0.02)
          const labelDone = s.type('[data-build-text="signal-label"]', COPY, regionDone, 0.26)
          s.type('[data-build-text="signal-meta"]', COPY, labelDone, 0.32)
          s.score(s.get('.signal__score'), DESIGN, regionDone + 0.12)
          break
        }
        case 'contact': {
          const ruleDone = s.rule('[data-build-rule]', DESIGN, 0.02)
          const labelDone = s.type('[data-build-text="contact-label"]', DESIGN, ruleDone, 0.3)
          s.type('[data-build-text="email"]', COPY, 0.06, 0.85)
          const socials = s.all('[data-build-text="social"]')
          const githubDone = s.type(socials[0], BUILD, 0.15, 0.55)
          s.cloneSocials(socials[0], socials.slice(1), [BUILD, DETAIL], githubDone + 0.12)
          s.type('[data-build-text="mail-arrow"]', DESIGN, labelDone, 0.12)
          break
        }
        case 'footer': {
          const lineDone = s.rule('[data-build-rule]', DESIGN, 0.02)
          s.type('[data-build-text="copyright"]', COPY, 0.04, 0.32)
          s.type('[data-build-text="colophon"]', DESIGN, lineDone, 0.48)
          break
        }
      }
      if (SCENE_ROLES[kind].includes(DESIGN)) s.align(DESIGN)
    })
  }
}

export const SECTION_SCENES = Object.fromEntries(
  (Object.keys(SCENE_ROLES) as SectionKind[]).map(kind => [kind, factory(kind)]),
) as Record<SectionKind, SceneFactory>
