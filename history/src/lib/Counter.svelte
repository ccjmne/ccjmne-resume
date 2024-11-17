<script lang="ts">
  let count = $state(0)
  function increment(): void {
    count += 2;
  }
</script>

<button onclick={increment}>
  count is {count}
</button>
