<template>
  <div
    class="bg-white rounded-xl card-shadow p-5 hover-lift cursor-pointer transition"
    @click="$emit('click')"
  >
    <div class="flex gap-4">
      <img
        v-if="loan.book?.coverImage"
        :src="`http://localhost:5000${loan.book.coverImage}`"
        :alt="loan.book.title"
        class="w-20 h-28 object-cover rounded-lg"
      />
      <div
        v-else
        class="w-20 h-28 bg-linear-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center"
      >
        <span class="text-3xl">📖</span>
      </div>

      <div class="flex-1">
        <h3 class="text-lg font-bold text-gray-800 mb-1">
          {{ loan.book?.title }}
        </h3>
        <p class="text-sm text-gray-600 mb-2">{{ loan.book?.author }}</p>

        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs bg-gray-100 px-2 py-1 rounded">
            📅 Požičané: {{ formatDate(loan.loanDate) }}
          </span>
          <span class="text-xs bg-gray-100 px-2 py-1 rounded">
            ⏰ Vrátiť do: {{ formatDate(loan.dueDate) }}
          </span>
        </div>

        <div v-if="loan.user && showUser" class="text-sm text-gray-600 mb-2">
          👤 {{ loan.user.name }} ({{ loan.user.email }})
        </div>

        <div class="flex items-center gap-2">
          <span
            class="inline-block px-3 py-1 rounded-full text-sm font-medium"
            :class="statusClass"
          >
            <span v-if="props.loan.status === 'active'" class="status-dot bg-green-500 mr-1"></span>
            <span v-else-if="props.loan.status === 'overdue'" class="status-dot bg-red-500 mr-1"></span>
            {{ statusText }}
          </span>

          <span v-if="loan.fine > 0" class="text-red-600 font-semibold text-sm pulse-badge">
            💰 Pokuta: {{ loan.fine }}€
          </span>

          <span v-if="daysRemaining !== null" class="text-sm text-gray-600">
            {{ daysRemaining > 0 ? `Zostáva ${daysRemaining} dní` : "" }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  loan: Object,
  showUser: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["click"]);

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("sk-SK");
};

const statusClass = computed(() => {
  switch (props.loan.status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "returned":
      return "bg-gray-100 text-gray-800";
    case "overdue":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
});

const statusText = computed(() => {
  switch (props.loan.status) {
    case "active":
      return "✓ Aktívne";
    case "returned":
      return "✓ Vrátené";
    case "overdue":
      return "⚠ Po termíne";
    default:
      return props.loan.status;
  }
});

const daysRemaining = computed(() => {
  if (props.loan.status === "returned") return null;
  const today = new Date();
  const due = new Date(props.loan.dueDate);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  return diff;
});
</script>
