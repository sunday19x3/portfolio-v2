import { MaskLine, SplitText } from '@/components/portfolio/text'
import styles from './home-build.module.css'

// Keep v2's markup and text flow, including its original mobile reveals.
export function HomeBuildHero() {
  return (
    <section className={`hero ${styles.hero}`} data-build-hero>
      <div className='hero__top'>
        <span className='pf-eyebrow' data-hero-text='edition'>Portfolio · 2026</span>
        <span className='pf-eyebrow' data-hero-text='number'>№ 001 / Sunday</span>
      </div>
      <div className='hero__center'>
        <h1 className='hero__title' data-hover='text'>
          <SplitText text='Sunday' />
        </h1>
        <p className='hero__manifesto'>
          <MaskLine text='Frontend & Web3 developer, based in Hanoi.' delay={500} />
          <br />
          <MaskLine text='Builds production systems, ships side projects monthly,' delay={620} />
          <br />
          <MaskLine text='prefers clean code over clever code.' delay={740} />
        </p>
      </div>
      <div className='hero__bottom'>
        <div className='hero__cue'>
          <span className='hero__cue-line' />
          <span className='pf-eyebrow' data-hero-text='scroll'>Scroll · 6 sections</span>
        </div>
        <div className='pf-eyebrow' data-hero-text='since'>Developer · since 2020</div>
      </div>
    </section>
  )
}
