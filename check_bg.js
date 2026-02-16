import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5174/');
  
  const bodyInfo = await page.evaluate(() => {
    const style = window.getComputedStyle(document.body);
    return {
        image: style.getPropertyValue('background-image'),
        color: style.getPropertyValue('background-color'),
        display: style.getPropertyValue('display'),
        visibility: style.getPropertyValue('visibility'),
        opacity: style.getPropertyValue('opacity')
    };
  });

  const htmlInfo = await page.evaluate(() => {
    const style = window.getComputedStyle(document.documentElement);
    return {
        image: style.getPropertyValue('background-image'),
        color: style.getPropertyValue('background-color')
    };
  });

  console.log('HTML Info:', htmlInfo);
  console.log('Body Info:', bodyInfo);
  
  const sectionBgs = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('section, footer, header'));
    return elements.map(s => ({
        tag: s.tagName,
        className: s.className,
        bgColor: window.getComputedStyle(s).getPropertyValue('background-color'),
        bgImage: window.getComputedStyle(s).getPropertyValue('background-image')
    }));
  });

  const pseudoBgs = await page.evaluate(() => {
    const res = [];
    ['body', '#root'].forEach(sel => {
        ['::before', '::after'].forEach(pseudo => {
            const style = window.getComputedStyle(document.querySelector(sel), pseudo);
            res.push({
                selector: sel + pseudo,
                bgColor: style.getPropertyValue('background-color'),
                bgImage: style.getPropertyValue('background-image'),
                content: style.getPropertyValue('content'),
                inset: style.getPropertyValue('inset'),
                position: style.getPropertyValue('position')
            });
        });
    });
    return res;
  });

  console.log('Pseudo Backgrounds:', JSON.stringify(pseudoBgs, null, 2));

  const fixedBg = await page.evaluate(() => {
    const el = document.querySelector('.fixed.inset-0.pointer-events-none.overflow-hidden');
    if (!el) return 'not found';
    return {
        bgColor: window.getComputedStyle(el.firstElementChild).getPropertyValue('background-color'),
        className: el.className
    };
  });
  console.log('Fixed Background:', fixedBg);

  await browser.close();
})();
