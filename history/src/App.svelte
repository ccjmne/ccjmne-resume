<script>
  import Resume from "./lib/Resume.svelte";

  const resumes = Object.keys(
    import.meta.glob("/public/assets/*/*.pdf", { eager: true }),
  ).map((pdf) => ({
    version: pdf.split("/").slice(-2, -1)[0],
    pdf,
    thumbnail: pdf.replace(/.pdf$/, ".png"),
  }));
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
