const { chromium } = require('playwright');
const { execSync } = require('child_process');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(`[${page.url().slice(-30)}] ${msg.text().slice(0, 120)}`); });
  page.on('pageerror', err => errors.push(`PAGE_ERROR: ${err.message.slice(0, 120)}`));

  const shot = async (name) => {
    await page.screenshot({ path: `/tmp/opencode/ui-${name}.png`, fullPage: false });
    console.log(`📸 ${name} 截图完成`);
  };

  // ═══ 1. 登录页截图 ═══
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  await shot('login');
  const loginBtnVisible = await page.isVisible('.btn-login');
  console.log(`登录按钮可见: ${loginBtnVisible}`);

  // ═══ 2. 完整 OIDC 登录流程 ═══
  console.log('\n--- 开始 OIDC 登录流程 ---');
  await page.click('.btn-login');
  await page.waitForURL('**/sign-in**', { timeout: 15000 });
  console.log(`✓ 跳转到 Logto 登录页: ${page.url().slice(0, 60)}`);

  // 填写 Logto 登录表单
  await page.waitForSelector('input[name="identifier"]', { timeout: 10000 });
  await page.fill('input[name="identifier"]', 'alice');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  // 填写密码
  await page.waitForSelector('input[type="password"]', { timeout: 10000 });
  await page.fill('input[type="password"]', 'P0c-Authlode-2026!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // 可能需要 consent
  const consentBtn = await page.$('button:has-text("Authorize"), button:has-text("授权"), button:has-text("Allow")');
  if (consentBtn) {
    await consentBtn.click();
    await page.waitForTimeout(1000);
  }

  // 等待回到前端
  await page.waitForURL('**/auth/callback**', { timeout: 15000 }).catch(() => {});
  await page.waitForURL('**/localhost:3000/**', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  console.log(`✓ 登录后 URL: ${page.url()}`);

  // ═══ 3. Dashboard 截图 ═══
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await shot('dashboard');
  const dashText = await page.evaluate(() => document.body.innerText.slice(0, 200));
  console.log(`Dashboard 内容: ${dashText.slice(0, 100)}...`);

  // ═══ 4. 用户管理页截图 ═══
  await page.goto('http://localhost:3000/users', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await shot('users');
  const userRows = await page.$$eval('.data-table tbody tr', rows => rows.length);
  console.log(`用户表格行数: ${userRows}`);

  // ═══ 5. 应用接入页截图 ═══
  await page.goto('http://localhost:3000/applications', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await shot('applications');

  // ═══ 6. 邀请管理页截图 ═══
  await page.goto('http://localhost:3000/invitations', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await shot('invitations');

  // ═══ 7. 角色权限页截图 ═══
  await page.goto('http://localhost:3000/roles', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await shot('roles');

  // ═══ 8. 个人中心截图 ═══
  await page.goto('http://localhost:3000/me', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await shot('me');

  // ═══ 汇总 ═══
  console.log('\n════════════════════════════');
  console.log(`截图数: 7`);
  console.log(`Console 错误: ${errors.length}`);
  if (errors.length > 0) {
    errors.slice(0, 5).forEach(e => console.log(`  ⚠️  ${e}`));
  }
  console.log('════════════════════════════');

  await browser.close();
})();
