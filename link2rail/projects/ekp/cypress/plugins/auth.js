const puppeteer = require("puppeteer");

async function launchBrowser(baseUrl) {
  return await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--ignore-certificate-errors",
      `--unsafely-treat-insecure-origin-as-secure=${baseUrl}/`,
      "--disable-notifications",
    ],
  });
}

async function redirectToLoginPage(page) {
  return await page.click("#loginBtn");
}

async function loginToDbWebSso(page, username, password) {
  if (!username || !password) {
    throw new Error("Username or Password missing for login");
  }
  await page.waitForSelector("input[name=username]");
  await page.click("input[name=username]");
  await page.type("input[name=username]", username);
  await page.waitForSelector("input[name=password]");
  await page.click("input[name=password]");
  await page.type("input[name=password]", password);
  await page.waitForSelector("input[type=submit]", {
    visible: true,
    timeout: 5000,
  });
  const [response] = await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    page.click("input[type=submit]"),
  ]);
  return response;
}

async function getLocalStorageData(page) {
  return await page.evaluate(() => {
    return Object.keys(localStorage).reduce(
      (items, curr) => ({
        ...items,
        [curr]: localStorage.getItem(curr),
      }),
      {}
    );
  });
}

async function getSessionStorageData(page) {
  return page.evaluate(() => {
    return Object.keys(sessionStorage).reduce(
      (items, curr) => ({
        ...items,
        [curr]: sessionStorage.getItem(curr),
      }),
      {}
    );
  });
}

module.exports = {
  GetSession: async function (username, password) {
    const url = process.env.CYPRESS_BASE_URL || "http://localhost:4200";
    const browser = await launchBrowser(url);
    const page = await browser.newPage();

    try {
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(url);
      await redirectToLoginPage(page);
      const response = await loginToDbWebSso(page, username, password);

      // The login failed.
      if (response.status() >= 400) {
        throw new Error(
          `Login with user ${username} failed, error ${response.status()}`
        );
      }

      const { cookies } = await page._client.send("Network.getAllCookies", {});
      const lsd = await getLocalStorageData(page);
      const ssd = await getSessionStorageData(page);
      return {
        cookies,
        lsd,
        ssd,
      };
    } finally {
      await page.close();
      await browser.close();
    }
  },
};
