<template>
  <div class="bg-white rounded-xl card-shadow p-6 hover-lift transition">
    <div class="flex items-center gap-4">
      <div
        class="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
        :class="bgClass"
      >
        {{ icon }}
      </div>
      <div class="flex-1">
        <p class="text-sm text-gray-600 mb-1">{{ label }}</p>
        <p class="text-3xl font-bold" :class="textClass">{{ value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [Number, String],
  icon: String,
  bgClass: {
    type: String,
    default: "bg-purple-100",
  },
  textClass: {
    type: String,
    default: "text-gray-800",
  },
});
</script>
