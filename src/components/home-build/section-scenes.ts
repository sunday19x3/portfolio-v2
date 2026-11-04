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
          // Metadata, title, description, each tag and URL are independent jobs.
          const meta = s.get('[data-build-text="project-meta"]')
          const links = s.get('[data-build-text="project-links"]')
          s.show(meta, 0)
          s.show(links, 0)
          s.all('.project__no, .project__year').forEach((element, index) => {
            const done = s.type(element, COPY, 0.06 + index * 0.04, 0.32)
            if (element.matches('.project__no')) s.emphasize(element, DETAIL, done)
          })
          s.type('[data-build-text="project-title"]', COPY, 0.12, 0.6)
          s.type('[data-build-text="project-description"]', BUILD, 0.12, 1.35)
          s.all('.pf-tag').forEach((tag, index) => {
            const done = s.type(tag, DETAIL, 0.2 + index * 0.05, 0.4)
            s.emphasize(tag, DETAIL, done)
          })
          s.type(s.get('.project__link'), BUILD, 0.24, 0.6)
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
          keywords.forEach((keyword, index) => {
            s.emphasize(keyword, ([COPY, DESIGN, BUILD] as const)[index % 3], copyDone + 0.06 + index * 0.04)
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
