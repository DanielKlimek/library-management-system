<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 fade-in"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 slide-up">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">{{ title }}</h2>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: String,
});

defineEmits(["close"]);
</script>
