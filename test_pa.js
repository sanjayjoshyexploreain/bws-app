const url = "https://defaultf0c7195f1d784e7c90f99261d41389.68.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/6e8a378d4d7e4dd898a833c60f1f94d7/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=TWetJaaWiRcMaqV0qPzSqZkCU3R7XuUaBsKowIOp0iw";

async function test() {
  const payload = {
    entryId: 123,
    employeeId: 'TEST123',
    dateKey: '2026-10-01',
    fileName: 'test.jpg',
    fileBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    photoBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', text);
}

test();
