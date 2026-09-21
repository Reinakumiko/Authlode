const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  // 从 curl cookie jar 提取 auth_session
  const jarContent = fs.readFileSync('/tmp/opencode/ui-jar', 'utf8');
  let sessionToken = null;
  for (const line of jarContent.split('\n')) {
    if (line.includes('auth_session')) {
      const parts = line.split('\t');
      sessionToken = parts[parts.length - 1];
      break;
    }
  }
  if (!sessionToken) { console.error('❌ 无 session'); process.exit(1); }
  console.log('✓ session token: ' + sessionToken.slice(0, 20) + '...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });

  // 注入 cookies（session + 到两个端口的）
  await context.addCookies([
    { name: 'auth_session', value: sessionToken, domain: 'localhost', path: '/' },
  ]);

  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(err.message.slice(0, 100)));

  const pages = [
    ['', 'Dashboard'],
    ['login', '登录页'],
    ['users', '用户管理'],
    ['organizations', '组织管理'],
    ['roles', '角色权限'],
    ['applications', '应用接入'],
    ['invitations', '邀请管理'],
    ['audit-logs', '审计日志'],
    ['settings', '系统设置'],
    ['statistics', '数据统计'],
    ['me', '个人中心'],
  ];

  for (const [path, label] of pages) {
    try {
      await page.goto('http://localhost:3000/' + path, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);
      const name = path || 'dashboard';
      await page.screenshot({ path: '/tmp/opencode/ui-' + name + '.png' });
      const textLen = await page.evaluate(() => document.body.innerText.length);
      const hasRealData = await page.evaluate(() => {
        const t = document.body.innerText;
        return t.includes('alice') || t.includes('Acme') || t.includes('Beta') || t.includes('OIDC') || parseInt(t) > 0;
      });
      console.log(
        (hasRealData ? '✅' : '⚠️') + ' /' + (path || '(dashboard)') +
        ' [' + label + '] 内容:' + textLen + '字' +
        (hasRealData ? ' 含真实数据' : '')
      );
    } catch (e) {
      console.log('❌ /' + path + ' — ' + e.message.slice(0, 80));
    }
  }

  console.log('\n=== Console 错误 ===');
  if (errors.length > 0) {
    errors.slice(0, 8).forEach(e => console.log('  ⚠ ' + e));
  } else {
    console.log('  ✓ 零错误');
  }

  await browser.close();
  console.log('\n✅ UI 渲染验证完成');
})();
