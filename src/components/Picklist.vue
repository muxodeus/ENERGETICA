<template>
  <div class="picklist">
    <label v-if="label">{{ label }}</label>
    <select
      :modelValue="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="item in options" :key="item.value" :value="item.value">
        {{ item.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  modelValue: [String, Number],
  label: String,
  options: {
    type: Array,
    required: true // [{ value: 'energia', label: 'Energía activa (kWh)' }]
  }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.picklist {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
select {
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}
</style>
