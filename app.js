// =========================================
// 1. Reusable Toast Notification Function (Activity 5 & 7)
// =========================================
function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");

    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

document.addEventListener("DOMContentLoaded", () => {
    const matchPrices = {
        M01: { label: "M01: Mumbai Indians vs Chennai Super Kings", General: 800, Premium: 2500, VIP: 6000 },
        M02: { label: "M02: RCB vs Kolkata Knight Riders", General: 750, Premium: 2200, VIP: 5500 },
        M03: { label: "M03: Mumbai Indians vs RCB", General: 900, Premium: 2800, VIP: 6500 },
        M04: { label: "M04: Gujarat Titans vs Delhi Capitals", General: 700, Premium: 2000, VIP: 5000 }
    };

    // =========================================
    // 2. Mobile Hamburger Menu Toggle (Activity 8)
    // =========================================
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const navLinks = document.getElementById("nav-links");

    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("open");
            hamburgerBtn.setAttribute("aria-expanded", String(isOpen));
            hamburgerBtn.innerHTML = isOpen ? "&times;" : "&#9776;";
        });

        // Close mobile menu when a link is clicked
        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("open");
                hamburgerBtn.setAttribute("aria-expanded", "false");
                hamburgerBtn.innerHTML = "&#9776;";
            });
        });
    }

    // =========================================
    // 3. Grid / List View Toggle for Match Cards (Activity 8)
    // =========================================
    const matchGrid = document.getElementById("match-grid");
    const gridViewBtn = document.getElementById("grid-view-btn");
    const listViewBtn = document.getElementById("list-view-btn");

    if (matchGrid && gridViewBtn && listViewBtn) {
        gridViewBtn.addEventListener("click", () => {
            matchGrid.classList.remove("list-view");
            gridViewBtn.classList.add("active");
            listViewBtn.classList.remove("active");
            showToast("Switched match schedule to Grid View.", "info");
        });

        listViewBtn.addEventListener("click", () => {
            matchGrid.classList.add("list-view");
            listViewBtn.classList.add("active");
            gridViewBtn.classList.remove("active");
            showToast("Switched match schedule to List View.", "info");
        });
    }

    // =========================================
    // 4. Filter Match Cards by Team (Activity 8)
    // =========================================
    const teamFilter = document.querySelector("#team-filter");

    if (teamFilter) {
        teamFilter.addEventListener("change", () => {
            const selectedTeam = teamFilter.value;
            const matchCards = document.querySelectorAll(".match-card");

            matchCards.forEach((card) => {
                const teams = card.getAttribute("data-team") || "";
                card.style.display =
                    selectedTeam === "all" || teams.includes(selectedTeam) ? "" : "none";
            });

            showToast(
                selectedTeam === "all"
                    ? "Showing all IPL 2026 matches."
                    : `Filtered matches for ${selectedTeam}.`,
                "info"
            );
        });
    }

    // =========================================
    // 5. DOM Selectors & Live Booking Summary (Activity 7)
    // =========================================
    const bookingSection = document.getElementById("booking");
    const bookingForm = document.getElementById("booking-form");
    const matchSelect = document.getElementById("match-select");
    const standSelect = document.querySelector("#stand-select");
    const ticketQty = document.querySelector("#ticket-qty");
    const bookingsTbody = document.getElementById("bookings-tbody");

    const sumMatch = document.querySelector("#sum-match");
    const sumStand = document.querySelector("#sum-stand");
    const sumPrice = document.querySelector("#sum-price");
    const sumQty = document.querySelector("#sum-qty");
    const sumTotal = document.querySelector("#sum-total");

    function updateSummary(notify = false) {
        if (!matchSelect || !standSelect || !ticketQty) return;

        const matchCode = matchSelect.value;
        const stand = standSelect.value;
        let qty = parseInt(ticketQty.value, 10);

        if (isNaN(qty) || qty < 1) {
            qty = 1;
        } else if (qty > 10) {
            qty = 10;
            ticketQty.value = 10;
        }

        const selectedMatch = matchPrices[matchCode];
        const unitPrice = selectedMatch && stand ? selectedMatch[stand] : 0;
        const totalAmount = unitPrice * qty;

        sumMatch.textContent = selectedMatch ? selectedMatch.label : "-";
        sumStand.textContent = stand || "-";
        sumPrice.textContent = unitPrice.toLocaleString("en-IN");
        sumQty.textContent = qty;
        sumTotal.textContent = totalAmount.toLocaleString("en-IN");

        if (notify) {
            if (selectedMatch && stand) {
                showToast(
                    `Summary updated: ${matchCode} (${stand} × ${qty}) — Total: ₹${totalAmount.toLocaleString("en-IN")}`,
                    "info"
                );
            } else {
                showToast("Booking summary updated. Select both match and stand to calculate total.", "info");
            }
        }
    }

    if (matchSelect && standSelect && ticketQty) {
        matchSelect.addEventListener("change", () => updateSummary(true));
        standSelect.addEventListener("change", () => updateSummary(true));
        ticketQty.addEventListener("change", () => updateSummary(true));
    }

    // =========================================
    // 6. Smooth Scrolling from Match Card "Book Ticket" Buttons (Activity 5)
    // =========================================
    const bookButtons = document.querySelectorAll(".book-match-btn");

    bookButtons.forEach((btn) => {
        btn.addEventListener("click", (event) => {
            event.preventDefault();

            const matchCode = btn.getAttribute("data-match") || "";
            const matchName = btn.getAttribute("data-match-name") || "selected match";

            if (matchSelect && matchCode) {
                matchSelect.value = matchCode;
                updateSummary(false);
            }

            if (bookingSection) {
                bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }

            showToast(`Selected ${matchCode}: ${matchName}. Choose your stand below!`, "info");
        });
    });

    // =========================================
    // 7. Confirm Booking & Add Row to "My Ticket Bookings"
    // =========================================
    let bookingCounter = 101;
    let hasBookings = false;

    if (bookingForm && bookingsTbody) {
        bookingForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const matchCode = matchSelect.value;
            const stand = standSelect.value;
            const qty = parseInt(ticketQty.value, 10) || 1;
            const unitPrice = matchPrices[matchCode] ? matchPrices[matchCode][stand] : 0;
            const total = unitPrice * qty;
            const bookingId = `IPL26-${bookingCounter++}`;

            if (!hasBookings) {
                bookingsTbody.innerHTML = "";
                hasBookings = true;
            }

            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td><strong>${bookingId}</strong></td>
                <td>${matchPrices[matchCode].label}</td>
                <td>${stand}</td>
                <td>${qty}</td>
                <td>₹${total.toLocaleString("en-IN")}</td>
                <td><span class="status-badge">Confirmed</span></td>
            `;
            bookingsTbody.appendChild(newRow);

            showToast(`Booking Confirmed! ID: ${bookingId} (₹${total.toLocaleString("en-IN")})`, "success");

            bookingForm.reset();
            updateSummary(false);
        });
    }

    // =========================================
    // 8. Dedicated booking.html Form Support (Activity 3)
    // =========================================
    const standaloneForm = document.getElementById("ticket-booking-form");
    if (standaloneForm) {
        standaloneForm.addEventListener("submit", (event) => {
            event.preventDefault();
            showToast("Ticket booking submitted successfully!", "success");
            standaloneForm.reset();
        });
    }
});