/* =========================================================
   SPENDSMART UI INTERACTIONS
   No dependencies. Everything degrades gracefully.
========================================================= */

(function () {
    "use strict";

    var reduceMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var inr = new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2
    });


    /* =====================================================
       CATEGORY ARTWORK
    ===================================================== */

    var CATEGORY_META = {
        Salary:        { emoji: "💼", tone: "tone-brand" },
        Freelancing:   { emoji: "💻", tone: "tone-brand" },
        Business:      { emoji: "🏢", tone: "tone-brand" },
        Investment:    { emoji: "📈", tone: "tone-income" },
        Bonus:         { emoji: "🎉", tone: "tone-income" },
        "Gift Received": { emoji: "🎁", tone: "tone-pink" },
        "Rental Income": { emoji: "🏠", tone: "tone-brand" },
        Refund:        { emoji: "💸", tone: "tone-cyan" },
        Cashback:      { emoji: "💳", tone: "tone-cyan" },
        "Other Income": { emoji: "💵", tone: "tone-income" },

        Food:          { emoji: "🍔", tone: "tone-amber" },
        Groceries:     { emoji: "🛒", tone: "tone-amber" },
        Rent:          { emoji: "🏠", tone: "tone-brand" },
        Electricity:   { emoji: "⚡", tone: "tone-amber" },
        "Water Bill":  { emoji: "💧", tone: "tone-cyan" },
        "Gas Bill":    { emoji: "🔥", tone: "tone-expense" },
        Internet:      { emoji: "📶", tone: "tone-brand" },
        "Mobile Recharge": { emoji: "📱", tone: "tone-brand" },
        Transportation: { emoji: "🚕", tone: "tone-cyan" },
        Fuel:          { emoji: "⛽", tone: "tone-amber" },
        Shopping:      { emoji: "🛍️", tone: "tone-pink" },
        Clothing:      { emoji: "👕", tone: "tone-pink" },
        Healthcare:    { emoji: "🏥", tone: "tone-expense" },
        Medicine:      { emoji: "💊", tone: "tone-expense" },
        Education:     { emoji: "🎓", tone: "tone-brand" },
        Entertainment: { emoji: "🎬", tone: "tone-pink" },
        Travel:        { emoji: "✈️", tone: "tone-cyan" },
        Subscription:  { emoji: "📺", tone: "tone-pink" },
        "EMI / Loan":  { emoji: "🏦", tone: "tone-expense" },
        "Personal Care": { emoji: "🧴", tone: "tone-pink" },
        Pets:          { emoji: "🐶", tone: "tone-amber" },
        Charity:       { emoji: "❤️", tone: "tone-expense" },
        Family:        { emoji: "👨‍👩‍👧", tone: "tone-brand" },
        Maintenance:   { emoji: "🔧", tone: "tone-amber" },
        Gifts:         { emoji: "🎁", tone: "tone-pink" },
        "Other Expense": { emoji: "📦", tone: "tone-brand" }
    };


    function metaFor(category, type) {
        var meta = CATEGORY_META[category];

        if (meta) {
            return meta;
        }

        return type === "income"
            ? { emoji: "💰", tone: "tone-income" }
            : { emoji: "🧾", tone: "tone-expense" };
    }


    /* =====================================================
       TOASTS
    ===================================================== */

    function toastHost() {
        var host = document.getElementById("toastStack");

        if (!host) {
            host = document.createElement("div");

            host.id = "toastStack";
            host.className = "toast-stack";
            host.setAttribute("aria-live", "polite");

            document.body.appendChild(host);
        }

        return host;
    }


    function toast(message, type) {
        var host = toastHost();

        var card = document.createElement("div");

        card.className = "toast-card " + (type || "success");
        card.setAttribute("role", "status");

        var dot = document.createElement("span");
        dot.className = "toast-dot";

        var text = document.createElement("span");
        text.textContent = message;

        card.appendChild(dot);
        card.appendChild(text);

        host.appendChild(card);

        window.requestAnimationFrame(function () {
            card.classList.add("show");
        });

        window.setTimeout(function () {
            card.classList.remove("show");

            window.setTimeout(function () {
                card.remove();
            }, 340);
        }, 3400);
    }


    /* =====================================================
       CONFETTI
    ===================================================== */

    function burstConfetti(x, y) {
        if (reduceMotion) {
            return;
        }

        var colors = [
            "#5b4cf4", "#7c3aed", "#22c55e",
            "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"
        ];

        var originX = typeof x === "number" ? x : window.innerWidth / 2;
        var originY = typeof y === "number" ? y : window.innerHeight * 0.28;

        for (var i = 0; i < 34; i++) {
            var piece = document.createElement("span");

            piece.className = "confetti";

            var angle = Math.random() * Math.PI * 2;
            var distance = 70 + Math.random() * 220;

            piece.style.left = originX + "px";
            piece.style.top = originY + "px";
            piece.style.background = colors[i % colors.length];
            piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";

            piece.style.setProperty("--dx", Math.cos(angle) * distance + "px");
            piece.style.setProperty("--dy", Math.sin(angle) * distance + 90 + "px");
            piece.style.setProperty("--rot", Math.random() * 720 - 360 + "deg");

            piece.style.animationDelay = Math.random() * 120 + "ms";

            document.body.appendChild(piece);

            window.setTimeout(function (node) {
                return function () {
                    node.remove();
                };
            }(piece), 1400);
        }
    }


    window.SpendSmart = {
        toast: toast,
        confetti: burstConfetti,
        metaFor: metaFor
    };


    /* =====================================================
       ANIMATED COUNTERS
    ===================================================== */

    function animateCounters() {
        var nodes = document.querySelectorAll("[data-count]");

        Array.prototype.forEach.call(nodes, function (el) {
            var target = parseFloat(el.getAttribute("data-count"));

            if (isNaN(target)) {
                return;
            }

            var prefix = el.getAttribute("data-prefix");

            if (prefix === null) {
                prefix = "₹ ";
            }

            if (reduceMotion) {
                el.textContent = prefix + inr.format(target);
                return;
            }

            var duration = 950;
            var start = null;

            function step(timestamp) {
                if (start === null) {
                    start = timestamp;
                }

                var progress = Math.min(1, (timestamp - start) / duration);
                var eased = 1 - Math.pow(1 - progress, 3);
                var current = target * eased;

                el.textContent =
                    prefix + inr.format(Math.round(current * 100) / 100);

                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    el.textContent = prefix + inr.format(target);
                }
            }

            window.requestAnimationFrame(step);
        });
    }


    /* =====================================================
       REVEAL ON SCROLL
    ===================================================== */

    function setupReveal() {
        var nodes = document.querySelectorAll("[data-reveal]");

        if (!nodes.length) {
            return;
        }

        var list = Array.prototype.slice.call(nodes);

        function show(el) {
            el.classList.add("is-visible");
        }

        function showAll() {
            list.forEach(show);
        }

        if (
            reduceMotion ||
            document.hidden ||
            !("IntersectionObserver" in window)
        ) {
            showAll();
            return;
        }

        var revealedAny = false;

        /*
         * Fail open. Browsers throttle observers in background tabs, and
         * embedded previews may never deliver a callback at all, so make
         * sure the content becomes visible even if nothing intersects.
         */
        var guard = window.setTimeout(function () {
            if (!revealedAny) {
                showAll();
            }
        }, 900);

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }

                revealedAny = true;

                window.clearTimeout(guard);

                var el = entry.target;
                var delay = parseInt(el.getAttribute("data-reveal"), 10) || 0;

                window.setTimeout(function () {
                    show(el);
                }, delay);

                observer.unobserve(el);
            });
        }, {
            threshold: 0.08,
            rootMargin: "0px 0px -40px 0px"
        });

        list.forEach(function (el) {
            el.classList.add("reveal-pending");
            observer.observe(el);
        });
    }


    /* =====================================================
       RIPPLE
    ===================================================== */

    var RIPPLE_TARGETS =
        ".btn, .btn-cta, .save-btn, .filter-chip, .filter-btn, .quick-card, .amount-chip, .seg-btn";

    function setupRipple() {
        if (reduceMotion) {
            return;
        }

        document.addEventListener("pointerdown", function (event) {
            var target = event.target.closest(RIPPLE_TARGETS);

            if (!target) {
                return;
            }

            var rect = target.getBoundingClientRect();
            var size = Math.max(rect.width, rect.height);

            var ink = document.createElement("span");

            ink.className = "ripple-ink";

            ink.style.width = size + "px";
            ink.style.height = size + "px";
            ink.style.left = event.clientX - rect.left - size / 2 + "px";
            ink.style.top = event.clientY - rect.top - size / 2 + "px";

            target.appendChild(ink);

            window.setTimeout(function () {
                ink.remove();
            }, 640);
        });
    }


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    function setupActiveNav() {
        var path = window.location.pathname;

        var active = null;

        if (path === "/transactions") {
            active = "transactions";
        } else if (path === "/transaction/new") {
            active = "add";
        } else if (path.indexOf("/income/") !== -1) {
            active = "income-analytics";
        } else if (path.indexOf("/expense/") !== -1) {
            active = "expense-analytics";
        } else if (path.indexOf("/userdetail") !== -1) {
            active = "profile";
        } else if (path === "/transaction" || path === "/transaction/") {
            active = "dashboard";
        }

        if (!active) {
            return;
        }

        var items = document.querySelectorAll(
            ".nav-item[data-nav], .mobile-nav-item[data-nav]"
        );

        Array.prototype.forEach.call(items, function (item) {
            if (item.getAttribute("data-nav") === active) {
                item.classList.add("active");
                item.setAttribute("aria-current", "page");
            }
        });
    }


    /* =====================================================
       TRANSACTION CARD DECORATION
    ===================================================== */

    function decorateTransactions() {
        var cards = document.querySelectorAll("[data-txn]");

        Array.prototype.forEach.call(cards, function (card) {
            var category = card.getAttribute("data-category") || "";
            var type = card.getAttribute("data-type") || "expense";
            var meta = metaFor(category, type);

            card.classList.add(type === "income" ? "is-income" : "is-expense");

            var icon = card.querySelector(".txn-icon");

            if (icon) {
                icon.classList.add(meta.tone);
                icon.setAttribute("aria-hidden", "true");

                var emoji = icon.querySelector(".txn-emoji");

                if (emoji) {
                    emoji.textContent = meta.emoji;
                }
            }
        });
    }


    /* =====================================================
       FORM SUCCESS FLASH (survives the page reload)
    ===================================================== */

    var FLASH_KEY = "spendsmart:flash";

    /* A flash older than this is ignored, so a failed submit that
       never reached the next page cannot pop up much later. */
    var FLASH_MAX_AGE = 15000;

    var FLASH_TEXT = {
        added: "Transaction added 🎉",
        updated: "Transaction updated ✏️",
        deleted: "Transaction deleted 🗑️",
        saved: "Profile saved ✅",
        loggedin: "Welcome back 👋",
        signedup: "Account created 🎉"
    };

    function setupFormFlash() {
        var forms = document.querySelectorAll("form[data-success]");

        Array.prototype.forEach.call(forms, function (form) {
            form.addEventListener("submit", function () {
                var key = form.getAttribute("data-success");

                try {
                    window.sessionStorage.setItem(
                        FLASH_KEY,
                        JSON.stringify({ key: key, ts: Date.now() })
                    );
                } catch (err) {
                    /* storage can be blocked; ignore */
                }

                var button = form.querySelector("button[type='submit'], button:not([type])");

                if (button) {
                    button.disabled = true;

                    var label = button.getAttribute("data-busy") || "Saving…";

                    button.dataset.label = button.textContent;
                    button.textContent = label;

                    window.setTimeout(function () {
                        button.disabled = false;
                        button.textContent = button.dataset.label || label;
                    }, 4000);
                }
            });
        });

        var flash = null;

        try {
            flash = JSON.parse(window.sessionStorage.getItem(FLASH_KEY));

            window.sessionStorage.removeItem(FLASH_KEY);
        } catch (err) {
            flash = null;
        }

        if (!flash || !flash.key) {
            return;
        }

        if (!flash.ts || Date.now() - flash.ts > FLASH_MAX_AGE) {
            return;
        }

        toast(FLASH_TEXT[flash.key] || "Saved ✅", "success");

        if (flash.key === "added" || flash.key === "signedup") {
            burstConfetti();
        }
    }


    /* =====================================================
       HERO / PAGE MICRO-INTERACTIONS
    ===================================================== */

    function setupTilt() {
        if (reduceMotion) {
            return;
        }

        var cards = document.querySelectorAll(".summary-card");

        Array.prototype.forEach.call(cards, function (card) {
            card.addEventListener("pointermove", function (event) {
                var rect = card.getBoundingClientRect();

                var px = (event.clientX - rect.left) / rect.width - 0.5;
                var py = (event.clientY - rect.top) / rect.height - 0.5;

                card.style.transform =
                    "translateY(-5px) rotateX(" + (-py * 4).toFixed(2) + "deg) " +
                    "rotateY(" + (px * 4).toFixed(2) + "deg)";
            });

            card.addEventListener("pointerleave", function () {
                card.style.transform = "";
            });
        });
    }


    /* =====================================================
       BOOT
    ===================================================== */

    function boot() {
        setupActiveNav();
        decorateTransactions();
        animateCounters();
        setupReveal();
        setupRipple();
        setupFormFlash();
        setupTilt();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
}());
