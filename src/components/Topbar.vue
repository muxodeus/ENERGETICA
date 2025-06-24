<template>
  <div class="topbar">
    <span class="logo">⚡ ENERGÉTICA</span>
    <span class="time">{{ time }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const time = ref('')
const update = () => {
  time.value = dayjs().tz('America/El_Salvador').format('HH:mm:ss')
}
onMounted(() => {
  update()
  setInterval(update, 1000)
})
</script>

<style scoped>
.topbar {
  background: #0066cc;
  color: white;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
}
.logo {
  font-weight: bold;
  font-size: 1.1rem;
}
</style>
