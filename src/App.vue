<script setup>
import { ref, onMounted, computed } from "vue"

const GAS_URL = "https://script.google.com/macros/s/AKfycbwDO9vI4vece_1h5s-IYPopKXW7c8I7_gNIQzhUf7z6nJrLN2dBlFiabj7ULaLh7HDd/exec"

const currentDate = ref(new Date())
const data = ref({})
const rawData = ref([])
const selectedDate = ref(null)
const selectedList = ref([])

// ★日付フォーマット
const format = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

// ★今日判定
const today = format(new Date())

// ★年月表示
const yearMonth = computed(() => {
  const y = currentDate.value.getFullYear()
  const m = currentDate.value.getMonth() + 1
  return `${y}年${m}月`
})

// ★カレンダー生成
const days = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)

  const arr = []

  for (let i = 0; i < first.getDay(); i++) {
    arr.push(null)
  }

  for (let d = 1; d <= last.getDate(); d++) {
    arr.push(new Date(year, month, d))
  }

  return arr
})

// ★月切替
const prevMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1
  )
  fetchData() // ←これ追加
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1
  )
  fetchData() // ←これ追加
}

// ★データ取得
const fetchData = async () => {
  const res = await fetch(GAS_URL)
  const json = await res.json()

  rawData.value = json

  const grouped = {}

  json.forEach(item => {
    if (!grouped[item.date]) {
      grouped[item.date] = { absent: 0, late: 0 }
    }

    if (item.status === "欠席") grouped[item.date].absent++
    if (item.status.includes("10時")) grouped[item.date].late++
  })

  data.value = grouped
}

// ★クリック
const selectDay = (day) => {
  if (!day) return

  const key = format(day)
  selectedDate.value = key

  selectedList.value = rawData.value.filter(
    item => item.date === key
  )
}

onMounted(fetchData)
</script>

<template>
  <div class="p-4 max-w-4xl mx-auto">

    <!-- タイトル -->
    <h1 class="text-2xl font-bold mb-4">管理者カレンダー</h1>

    <!-- 月切替 -->
    <div class="flex justify-between items-center mb-4">
      <button class="btn btn-sm" @click="prevMonth">←</button>
      <div class="font-bold">{{ yearMonth }}</div>
      <button class="btn btn-sm" @click="nextMonth">→</button>
    </div>

    <!-- 曜日 -->
    <div class="grid grid-cols-7 text-center font-bold mb-2">
      <div v-for="d in ['日','月','火','水','木','金','土']" :key="d">
        {{ d }}
      </div>
    </div>

    <!-- カレンダー -->
    <div class="grid grid-cols-7 gap-2">
      <div
        v-for="(day, i) in days"
        :key="i"
        @click="selectDay(day)"
        class="h-24 p-2 rounded-lg border cursor-pointer transition"

        :class="[
          day && format(day) === today ? 'bg-yellow-100 border-yellow-400' : '',
          day && selectedDate === format(day) ? 'bg-blue-100' : '',
          !day ? 'bg-gray-50' : 'hover:bg-gray-100'
        ]"
      >
        <div v-if="day">
          <div class="font-bold text-sm">
            {{ day.getDate() }}
          </div>

          <div v-if="data[format(day)]" class="text-xs mt-1">
            <div class="text-red-500">
              欠席 {{ data[format(day)].absent }}
            </div>
            <div class="text-blue-500">
              10時 {{ data[format(day)].late }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 詳細 -->
    <div v-if="selectedDate" class="mt-6 p-4 bg-base-200 rounded">
      <h2 class="font-bold mb-2">{{ selectedDate }} の詳細</h2>

      <div v-if="selectedList.length === 0">
        データなし
      </div>

      <div
        v-for="(item, i) in selectedList"
        :key="i"
        class="py-1 border-b"
      >
        {{ item.name }}
        <span v-if="item.brother"> / {{ item.brother }}</span>
        - {{ item.status }}
      </div>
    </div>

  </div>
</template>