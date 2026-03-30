const SPREADSHEET_ID = "16wwF4ePt1Q0SYXStOoEJ5clBi3crtLgvb-G0oIm25jE"

/*************************************************
 * ■ API（Vue用）
 *************************************************/
function doGet(e) {
  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("data")

  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: "シート取得失敗" }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  const values = sheet.getDataRange().getValues()

  const data = values.slice(1).map(row => {
    return {
      name: row[3],
      brother: row[4],
      date: Utilities.formatDate(row[5], "Asia/Tokyo", "yyyy-MM-dd"),
      status: row[6]
    }
  })

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}

/*************************************************
 * ■ LINE Webhook
 *************************************************/
function doPost(e) {
  const json = JSON.parse(e.postData.contents)
  const replyToken = json.events[0].replyToken
  const userMessage = json.events[0].message.text

  let data

  if (userMessage === "出欠確認") {
    data = getTargetData(0)

  } else if (userMessage === "明日" || userMessage === "明日の出欠") {
    data = getTargetData(1)

  } else {
    return ContentService.createTextOutput("OK")
  }

  const message = createMessage(data)

  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN
    },
    payload: JSON.stringify({
      replyToken: replyToken,
      messages: [
        { type: "text", text: message }
      ]
    })
  })

  return ContentService.createTextOutput("OK")
}

/*************************************************
 * ■ テスト用
 *************************************************/
function testNotify() {
  notifyAttendance()
}