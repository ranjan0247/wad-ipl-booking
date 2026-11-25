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
    // Ticket prices matching index.html schedule
    const matchPrices = {
        M01: { label: "M01: Mumbai Indians vs Chennai Super Kings", General: 800, Premium: 2500, VIP: 6000 },
        M02: { label: "M02: RCB vs Kolkata Knight Riders", General: 750, Premium: 2200, VIP: 5500 },
        M03: { label: "M03: Mumbai Indians vs RCB", General: 900, Premium: 2800, VIP: 6500 }
    };

    // =========================================
    // 2. DOM Selectors (getElementById & querySelector - Activity 7)
    // =========================================
    const bookingSection = document.getElementById("booking");
    const bookingForm = document.getElementById("booking-form");
    const matchSelect = document.getElementById("match-select");
    const standSelect = document.querySelector("#stand-select");
    const ticketQty = document.querySelector("#ticket-qty");

    const bookingsTbody = document.getElementById("bookings-tbody");
    const teamFilter = document.querySelector("#team-filter");

    // Booking Summary Card elements
    const sumMatch = document.querySelector("#sum-match");
    const sumStand = document.querySelector("#sum-stand");
    const sumPrice = document.querySelector("#sum-price");
    const sumQty = document.querySelector("#sum-qty");
    const sumTotal = document.querySelector("#sum-total");

    // =========================================
    // 3. Live Booking Summary Calculation (Activity 7)
    // =========================================
    function updateSummary(notify = false) {
        if (!matchSelect || !standSelect || !ticketQty) return;

        const matchCode = matchSelect.value;
        const stand = standSelect.value;
        let qty = parseInt(ticketQty.value, 10);

        // Guard against invalid or empty quantity
        if (isNaN(qty) || qty < 1) {
            qty = 1;
        } else if (qty > 10) {
            qty = 10;
            ticketQty.value = 10;
        }

        const selectedMatch = matchPrices[matchCode];
        const unitPrice = selectedMatch && stand ? selectedMatch[stand] : 0;
        const totalAmount = unitPrice * qty;

        // Update Booking Summary Card DOM
        sumMatch.textContent = selectedMatch ? selectedMatch.label : "-";
        sumStand.textContent = stand || "-";
        sumPrice.textContent = unitPrice.toLocaleString("en-IN");
        sumQty.textContent = qty;
        sumTotal.textContent = totalAmount.toLocaleString("en-IN");

        // Confirm summary update via showToast()
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

    // Attach 'change' event listeners to Match, Stand, and Quantity controls
    if (matchSelect && standSelect && ticketQty) {
        matchSelect.addEventListener("change", () => updateSummary(true));
        standSelect.addEventListener("change", () => updateSummary(true));
        ticketQty.addEventListener("change", () => updateSummary(true));
    }

    // =========================================
    // 4. Smooth Scrolling from Match Schedule "Book" Buttons (Activity 5)
    // =========================================
    const bookButtons = document.querySelectorAll(".schedule-table .btn-sm");

    bookButtons.forEach((btn) => {
        btn.addEventListener("click", (event) => {
            event.preventDefault();

            const row = btn.closest("tr");
            const matchCode = row ? row.cells[0].textContent.trim() : "";
            const matchName = row ? row.cells[1].textContent.trim() : "selected match";

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
    // 5. Team Filter for Match Schedule
    // =========================================
    if (teamFilter) {
        teamFilter.addEventListener("change", () => {
            const selectedTeam = teamFilter.value;
            const rows = document.querySelectorAll(".schedule-table tbody tr[data-team]");

            rows.forEach((row) => {
                const teams = row.getAttribute("data-team") || "";
                row.style.display =
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
    // 6. Confirm Booking & Add Row to "My Ticket Bookings"
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
    // 7. Dedicated booking.html Form Toast Support (Activity 3)
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