// IFT 302 - Practice 3
// Behaviour for the portfolio page.

// Some people set their system to reduce animation. Checking once here
// lets the moving parts below opt out politely.
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


// ---------- 1. Light / dark theme switch ----------
// Clicking the button puts data-theme="dark" on the <html> element,
// which swaps every colour variable in style.css at once.

const root = document.documentElement;
const themeButton = document.getElementById("theme-toggle");

// localStorage is blocked in some browsers when a page is opened straight
// from the file system, so both calls are wrapped rather than risking an
// error that would stop the rest of this file from running.
const rememberTheme = (theme) => {
    try {
        localStorage.setItem("theme", theme);
    } catch (error) {
        // No storage available - the choice just won't survive a reload.
    }
};

const savedTheme = () => {
    try {
        return localStorage.getItem("theme");
    } catch (error) {
        return null;
    }
};

const applyTheme = (theme) => {
    if (theme === "dark") {
        root.setAttribute("data-theme", "dark");
        themeButton.textContent = "Light";
    } else {
        root.removeAttribute("data-theme");
        themeButton.textContent = "Dark";
    }
};

// Light is the default; only a previous click can change that.
applyTheme(savedTheme() === "dark" ? "dark" : "light");

themeButton.addEventListener("click", () => {
    const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    rememberTheme(nextTheme);
    applyTheme(nextTheme);
});


// ---------- 2. Type the tagline out on load ----------
// The finished text lives in the HTML, so it is still there for search
// engines and for anyone without JavaScript. Here it is emptied and
// then put back one letter at a time.

const tagline = document.querySelector(".tagline");

if (!prefersReducedMotion) {
    const fullText = tagline.textContent;
    const typedText = document.createTextNode("");

    const cursor = document.createElement("span");
    cursor.className = "cursor";
    cursor.textContent = "|";

    tagline.textContent = "";
    tagline.append(typedText, cursor);

    let letterIndex = 0;

    const typeNextLetter = () => {
        if (letterIndex < fullText.length) {
            typedText.textContent += fullText[letterIndex];
            letterIndex += 1;
            setTimeout(typeNextLetter, 55);
        }
    };

    setTimeout(typeNextLetter, 400);   // a short pause before it starts
}


// ---------- 3. Reading progress bar ----------
// The bar across the top of the window fills as the page is scrolled.

const progressBar = document.getElementById("progress");

const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;

    progressBar.style.width = percent + "%";
};


// ---------- 4. Highlight the current section in the navigation ----------

const navLinks = document.querySelectorAll("nav a");
const sections = document.querySelectorAll("main section");

const updateActiveLink = () => {
    let lowestTop = -1;
    let currentIds = [];

    // Find the furthest-down section whose top has passed the reading
    // line; the 140px offset accounts for the nav bar. Skills and
    // Elsewhere share a grid row, so they share an offsetTop - anything
    // level with the winner counts as current too, and both light up.
    sections.forEach((section) => {
        const top = section.offsetTop;

        if (window.scrollY >= top - 140) {
            if (top > lowestTop) {
                lowestTop = top;
                currentIds = [];
            }
            if (top === lowestTop) {
                currentIds.push(section.id);
            }
        }
    });

    navLinks.forEach((link) => {
        const id = link.getAttribute("href").slice(1);
        link.classList.toggle("active", currentIds.includes(id));
    });
};


// One scroll listener drives both of the above, rather than two separate
// listeners doing work on the same event.
window.addEventListener("scroll", () => {
    updateProgress();
    updateActiveLink();
});

updateProgress();
updateActiveLink();


// ---------- 5. Fade each section in as it is reached ----------
// IntersectionObserver reports when an element enters the viewport,
// which is cheaper than measuring positions on every scroll event.

if (!prefersReducedMotion) {
    sections.forEach((section) => section.classList.add("reveal"));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);   // only animate once
            }
        });
    }, { threshold: 0.15 });

    sections.forEach((section) => observer.observe(section));
}


// ---------- 6. The year in the footer ----------
// Read from the browser's clock so the page never goes out of date.

const yearSpan = document.getElementById("year");
yearSpan.textContent = new Date().getFullYear();
