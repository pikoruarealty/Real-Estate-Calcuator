import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const p = await b.newPage(); await p.context().grantPermissions([]);
p.on('console', m => { if (['error','warning'].includes(m.type())) console.log('CONSOLE', m.type(), m.text().slice(0,400)); });
p.on('pageerror', e => console.log('PAGEERR', e.message.slice(0,400)));
p.on('requestfailed', r => console.log('REQFAIL', r.url(), r.failure()?.errorText));
await p.goto('http://localhost:3111/');
await p.getByRole('button', { name: 'Try an example' }).first().click();
await p.waitForTimeout(800);
for (const name of ['Download PDF', 'Save image']) {
  const dl = p.waitForEvent('download', { timeout: 20000 }).catch(() => null);
  await p.getByRole('button', { name }).click();
  const d = await dl;
  console.log(name, d ? 'DOWNLOADED ' + d.suggestedFilename() : 'NO DOWNLOAD');
  console.log('status:', await p.getByRole('status').allTextContents());
}
await b.close();
