<template>
  <div
    class="bg-white rounded-xl card-shadow p-4 hover-lift cursor-pointer"
    @click="$emit('click')"
  >
    <img
      v-if="book.coverImage"
      :src="`http://localhost:5000${book.coverImage}`"
      :alt="book.title"
      class="w-full h-64 object-cover rounded-lg mb-3 hover-scale"
    />
    <div
      v-else
      class="w-full h-64 bg-linear-to-br from-purple-400 to-pink-400 rounded-lg mb-3 flex items-center justify-center"
    >
      <span class="text-6xl">📖</span>
    </div>

    <h3 class="text-xl font-bold mb-1 text-gray-800">{{ book.title }}</h3>
    <p class="text-gray-600 mb-2">{{ book.author }}</p>

    <div class="flex items-center gap-2 mb-2">
      <div class="star-rating">
        {{ "★".repeat(Math.round(book.ratingAvg))
        }}{{ "☆".repeat(5 - Math.round(book.ratingAvg)) }}
      </div>
      <span class="text-sm text-gray-500">({{ book.ratingCount }})</span>
    </div>

    <div class="flex justify-between text-sm">
      <span class="text-gray-500">{{ book.year }}</span>
      <span
        class="tooltip-container"
        :class="book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'"
      >
        <span class="tooltip">{{ book.availableCopies > 0 ? 'Môžete si požičať' : 'Všetky kusy sú požičané' }}</span>
        {{
          book.availableCopies > 0
            ? `Dostupné: ${book.availableCopies}`
            : "Nedostupné"
        }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  book: Object,
});

defineEmits(["click"]);
</script>
