const puppeteer = require('puppeteer');

async function fetchQuestions(url) {
    const browser = await puppeteer.launch({ headless: false }); // Launch browser in non-headless mode for debugging
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    try {
        // Wait for quiz container to load
        await page.waitForSelector('.quiz-container', { timeout: 10000 });

        // Click through the quiz to load questions
        const questions = await page.evaluate(async () => {
            const questions = [];

            // Function to wait for element to appear
            async function waitForElement(selector) {
                return new Promise(resolve => {
                    const interval = setInterval(() => {
                        const element = document.querySelector(selector);
                        if (element) {
                            clearInterval(interval);
                            resolve(element);
                        }
                    }, 100);
                });
            }

            // Simulate clicking through quiz pages
            let nextPageButton = await waitForElement('.next-page-button');
            while (nextPageButton) {
                nextPageButton.click();
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for next page to load (adjust as needed)

                const questionElements = document.querySelectorAll('.question-text'); // Adjust selector based on Khan Academy's quiz structure
                questionElements.forEach(element => {
                    questions.push(element.textContent.trim());
                });

                nextPageButton = document.querySelector('.next-page-button');
            }

            return questions;
        });

        console.log('Questions:', questions);

    } catch (error) {
        console.error('Error fetching questions:', error);
    } finally {
        await browser.close();
    }
}

// Example usage
const url = 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:foundation-algebra/x2f8bb11595b61c86:substitute-evaluate-expression/quiz/x2f8bb11595b61c86:foundation-algebra-quiz-1?referrer=upsell';
fetchQuestions(url);
