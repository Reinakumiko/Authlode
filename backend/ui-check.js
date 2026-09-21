const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  // 收集 console 错误
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(`PAGE ERROR: ${err.message}`));

  const results = [];
  const screenshot = async (name, url, waitMs = 3000) => {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(waitMs);
      const path = `/tmp/opencode/screenshot-${name}.png`;
      await page.screenshot({ path, fullPage: false });
      const title = await page.title();
      const hasContent = await page.evaluate(() => document.body.innerText.length > 10);
      results.push({ name, url, title, status: 'OK', hasContent, errorCount: errors.length });
      console.log(`✅ ${name}: "${title}" content=${hasContent} errors=${errors.length}`);
    } catch (e) {
      results.push({ name, url, status: 'FAIL', error: e.message.slice(0, 100) });
      console.log(`❌ ${name}: ${e.message.slice(0, 100)}`);
    }
  };

  // 1. 登录页
  await screenshot('login', 'http://localhost:3000/login', 2000);

  // 2. 手动建立会话（直接注入 session cookie）
  // 先通过 API 获取 session
  const loginResp = await page.request.get('http://localhost:3001/api/auth/login', { maxRedirects: 0 });
  const authPre = await context.cookies('http://localhost:3001');
  // 不能直接走完整 OIDC 流程（需要浏览器交互），所以用已有 session

  // 检查 pages 是否有 JS 错误
  await screenshot('dashboard-unauth', 'http://localhost:3000/', 2000);

  // 输出 console 错误汇总
  if (errors.length > 0) {
    console.log('\n⚠️  Console errors:');
    errors.slice(0, 10).forEach(e => console.log(`  - ${e.slice(0, 150)}`));
  } else {
    console.log('\n✓ 无 console 错误');
  }

  await browser.close();
})();
