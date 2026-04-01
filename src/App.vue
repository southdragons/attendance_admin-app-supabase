<script setup>
import { ref, onMounted, computed, watch } from "vue"

const GAS_URL = "https://script.google.com/macros/s/AKfycbw7m502bEiYMzvxK2s7C4EBBbvtb3KEDFE-EPC0HHvdZafCJ_2c-NMDx30TIEcfYY0Azw/exec"

const currentDate = ref(new Date())
const data = ref({})
const rawData = ref([])
const selectedDate = ref(null)

// 日付フォーマット
const format = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const today = format(new Date())

// 年月表示
const yearMonth = computed(() => {
  return `${currentDate.value.getFullYear()}年${currentDate.value.getMonth() + 1}月`
})

// カレンダー生成
const days = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)

  const arr = []

  for (let i = 0; i < first.getDay(); i++) arr.push(null)
  for (let d = 1; d <= last.getDate(); d++) {
    arr.push(new Date(year, month, d))
  }

  return arr
})

// 月切替
const prevMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

// データ取得
const fetchData = async () => {
  try {
    const res = await fetch(GAS_URL)
    const json = await res.json()

    rawData.value = json

    const grouped = {}

    json.forEach(item => {
      const date = String(item.date).slice(0, 10)
      const status = String(item.status || "").trim()

      if (!grouped[date]) {
        grouped[date] = { absent: 0, late: 0 }
      }

      if (status === "欠席") grouped[date].absent++
      if (status.includes("10時")) grouped[date].late++
    })

    data.value = grouped

  } catch (e) {
    console.error("取得エラー", e)
  }
}

// 日付クリック
const selectDay = (day) => {
  if (!day) return
  selectedDate.value = format(day)
}

// 詳細データ
const selectedList = computed(() => {
  if (!selectedDate.value) return []

  return rawData.value.filter(
    item => String(item.date).slice(0, 10) === selectedDate.value
  )
})

// ★ここ追加（重要）
// 欠席グループ
const absentList = computed(() => {
  return selectedList.value.filter(item => item.status === "欠席")
})

// 10時参加グループ
const lateList = computed(() => {
  return selectedList.value.filter(item =>
    item.status.includes("10時")
  )
})

// モーダル閉じる
const closeModal = () => {
  selectedDate.value = null
}

// 初期ロード
onMounted(fetchData)

// 月変更で再取得
watch(currentDate, fetchData)
</script>

<template>
  <div class="p-4 max-w-4xl mx-auto">

    <!-- タイトル -->
    <h1 class="text-2xl font-bold mb-4">管理者カレンダー</h1>

    <!-- 月切替 -->
    <div class="flex justify-between items-center mb-4">
      <button class="btn btn-sm" @click="prevMonth">←</button>
      <div class="font-bold text-lg">{{ yearMonth }}</div>
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
          day && format(day) === today ? 'bg-yellow-200 border-yellow-500' : '',
          !day ? 'bg-gray-50' : 'hover:bg-gray-100'
        ]"
      >
        <div v-if="day">
          <div class="font-bold text-sm">
            {{ day.getDate() }}
          </div>

          <div v-if="data[format(day)]" class="text-xs mt-1 space-y-1">

            <div v-if="data[format(day)].absent" class="text-red-500 font-bold">
              ❌ {{ data[format(day)].absent }}人
            </div>

            <div v-if="data[format(day)].late" class="text-blue-500">
              🕙 {{ data[format(day)].late }}人
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- モーダル -->
    <div v-if="selectedDate" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

      <div class="bg-white p-5 rounded-xl w-80 max-h-[70vh] overflow-y-auto">

        <h2 class="font-bold text-lg mb-3">
          {{ selectedDate }}
        </h2>

        <!-- 欠席 -->
        <div v-if="absentList.length">
          <div class="font-bold text-red-500 mb-1">
            ❌ 欠席（{{ absentList.length }}人）
          </div>

          <div v-for="(item, i) in absentList" :key="'a'+i" class="border-b py-1">
            {{ item.name }}
          </div>
        </div>

        <!-- 10時参加 -->
        <div v-if="lateList.length" class="mt-3">
          <div class="font-bold text-blue-500 mb-1">
            🕙 10時以降参加（{{ lateList.length }}人）<br>
            <span class="text-xs font-normal">　└対象：小3以下</span>
          </div>

          <div v-for="(item, i) in lateList" :key="'l'+i" class="border-b py-1">
            {{ item.name }}
          </div>
        </div>

        <!-- データなし -->
        <div v-if="!absentList.length && !lateList.length">
          データなし
        </div>

        <button class="btn btn-block mt-4" @click="closeModal">
          閉じる
        </button>

      </div>
    </div>

  </div>
</template>