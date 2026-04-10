const fs = require('fs');

const pyFile = '/home/jules/verification/verify_multipage.py';
let pyC = fs.readFileSync(pyFile, 'utf8');

// I made a mistake, my rewrite of python script used cards.first.click() inside an indentation, and wait_for_timeout.
pyC = pyC.replace(
  `cards = page.locator("div.bg-\\[\\#1c1e2b\\]")
    if cards.count() > 0:
        cards.first.click()
        page.wait_for_timeout(3000)

        page.screenshot(path="/home/jules/verification/screenshots/moment_detail.png")
        page.wait_for_timeout(1000)

        # Click the author avatar to go to User Profile Page
        avatars = page.locator("img[alt='avatar']")
        if avatars.count() > 0:
            avatars.first.click()
            page.wait_for_timeout(3000)
            page.screenshot(path="/home/jules/verification/screenshots/user_profile.png")`,
  `cards = page.locator("div.bg-\\[\\#1c1e2b\\]")
    cards.first.click()
    page.wait_for_timeout(3000)

    page.screenshot(path="/home/jules/verification/screenshots/moment_detail.png")
    page.wait_for_timeout(1000)

    avatars = page.locator("img[alt='avatar']")
    avatars.first.click()
    page.wait_for_timeout(3000)
    page.screenshot(path="/home/jules/verification/screenshots/user_profile.png")`
);

fs.writeFileSync(pyFile, pyC);
