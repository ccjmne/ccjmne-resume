<script lang="ts">
  import Chic from './chic/Chic.svelte'

  export let pdf, thumbnail, version
</script>

<a href={pdf} target="_blank">
  <figure>
    <Chic>
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
  }

  figcaption {
    text-align: center;
  }

  img {
    border-radius: 5px;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.12),
      0 1px 2px rgba(0, 0, 0, 0.24);
    transition:
      box-shadow 0.1s ease-out,
      transform 0.1s ease-out;

    @at-root :hover & {
      transform: translateY(-5px);
      bottom: 5px;
      box-shadow:
        0 14px 28px rgba(0, 0, 0, 0.25),
        0 10px 10px rgba(0, 0, 0, 0.22);
    }
  }
</style>
