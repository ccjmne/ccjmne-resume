<script lang="ts">
  import Resume from './lib/Resume.svelte'

  const thumbnails = import.meta.glob('/src/assets/*.png', {
    eager: true,
    import: 'default',
    query: { url: true, h: 250 },
  })

  const resumes = Object.values(
    import.meta.glob<{ version: string; date: Date }>('/src/assets/*.ts', { eager: true })
  ).map(({ version, date }) => ({
    version,
    date,
    pdf: import.meta.resolve(`/assets/${version}.pdf`),
    thumbnail: thumbnails[`/src/assets/${version}.png`],
  }))
</script>

<main>
  <h1>ccjmne-resume</h1>

  <div class="links">
    {#each resumes as { version, pdf, thumbnail }}
      <Resume {version} {pdf} {thumbnail} />
    {/each}
  </div>
</main>

<style lang="scss">
  h1 {
    text-align: center;
    font-size: 3.2em;
  }

  .links {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    padding-bottom: 100px;
  }
</style>
