<script lang="ts">
  import Chic from './chic/Chic.svelte'

  let { pdf, thumbnail, version }: { pdf: string; thumbnail: string; version: string } = $props()

  let active = $state(false)
</script>

<a href={pdf} onmouseenter={() => (active = true)} onmouseleave={() => (active = false)}>
  <figure>
    <Chic {active}>
      <img src={thumbnail} alt="Resume version {version} thumbnail" />
    </Chic>
    <figcaption>Version {version}</figcaption>
  </figure>
</a>

<style lang="scss">
  a {
    text-decoration: none;
    color: inherit;

    &:hover {
      font-weight: bold;
    }
    transition: transform 0.1s ease-out;
    &:hover {
      transform: translateY(-5px);
    }
  }

  figure {
    margin: 0;
  }

  figcaption {
    text-align: center;
    transition: transform 0.1s ease-out;
    @at-root a:hover & {
      transform: translateY(30px);
    }
  }

  img {
    border-radius: 5px;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.12),
      0 1px 2px rgba(0, 0, 0, 0.24);
    // transition:
    //   box-shadow 0.1s ease-out,

    @at-root :hover & {
      // box-shadow:
      //   0 14px 28px rgba(0, 0, 0, 0.25),
      //   0 10px 10px rgba(0, 0, 0, 0.22);
    }
  }
</style>
