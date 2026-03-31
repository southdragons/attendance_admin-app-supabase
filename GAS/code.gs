/*************************************************
 * ■設定
 *************************************************/
const TARGET_SHEET = "data"
const CHANNEL_ACCESS_TOKEN = "FBUTNDV82qQr5CCc1x09QKVh3RDgaxkK6t2WmIHiX5GHkjKSX4AKCqruYJH7NNWndroeAPIQVxJ9XPX0W8u17iQWlg9VEG1Rax8M9Ohgg4yeYAchPJWzexFA+kHUKZBejLbm6Mg7KsEeC2VUOP6ZMAdB04t89/1O/w1cDnyilFU="
const GROUP_ID = "U26f4f2c8e4d75e8cdd1452b3f8a82951"

/*************************************************
 * ■メイン（自動通知用）
 *************************************************/
function notifyAttendance() {

  const data = getTargetData(1) // 🔥 明日

  // 🔥 未入力日は通知しない
  if (data.absent.length === 0 && data.late.length === 0) {
    Logger.log("未入力のため通知スキップ")
    return
  }

  const message = createMessage(data)

  sendLineMessage(message)
}

/*************************************************
 * ■データ取得（offset対応）
 *************************************************/
function getTargetData(offset = 0) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName(TARGET_SHEET)

  const values = sheet.getDataRange().getValues()

  const targetDate = getTargetDate(offset)

  const latestMap = {}

  for (let i = 1; i < values.length; i++) {
    const row = values[i]

    const name = row[3]
    const brother = row[4]

    const date = Utilities.formatDate(
      row[5],
      "Asia/Tokyo",
      "yyyy-MM-dd"
    )

    const status = row[6]

    if (date !== targetDate) continue

    latestMap[name] = {
      name,
      brother,
      status
    }
  }

  let absent = []
  let late = []

  for (const key in latestMap) {
    const item = latestMap[key]

    const label = item.brother
      ? `${item.name}（${item.brother}）`
      : item.name

    if (item.status === "欠席") absent.push(label)
    if (item.status.includes("10時")) late.push(label)
  }

  return {
    date: targetDate,
    absent,
    late
  }
}

/*************************************************
 * ■対象日（offset対応）
 *************************************************/
function getTargetDate(offset = 0) {
  const target = new Date()
  target.setDate(target.getDate() + offset)

  return Utilities.formatDate(
    target,
    "Asia/Tokyo",
    "yyyy-MM-dd"
  )
}

/*************************************************
 * ■メッセージ生成
 *************************************************/
function createMessage(data) {

  data.absent.sort()
  data.late.sort()

  if (!data.absent.length && !data.late.length) {
    return `⚾【${data.date} 出席状況】\n\nまだ回答がありません`
  }

  let msg = ""

  msg += `⚾【${data.date} 出席状況】\n\n`

  msg += `❌ 欠席：${data.absent.length}人\n`
  msg += (data.absent.length ? data.absent.join("\n") : "なし") + "\n\n"

  msg += `🕙 10時参加：${data.late.length}人\n`
  msg += (data.late.length ? data.late.join("\n") : "なし")

  return msg
}

/*************************************************
 * ■LINE送信（自動用）
 *************************************************/
function sendLineMessage(message) {
  const url = "https://api.line.me/v2/bot/message/push"

  const payload = {
    to: GROUP_ID,
    messages: [
      {
        type: "text",
        text: message
      }
    ]
  }

  UrlFetchApp.fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN
    },
    payload: JSON.stringify(payload)
  })
}