const express = require('express');
const { chromium } = require('playwright');

const app = express();
app.use(express.json());

app.post('/run', async (req, res) => {
  const { username, password } = req.body;

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://biza.tv/resellers/login?referrer=logout');
    await page.fill('input[name="username"]', username || 'defaultUsername');
    await page.fill('input[name="password"]', password || 'defaultPassword');
    await page.click('button[type="submit"]');

    const headingVisible = await page.isVisible('role=heading[name="Installation"]');
    await browser.close();

    if (!headingVisible) throw new Error('Heading not visible.');
    res.json({ success: true, message: 'Login successful.' });
  } catch (error) {
    await browser.close();
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
