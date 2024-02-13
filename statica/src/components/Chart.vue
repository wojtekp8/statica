<template>
    <div class="hello">
        <h1>Wykres</h1>
        <div id="scichart-root" style="width: 600px; height: 400px; margin: auto;"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { initSciChart } from '../initSciChart';

export default defineComponent({
  name: 'Chart',
  setup() {
    onMounted(async () => {
      await initSciChart();
    });
  }
});
</script>



