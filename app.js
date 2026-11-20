// =========================================
// 1. Reusable Toast Notification Function (Activity 5)
// =========================================
function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");

    // Create toast container automatically if it doesn't exist
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

    // Trigger slide-in animation
    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    // Remove toast after 3.5 seconds
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

document.addEventListener("DOMContentLoaded", () => {
    // Ticket prices matching index.html schedule
    const matchPrices = {
        M01: { label: "M01: MI vs CSK", General: 800, Premium: 2500, VIP: 6000 },
        M02: { label: "M02: RCB vs KKR", General: 750, Premium: 2200, VIP: 5500 },
        M03: { label: "M03: MI vs RCB", General: 900, Premium: 2800, VIP: 6500 }
    };

    const bookingSection = document.getElementById("booking");
    const matchSelect = document.getElementById("match-select");
    const standSelect = document.getElementById("stand-select");
    const ticketQty = document.getElementById("ticket-qty");
    const bookingForm = document.getElementById("booking-form");
    const bookingsTbody = document.getElementById("bookings-tbody");
    const teamFilter = document.getElementById("team-filter");

    // Summary elements
    const sumMatch = document.getElementById("sum-match");
    const sumStand = document.getElementById("sum-stand");
    const sumPrice = document.getElementById("sum-price");
    const sumQty = document.getElementById("sum-qty");
    const sumTotal = document.getElementById("sum-total");

    // Helper: Update Booking Summary Card live
    function updateSummary() {
        if (!matchSelect || !standSelect || !ticketQty) return;

        const matchCode = matchSelect.value;
        const stand = standSelect.value;
        const qty = parseInt(ticketQty.value, 10) || 0;

        if (matchCode && matchPrices[matchCode]) {
            sumMatch.textContent = matchPrices[matchCode].label;
        } else {
            sumMatch.textContent = "-";
        }

        sumStand.textContent = stand || "-";
        sumQty.textContent = qty;

        const unitPrice =
            matchCode && stand && matchPrices[matchCode]
                ? matchPrices[matchCode][stand]
                : 0;

        sumPrice.textContent = unitPrice.toLocaleString("en-IN");
        sumTotal.textContent = (unitPrice * qty).toLocaleString("en-IN");
    }

    // =========================================
    // 2. Smooth Scrolling from Match Schedule "Book" Buttons (Activity 5)
    // =========================================
    const bookButtons = document.querySelectorAll(".schedule-table .btn-sm");

    bookButtons.forEach((btn) => {
        btn.addEventListener("click", (event) => {
            event.preventDefault();

            const row = btn.closest("tr");
            const matchCode = row ? row.cells[0].textContent.trim() : "";
            const matchName = row ? row.cells[1].textContent.trim() : "selected match";

            // Pre-select the clicked match in the booking form
            if (matchSelect && matchCode) {
                matchSelect.value = matchCode;
                updateSummary();
            }

            // Smoothly scroll to the booking section
            if (bookingSection) {
                bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }

            // Display confirmation toast
            showToast(`Selected ${matchCode}: ${matchName}. Complete your booking below!`, "info");
        });
    });

    // =========================================
    // 3. Team Filter for Match Schedule
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
    // 4. Live Summary & Populate "My Ticket Bookings" Table
    // =========================================
    if (matchSelect && standSelect && ticketQty) {
        matchSelect.addEventListener("change", updateSummary);
        standSelect.addEventListener("change", updateSummary);
        ticketQty.addEventListener("input", updateSummary);
    }

    let bookingCounter = 101;
    let hasBookings = false;

    if (bookingForm && bookingsTbody) {
        bookingForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const matchCode = matchSelect.value;
            const stand = standSelect.value;
            const qty = parseInt(ticketQty.value, 10);
            const unitPrice = matchPrices[matchCode] ? matchPrices[matchCode][stand] : 0;
            const total = unitPrice * qty;
            const bookingId = `IPL26-${bookingCounter++}`;

            // Clear the empty placeholder row on the first booking
            if (!hasBookings) {
                bookingsTbody.innerHTML = "";
                hasBookings = true;
            }

            // Insert new booking row
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
            updateSummary();
        });
    }

    // =========================================
    // 5. Dedicated booking.html Form Toast Support (Activity 3)
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